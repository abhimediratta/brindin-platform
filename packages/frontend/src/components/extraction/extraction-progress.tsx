'use client';

import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ExtractionProgressProps {
  progress: number;
  stage: string;
  status: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600',
  processing: 'bg-blue-500/10 text-blue-600',
  completed: 'bg-green-500/10 text-green-600',
  failed: 'bg-red-500/10 text-red-600',
};

export function ExtractionProgress({
  progress,
  stage,
  status,
}: ExtractionProgressProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Extraction Progress</span>
          {stage && (
            <Badge variant="outline" className="text-xs capitalize">
              {stage}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {Math.round(progress)}%
          </span>
          <Badge
            className={cn(
              'text-xs capitalize',
              statusColors[status] || statusColors.pending
            )}
          >
            {status}
          </Badge>
        </div>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
