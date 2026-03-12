import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBrands, getBrand, createBrand } from '@/lib/api';

export function useBrands() {
  return useQuery({ queryKey: ['brands'], queryFn: getBrands });
}

export function useBrand(id: string) {
  return useQuery({ queryKey: ['brands', id], queryFn: () => getBrand(id), enabled: !!id });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBrand,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['brands'] }); },
  });
}
