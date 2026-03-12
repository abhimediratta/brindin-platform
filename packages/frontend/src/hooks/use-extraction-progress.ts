'use client';

import { useMemo } from 'react';
import { useExtractionJob } from './use-extraction';
import { useWebSocket } from './use-websocket';

const WS_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(
  /^http/,
  'ws'
);

interface ExtractionProgressReturn {
  job: any;
  progress: number;
  stage: string;
  isComplete: boolean;
  error: string | null;
}

export function useExtractionProgress(
  brandId: string,
  jobId: string | null
): ExtractionProgressReturn {
  const wsUrl = jobId ? `${WS_BASE}/ws/jobs/${jobId}` : null;
  const { lastMessage, error: wsError } = useWebSocket(wsUrl);
  const { data: polledJob } = useExtractionJob(brandId, jobId);

  return useMemo(() => {
    const wsJob = lastMessage as any;
    const job = wsJob?.jobId ? wsJob : polledJob;

    if (!job) {
      return {
        job: null,
        progress: 0,
        stage: '',
        isComplete: false,
        error: wsError,
      };
    }

    const progress = job.progress ?? 0;
    const stage = job.currentStage ?? job.stage ?? '';
    const status = job.status ?? '';
    const isComplete = status === 'completed' || status === 'failed';
    const error = status === 'failed' ? (job.error ?? 'Extraction failed') : wsError;

    return { job, progress, stage, isComplete, error };
  }, [lastMessage, polledJob, wsError]);
}
