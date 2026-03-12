'use client';

import { LayoutGrid, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import { LayoutFrequencyChart } from './layout-frequency-chart';
import { cn } from '@/lib/utils';

interface LayoutPatternsViewerProps {
  layouts: {
    layouts: Array<{ type: string; frequency?: number; platforms?: string[] }>;
    dominantLayout?: string;
    guidelines?: string;
  } | null;
}

export function LayoutPatternsViewer({ layouts }: LayoutPatternsViewerProps) {
  if (!layouts || !layouts.layouts?.length) {
    return (
      <EmptyState
        icon={LayoutGrid}
        title="No Layout Patterns"
        description="No layout patterns have been extracted yet."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5" />
          Layout Patterns
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {layouts.layouts.map((layout, i) => {
            const isDominant = layout.type === layouts.dominantLayout;
            return (
              <div
                key={`${layout.type}-${i}`}
                className={cn(
                  'rounded-lg border p-4 space-y-2',
                  isDominant && 'border-primary bg-primary/5'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm capitalize">{layout.type}</span>
                  {isDominant && (
                    <Badge className="gap-1 text-[10px]">
                      <Star className="h-3 w-3" />
                      Dominant
                    </Badge>
                  )}
                </div>
                {layout.frequency != null && (
                  <div className="text-xs text-muted-foreground">
                    Frequency: {layout.frequency}%
                  </div>
                )}
                {layout.platforms && layout.platforms.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {layout.platforms.map((p) => (
                      <Badge key={p} variant="outline" className="text-[10px]">
                        {p}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <LayoutFrequencyChart layouts={layouts.layouts} />

        {layouts.guidelines && (
          <div className="rounded-md bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">{layouts.guidelines}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
