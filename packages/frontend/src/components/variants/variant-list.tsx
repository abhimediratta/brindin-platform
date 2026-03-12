'use client';

import { Globe } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { VariantCard } from './variant-card';

interface VariantListProps {
  variants: any[];
  isLoading?: boolean;
  onSelect: (variant: any) => void;
}

function VariantListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-10" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-14" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-2 w-2 rounded-full" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function VariantList({ variants, isLoading, onSelect }: VariantListProps) {
  if (isLoading) {
    return <VariantListSkeleton />;
  }

  if (!variants || variants.length === 0) {
    return (
      <EmptyState
        icon={Globe}
        title="No regional variants"
        description="Create regional variants to adapt your design system for different markets"
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {variants.map((variant) => (
        <VariantCard key={variant.id} variant={variant} onClick={() => onSelect(variant)} />
      ))}
    </div>
  );
}
