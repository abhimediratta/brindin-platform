'use client';
import { useQuery } from '@tanstack/react-query';
import { getRegions, getRegion } from '@/lib/api';

export function useRegions() {
  return useQuery({
    queryKey: ['cultural-regions'],
    queryFn: getRegions,
  });
}

export function useRegion(code: string) {
  return useQuery({
    queryKey: ['cultural-regions', code],
    queryFn: () => getRegion(code),
    enabled: !!code,
  });
}
