'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVariants, createVariant, updateVariant } from '@/lib/api';

export function useVariants(brandId: string) {
  return useQuery({
    queryKey: ['variants', brandId],
    queryFn: () => getVariants(brandId),
    enabled: !!brandId,
  });
}

export function useCreateVariant(brandId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { regionCode: string; language: string; tier: string }) =>
      createVariant(brandId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants', brandId] });
    },
  });
}

export function useUpdateVariant(brandId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ variantId, overrides }: { variantId: string; overrides: Record<string, unknown> }) =>
      updateVariant(brandId, variantId, overrides),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants', brandId] });
    },
  });
}
