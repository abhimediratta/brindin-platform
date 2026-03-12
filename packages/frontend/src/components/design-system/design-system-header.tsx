'use client';

import { Eye, Pencil, ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const statusStyles: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  review: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
};

interface DesignSystemHeaderProps {
  designSystem: {
    status?: string;
    extractionMetadata?: {
      totalImages?: number;
      analyzedImages?: number;
      extractionDate?: string;
    };
  };
  isEditing: boolean;
  onToggleEdit: () => void;
}

export function DesignSystemHeader({
  designSystem,
  isEditing,
  onToggleEdit,
}: DesignSystemHeaderProps) {
  const status = designSystem.status ?? 'draft';
  const metadata = designSystem.extractionMetadata;

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Design System</h1>
          <Badge
            variant="outline"
            className={cn('capitalize', statusStyles[status])}
          >
            {status}
          </Badge>
        </div>
        {metadata && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <ImageIcon className="h-3.5 w-3.5" />
              {metadata.analyzedImages ?? 0} / {metadata.totalImages ?? 0} images analyzed
            </span>
            {metadata.extractionDate && (
              <span>
                Extracted: {new Date(metadata.extractionDate).toLocaleDateString()}
              </span>
            )}
          </div>
        )}
      </div>
      <Button variant="outline" onClick={onToggleEdit} className="gap-2">
        {isEditing ? (
          <>
            <Eye className="h-4 w-4" />
            View
          </>
        ) : (
          <>
            <Pencil className="h-4 w-4" />
            Edit
          </>
        )}
      </Button>
    </div>
  );
}
