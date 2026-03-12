'use client';

import { CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
}

interface UploadProgressProps {
  uploads: UploadItem[];
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const statusConfig = {
  pending: { icon: Clock, label: 'Pending', variant: 'secondary' as const },
  uploading: { icon: Loader2, label: 'Uploading', variant: 'default' as const },
  complete: { icon: CheckCircle, label: 'Complete', variant: 'secondary' as const },
  error: { icon: XCircle, label: 'Error', variant: 'destructive' as const },
};

export function UploadProgress({ uploads }: UploadProgressProps) {
  if (uploads.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Uploads</h3>
      <div className="space-y-2">
        {uploads.map((upload) => {
          const config = statusConfig[upload.status];
          const Icon = config.icon;

          return (
            <div
              key={upload.id}
              className="flex items-center gap-3 rounded-md border p-3"
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0',
                  upload.status === 'uploading' && 'animate-spin',
                  upload.status === 'complete' && 'text-green-500',
                  upload.status === 'error' && 'text-destructive'
                )}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium truncate">
                    {upload.file.name}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {formatSize(upload.file.size)}
                    </span>
                    <Badge variant={config.variant} className="text-xs">
                      {config.label}
                    </Badge>
                  </div>
                </div>
                {(upload.status === 'uploading' || upload.status === 'pending') && (
                  <Progress value={upload.progress} className="h-1.5 mt-1.5" />
                )}
                {upload.error && (
                  <p className="text-xs text-destructive mt-1">{upload.error}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
