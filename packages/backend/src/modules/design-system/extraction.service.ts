// Phase 2E — Extraction Service
// DB operations for the extraction pipeline

import { eq, and, notInArray, isNotNull } from 'drizzle-orm';
import { db } from '../../db/index.js';
import {
  extractionJobs,
  brandCreatives,
  designSystems,
  brands,
} from '../../db/schema.js';

// ─── Extraction Jobs ──────────────────────────────────────────────────

export async function createExtractionJob(brandId: string) {
  const [job] = await db
    .insert(extractionJobs)
    .values({ brandId, status: 'queued' })
    .returning();
  return job;
}

export async function getExtractionJob(jobId: string) {
  const [job] = await db
    .select()
    .from(extractionJobs)
    .where(eq(extractionJobs.id, jobId));
  return job ?? null;
}

export async function getActiveExtractionJob(brandId: string) {
  const [job] = await db
    .select()
    .from(extractionJobs)
    .where(
      and(
        eq(extractionJobs.brandId, brandId),
        notInArray(extractionJobs.status, ['completed', 'failed']),
      ),
    );
  return job ?? null;
}

export async function updateExtractionJob(
  jobId: string,
  updates: Partial<{
    status: string;
    stage: string;
    progress: number;
    totalImages: number;
    processedImages: number;
    excludedImages: number;
    errorMessage: string;
    startedAt: Date;
    completedAt: Date;
  }>,
) {
  const [job] = await db
    .update(extractionJobs)
    .set(updates)
    .where(eq(extractionJobs.id, jobId))
    .returning();
  return job;
}

// ─── Brand Creatives ──────────────────────────────────────────────────

export async function getCreativesForBrand(brandId: string) {
  return db
    .select()
    .from(brandCreatives)
    .where(eq(brandCreatives.brandId, brandId));
}

export async function getNonExcludedCreatives(brandId: string) {
  return db
    .select()
    .from(brandCreatives)
    .where(
      and(
        eq(brandCreatives.brandId, brandId),
        eq(brandCreatives.isExcluded, false),
      ),
    );
}

export async function getAnalyzedCreatives(brandId: string) {
  return db
    .select()
    .from(brandCreatives)
    .where(
      and(
        eq(brandCreatives.brandId, brandId),
        eq(brandCreatives.isExcluded, false),
        isNotNull(brandCreatives.colorAnalysis),
        isNotNull(brandCreatives.analysis),
      ),
    );
}

// ─── Design Systems ───────────────────────────────────────────────────

export async function getDesignSystemByBrand(brandId: string) {
  const [ds] = await db
    .select()
    .from(designSystems)
    .where(eq(designSystems.brandId, brandId));
  return ds ?? null;
}

export async function upsertDesignSystem(
  brandId: string,
  data: {
    colorPalette: unknown;
    typography: unknown;
    layoutStructures: unknown;
    imageTreatment: unknown;
    copyPatterns: unknown;
    logoUsage: unknown;
    inconsistencyReport: unknown;
    onboardingGuide: unknown;
    confidenceScores: unknown;
    extractionMetadata: unknown;
  },
) {
  const existing = await getDesignSystemByBrand(brandId);

  // onboardingGuide column is text, so stringify the object
  const onboardingGuideStr =
    typeof data.onboardingGuide === 'string'
      ? data.onboardingGuide
      : JSON.stringify(data.onboardingGuide);

  if (existing) {
    const [updated] = await db
      .update(designSystems)
      .set({
        colorPalette: data.colorPalette,
        typography: data.typography,
        layoutStructures: data.layoutStructures,
        imageTreatment: data.imageTreatment,
        copyPatterns: data.copyPatterns,
        logoUsage: data.logoUsage,
        inconsistencyReport: data.inconsistencyReport,
        onboardingGuide: onboardingGuideStr,
        confidenceScores: data.confidenceScores,
        extractionMetadata: data.extractionMetadata,
        version: (existing.version ?? 1) + 1,
        status: 'active',
        updatedAt: new Date(),
      })
      .where(eq(designSystems.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(designSystems)
    .values({
      brandId,
      colorPalette: data.colorPalette,
      typography: data.typography,
      layoutStructures: data.layoutStructures,
      imageTreatment: data.imageTreatment,
      copyPatterns: data.copyPatterns,
      logoUsage: data.logoUsage,
      inconsistencyReport: data.inconsistencyReport,
      onboardingGuide: onboardingGuideStr,
      confidenceScores: data.confidenceScores,
      extractionMetadata: data.extractionMetadata,
      status: 'active',
    })
    .returning();
  return created;
}

// ─── Brands ───────────────────────────────────────────────────────────

export async function getBrand(brandId: string) {
  const [brand] = await db
    .select()
    .from(brands)
    .where(eq(brands.id, brandId));
  return brand ?? null;
}
