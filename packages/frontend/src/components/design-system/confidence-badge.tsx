'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ConfidenceBadgeProps {
  level: 'strong' | 'moderate' | 'emerging';
}

const levelStyles: Record<string, string> = {
  strong: 'bg-green-100 text-green-800 border-green-200',
  moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  emerging: 'bg-blue-100 text-blue-800 border-blue-200',
};

export function ConfidenceBadge({ level }: ConfidenceBadgeProps) {
  return (
    <Badge variant="outline" className={cn('capitalize', levelStyles[level])}>
      {level}
    </Badge>
  );
}
