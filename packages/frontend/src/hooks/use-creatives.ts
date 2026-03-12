'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCreatives, uploadCreative } from '@/lib/api';

export function useCreatives(brandId: string) {
  return useQuery({
    queryKey: ['creatives', brandId],
    queryFn: () => getCreatives(brandId),
    enabled: !!brandId,
  });
}

export function useUploadCreative(brandId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadCreative(brandId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creatives', brandId] });
    },
  });
}
