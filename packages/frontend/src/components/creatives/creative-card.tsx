'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExclusionBadge } from './exclusion-badge';

interface CreativeCardProps {
  creative: any;
}

export function CreativeCard({ creative }: CreativeCardProps) {
  const imageUrl = creative.thumbnailUrl || creative.fileUrl || creative.signedUrl;
  const filename = creative.originalFilename || creative.filename || 'Untitled';
  const fileType = creative.fileType || creative.mimeType || '';
  const dimensions =
    creative.width && creative.height
      ? `${creative.width} x ${creative.height}`
      : null;

  return (
    <Card className="overflow-hidden group">
      <div className="relative aspect-square bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={filename}
            className="object-cover w-full h-full"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-muted-foreground/40 text-sm">
            No preview
          </div>
        )}
        {creative.isExcluded && (
          <ExclusionBadge reason={creative.exclusionReason || 'Excluded'} />
        )}
      </div>
      <CardContent className="p-3">
        <p className="text-sm font-medium truncate" title={filename}>
          {filename}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          {fileType && (
            <Badge variant="secondary" className="text-xs">
              {fileType.replace('image/', '').toUpperCase()}
            </Badge>
          )}
          {dimensions && (
            <span className="text-xs text-muted-foreground">{dimensions}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
