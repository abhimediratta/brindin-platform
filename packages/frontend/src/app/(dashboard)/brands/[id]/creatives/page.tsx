'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';
import { UploadZone } from '@/components/creatives/upload-zone';
import { UploadProgress } from '@/components/creatives/upload-progress';
import { CreativeGrid } from '@/components/creatives/creative-grid';
import { ExtractionTrigger } from '@/components/extraction/extraction-trigger';
import { ExtractionProgress } from '@/components/extraction/extraction-progress';
import { StageIndicator } from '@/components/extraction/stage-indicator';
import { JobStatusCard } from '@/components/extraction/job-status-card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

import { useCreatives } from '@/hooks/use-creatives';
import { useUpload } from '@/hooks/use-upload';
import { useTriggerExtraction } from '@/hooks/use-extraction';
import { useExtractionProgress } from '@/hooks/use-extraction-progress';

export default function CreativesPage() {
  const params = useParams();
  const brandId = params.id as string;
  const queryClient = useQueryClient();

  const { data: creativesData, isLoading } = useCreatives(brandId);
  const creatives = creativesData?.creatives ?? creativesData ?? [];
  const creativeList = Array.isArray(creatives) ? creatives : [];

  const {
    uploads,
    addFiles,
    startUpload,
    clearCompleted,
    hasPending,
    isUploading,
  } = useUpload();

  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const triggerExtraction = useTriggerExtraction(brandId);
  const { job, progress, stage, isComplete, error } = useExtractionProgress(
    brandId,
    currentJobId
  );

  const isExtracting = !!currentJobId && !isComplete;

  const handleFilesSelected = useCallback(
    (files: File[]) => {
      addFiles(files);
    },
    [addFiles]
  );

  const handleUpload = useCallback(async () => {
    try {
      await startUpload(brandId);
      queryClient.invalidateQueries({ queryKey: ['creatives', brandId] });
      toast.success('Upload complete');
    } catch {
      toast.error('Some uploads failed');
    }
  }, [startUpload, brandId, queryClient]);

  const handleTriggerExtraction = useCallback(async () => {
    try {
      const result = await triggerExtraction.mutateAsync();
      const jobId = result?.jobId ?? result?.id;
      if (jobId) {
        setCurrentJobId(jobId);
        toast.success('Extraction started');
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to start extraction'
      );
    }
  }, [triggerExtraction]);

  const hasCreatives = creativeList.length > 0;
  const hasUploads = uploads.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Creatives"
        description="Upload and manage brand creative assets"
        action={
          hasCreatives ? (
            <ExtractionTrigger
              brandId={brandId}
              onTriggered={handleTriggerExtraction}
              isExtracting={isExtracting}
              creativeCount={creativeList.length}
            />
          ) : undefined
        }
      />

      <UploadZone
        onFilesSelected={handleFilesSelected}
        disabled={isUploading}
      />

      {hasPending && !isUploading && (
        <div className="flex justify-end">
          <Button onClick={handleUpload} size="sm">
            Upload {uploads.filter((u) => u.status === 'pending').length} file(s)
          </Button>
        </div>
      )}

      {hasUploads && (
        <>
          <UploadProgress uploads={uploads} />
          {uploads.some((u) => u.status === 'complete') && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearCompleted}>
                Clear completed
              </Button>
            </div>
          )}
        </>
      )}

      {isExtracting && (
        <>
          <Separator />
          <div className="space-y-4">
            <ExtractionProgress
              progress={progress}
              stage={stage}
              status={job?.status ?? 'processing'}
            />
            <StageIndicator currentStage={stage} progress={progress} />
            <JobStatusCard job={job} />
          </div>
        </>
      )}

      {isComplete && error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          Extraction failed: {error}
        </div>
      )}

      {isComplete && !error && (
        <div className="rounded-md border border-green-500/50 bg-green-500/5 p-4 text-sm text-green-700">
          Extraction completed successfully.
        </div>
      )}

      <Separator />

      {isLoading ? (
        <CreativeGrid creatives={[]} isLoading />
      ) : hasCreatives ? (
        <CreativeGrid creatives={creativeList} />
      ) : (
        <EmptyState
          icon={ImageIcon}
          title="No creatives yet"
          description="Upload your brand creative assets to get started with design system extraction."
        />
      )}
    </div>
  );
}
