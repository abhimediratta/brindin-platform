'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDesignSystemVersions, createDesignSystemVersion, restoreDesignSystemVersion } from '@/lib/api';

export function useVersions(brandId: string) {
  return useQuery({
    queryKey: ['design-system-versions', brandId],
    queryFn: () => getDesignSystemVersions(brandId),
    enabled: !!brandId,
  });
}

export function useCreateVersion(brandId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => createDesignSystemVersion(brandId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['design-system-versions', brandId] });
    },
  });
}

export function useRestoreVersion(brandId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (versionId: string) => restoreDesignSystemVersion(brandId, versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['design-system', brandId] });
      queryClient.invalidateQueries({ queryKey: ['design-system-versions', brandId] });
    },
  });
}
