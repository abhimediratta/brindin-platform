'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDesignSystem, updateDesignSystem, updateDesignSystemStatus } from '@/lib/api';

export function useDesignSystem(brandId: string) {
  return useQuery({
    queryKey: ['design-system', brandId],
    queryFn: () => getDesignSystem(brandId),
    enabled: !!brandId,
  });
}

export function useUpdateDesignSystem(brandId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates: Record<string, unknown>) => updateDesignSystem(brandId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['design-system', brandId] });
    },
  });
}

export function useUpdateDesignSystemStatus(brandId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: string) => updateDesignSystemStatus(brandId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['design-system', brandId] });
    },
  });
}
