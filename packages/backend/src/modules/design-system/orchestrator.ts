// Phase 2E — Pipeline Orchestrator
// Coordinates the 4-stage extraction pipeline: preprocessing → analysis → aggregation → synthesis

import {
  preprocessingQueue,
  colorExtractionQueue,
  visionAnalysisQueue,
} from '../../lib/queue.js';
import {
  publishProgress,
  initStageCounter,
  waitForStageCompletion,
  cleanupPipelineKeys,
} from '../../lib/redis-pubsub.js';
import { recordUsageEvent } from '../../lib/usage.js';
import { aggregateCreatives } from './aggregation.js';
import type { AnalyzedCreative, ColorAnalysis, VisionAnalysis } from './aggregation.js';
import { synthesizeDesignSystem } from './synthesis.js';
import {
  getBrand,
  getCreativesForBrand,
  getNonExcludedCreatives,
  getAnalyzedCreatives,
  updateExtractionJob,
  upsertDesignSystem,
} from './extraction.service.js';

const VISION_BATCH_SIZE = 4;
const MIN_CREATIVES_FOR_EXTRACTION = 3;

export async function runExtractionPipeline(
  jobId: string,
  brandId: string,
  orgId: string,
): Promise<void> {
  try {
    await updateExtractionJob(jobId, {
      status: 'processing',
      stage: 'preprocessing',
      startedAt: new Date(),
    });

    // ─── Stage 1: Preprocessing ────────────────────────────────────

    const allCreatives = await getCreativesForBrand(brandId);

    if (allCreatives.length === 0) {
      throw new Error('No creatives found for this brand. Upload images before extracting a design system.');
    }

    await updateExtractionJob(jobId, { totalImages: allCreatives.length });
    await initStageCounter(jobId, 'preprocessing', allCreatives.length);

    await publishProgress(jobId, {
      stage: 'preprocessing',
      progress: 0,
      message: `Preprocessing ${allCreatives.length} creatives…`,
    });

    // Enqueue each creative for preprocessing
    for (const creative of allCreatives) {
      await preprocessingQueue.add('preprocess', {
        creativeId: creative.id,
        brandId,
        s3Key: creative.fileUrl,
        fileType: creative.fileType,
        fileSizeBytes: creative.fileSizeBytes,
        jobId,
      });
    }

    await waitForStageCompletion(jobId, 'preprocessing');

    // Validate enough valid creatives remain
    const validCreatives = await getNonExcludedCreatives(brandId);
    const excludedCount = allCreatives.length - validCreatives.length;

    await updateExtractionJob(jobId, {
      processedImages: allCreatives.length,
      excludedImages: excludedCount,
    });

    if (validCreatives.length < MIN_CREATIVES_FOR_EXTRACTION) {
      throw new Error(
        `Only ${validCreatives.length} valid creatives after preprocessing (minimum ${MIN_CREATIVES_FOR_EXTRACTION}). Upload more images or check excluded creatives.`,
      );
    }

    await publishProgress(jobId, {
      stage: 'preprocessing',
      progress: 100,
      processedImages: allCreatives.length,
      excludedImages: excludedCount,
      message: `Preprocessing complete. ${validCreatives.length} valid, ${excludedCount} excluded.`,
    });

    // ─── Stage 2: Analysis (parallel color + vision) ───────────────

    await updateExtractionJob(jobId, { stage: 'analysis', progress: 0 });

    await publishProgress(jobId, {
      stage: 'analysis',
      progress: 0,
      message: `Analyzing ${validCreatives.length} creatives…`,
    });

    // Color extraction: one job per creative
    await initStageCounter(jobId, 'color-extraction', validCreatives.length);
    for (const creative of validCreatives) {
      await colorExtractionQueue.add('extract-color', {
        creativeId: creative.id,
        s3Key: creative.fileUrl,
        jobId,
      });
    }

    // Vision analysis: batched
    const visionBatches: { creativeIds: string[]; s3Keys: string[] }[] = [];
    for (let i = 0; i < validCreatives.length; i += VISION_BATCH_SIZE) {
      const batch = validCreatives.slice(i, i + VISION_BATCH_SIZE);
      visionBatches.push({
        creativeIds: batch.map((c) => c.id),
        s3Keys: batch.map((c) => c.fileUrl),
      });
    }

    // Total vision signals = one per creative (each creative signals in the batch handler)
    await initStageCounter(jobId, 'vision-analysis', validCreatives.length);
    for (const batch of visionBatches) {
      await visionAnalysisQueue.add('analyze-vision', {
        creativeIds: batch.creativeIds,
        s3Keys: batch.s3Keys,
        jobId,
        brandId,
        orgId,
      });
    }

    // Wait for both analysis stages to complete in parallel
    await Promise.all([
      waitForStageCompletion(jobId, 'color-extraction'),
      waitForStageCompletion(jobId, 'vision-analysis'),
    ]);

    // Validate analysis success rate
    const analyzedCreatives = await getAnalyzedCreatives(brandId);
    const analysisSuccessRate = analyzedCreatives.length / validCreatives.length;

    if (analysisSuccessRate < 0.5) {
      throw new Error(
        `Analysis success rate too low: ${analyzedCreatives.length}/${validCreatives.length} (${Math.round(analysisSuccessRate * 100)}%). More than 50% of creatives failed analysis.`,
      );
    }

    await publishProgress(jobId, {
      stage: 'analysis',
      progress: 100,
      message: `Analysis complete. ${analyzedCreatives.length}/${validCreatives.length} successfully analyzed.`,
    });

    // ─── Stage 3: Aggregation (inline) ─────────────────────────────

    await updateExtractionJob(jobId, { stage: 'aggregation', progress: 0 });
    await publishProgress(jobId, {
      stage: 'aggregation',
      progress: 0,
      message: 'Aggregating analysis results…',
    });

    // Cast DB rows to AnalyzedCreative[]
    const mapped: AnalyzedCreative[] = analyzedCreatives.map((row) => ({
      id: row.id,
      colorAnalysis: row.colorAnalysis as ColorAnalysis,
      analysis: row.analysis as VisionAnalysis,
    }));

    const aggregatedResult = aggregateCreatives(mapped);

    await publishProgress(jobId, {
      stage: 'aggregation',
      progress: 100,
      message: 'Aggregation complete.',
    });

    // ─── Stage 4: Synthesis (inline) ───────────────────────────────

    await updateExtractionJob(jobId, { stage: 'synthesis', progress: 0 });
    await publishProgress(jobId, {
      stage: 'synthesis',
      progress: 0,
      message: 'Synthesizing design system…',
    });

    const brand = await getBrand(brandId);

    const synthesisResult = await synthesizeDesignSystem({
      brandName: brand?.name ?? 'Unknown Brand',
      brandCategory: brand?.categoryVertical ?? null,
      aggregatedResult,
      totalCreatives: allCreatives.length,
      analyzedCreatives: analyzedCreatives.length,
      excludedCreatives: excludedCount,
      orgId,
      brandId,
    });

    const { output, confidenceScores, extractionMetadata } = synthesisResult;

    // Upsert design system into DB
    await upsertDesignSystem(brandId, {
      colorPalette: output.colorPalette,
      typography: output.typography,
      layoutStructures: output.layoutStructures,
      imageTreatment: output.imageTreatment,
      copyPatterns: output.copyPatterns,
      logoUsage: output.logoUsage,
      inconsistencyReport: output.inconsistencyReport,
      onboardingGuide: output.onboardingGuide,
      confidenceScores,
      extractionMetadata,
    });

    await publishProgress(jobId, {
      stage: 'synthesis',
      progress: 100,
      message: 'Design system synthesized.',
    });

    // ─── Completion ────────────────────────────────────────────────

    await updateExtractionJob(jobId, {
      status: 'completed',
      stage: 'completed',
      progress: 100,
      completedAt: new Date(),
    });

    await publishProgress(jobId, {
      stage: 'completed',
      progress: 100,
      message: 'Extraction pipeline complete.',
    });

    // Record usage event for the full extraction
    recordUsageEvent({
      orgId,
      brandId,
      eventType: 'extraction',
      eventSubtype: 'design-system-extraction',
      quantity: 1,
      unit: 'extraction',
      metadata: {
        totalImages: allCreatives.length,
        analyzedImages: analyzedCreatives.length,
        excludedImages: excludedCount,
        usedFallback: synthesisResult.usedFallback,
      },
    }).catch(console.error);

    // Cleanup Redis keys
    await cleanupPipelineKeys(jobId);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[orchestrator] Pipeline failed for job ${jobId}:`, message);

    await updateExtractionJob(jobId, {
      status: 'failed',
      errorMessage: message,
      completedAt: new Date(),
    }).catch(console.error);

    await publishProgress(jobId, {
      stage: 'failed',
      progress: 0,
      message: `Extraction failed: ${message}`,
    }).catch(console.error);

    await cleanupPipelineKeys(jobId).catch(console.error);

    throw error;
  }
}
