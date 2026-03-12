'use client';

import { Badge } from '@/components/ui/badge';

interface ExclusionBadgeProps {
  reason: string;
}

export function ExclusionBadge({ reason }: ExclusionBadgeProps) {
  return (
    <Badge
      variant="destructive"
      className="absolute top-2 right-2 text-xs"
    >
      {reason}
    </Badge>
  );
}
