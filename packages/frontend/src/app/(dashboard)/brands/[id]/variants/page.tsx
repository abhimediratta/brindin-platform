'use client';

import { Globe } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';

export default function VariantsPage() {
  return (
    <EmptyState
      icon={Globe}
      title="Regional Variants"
      description="Create and manage regional design system variants. Full implementation coming in the next phase."
    />
  );
}
