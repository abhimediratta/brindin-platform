'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { triggerExtraction, getExtractionJob } from '@/lib/api';

export function useExtractionJob(brandId: string, jobId: string | null) {
  return useQuery({
    queryKey: ['extraction-job', brandId, jobId],
    queryFn: () => getExtractionJob(brandId, jobId!),
    enabled: !!brandId && !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === 'completed' || data?.status === 'failed') return false;
      return 3000;
    },
  });
}

export function useTriggerExtraction(brandId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => triggerExtraction(brandId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extraction-job', brandId] });
      queryClient.invalidateQueries({ queryKey: ['design-system', brandId] });
    },
  });
}
