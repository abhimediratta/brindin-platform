'use client';

import { Palette } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';

export default function DesignSystemPage() {
  return (
    <EmptyState
      icon={Palette}
      title="Design System"
      description="View and manage the extracted design system. Full implementation coming in the next phase."
    />
  );
}
