'use client';

import { ImageIcon } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';

export default function CreativesPage() {
  return (
    <EmptyState
      icon={ImageIcon}
      title="Creatives"
      description="Upload and manage brand creative assets. Full implementation coming in the next phase."
    />
  );
}
