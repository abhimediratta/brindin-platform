'use client';

import { Clock, Image, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface JobStatusCardProps {
  job: any;
}

function formatDuration(startedAt: string, completedAt?: string): string {
  const start = new Date(startedAt).getTime();
  const end = completedAt ? new Date(completedAt).getTime() : Date.now();
  const seconds = Math.floor((end - start) / 1000);

  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function JobStatusCard({ job }: JobStatusCardProps) {
  if (!job) return null;

  const totalImages = job.totalImages ?? job.imageCount ?? 0;
  const processedImages = job.processedImages ?? 0;
  const excludedImages = job.excludedImages ?? 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Job Details</CardTitle>
          <Badge
            variant={
              job.status === 'completed'
                ? 'default'
                : job.status === 'failed'
                  ? 'destructive'
                  : 'secondary'
            }
            className="capitalize"
          >
            {job.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {job.startedAt && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Started:</span>
            <span>{formatTime(job.startedAt)}</span>
            <span className="text-muted-foreground ml-auto">
              {formatDuration(job.startedAt, job.completedAt)}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <Image className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Images:</span>
          <span>
            {processedImages}/{totalImages} processed
          </span>
        </div>
        {excludedImages > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Excluded:</span>
            <span>{excludedImages}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
