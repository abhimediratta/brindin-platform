'use client';

import { Badge } from '@/components/ui/badge';

interface FontSampleProps {
  font: {
    family: string;
    type: string;
    role: string;
    weight?: string | number;
  };
}

export function FontSample({ font }: FontSampleProps) {
  return (
    <div className="rounded-lg border p-4 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-semibold text-sm">{font.family}</span>
        <Badge variant="secondary" className="text-[10px] capitalize">
          {font.type}
        </Badge>
        <Badge variant="outline" className="text-[10px] capitalize">
          {font.role}
        </Badge>
        {font.weight && (
          <span className="text-xs text-muted-foreground">
            Weight: {font.weight}
          </span>
        )}
      </div>
      <p
        className="text-2xl leading-tight"
        style={{ fontFamily: font.family }}
      >
        Aa Bb Cc 123
      </p>
    </div>
  );
}
