'use client';

import { Type } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/empty-state';
import { FontSample } from './font-sample';

interface TypographyViewerProps {
  typography: {
    fonts: Array<{ family: string; type: string; role: string; weight?: string | number }>;
    sizeHierarchy?: Record<string, string>;
    guidelines?: string;
  } | null;
}

export function TypographyViewer({ typography }: TypographyViewerProps) {
  if (!typography || !typography.fonts?.length) {
    return (
      <EmptyState
        icon={Type}
        title="No Typography"
        description="No typography data has been extracted yet."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="h-5 w-5" />
          Typography
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {typography.fonts.map((font, i) => (
            <FontSample key={`${font.family}-${i}`} font={font} />
          ))}
        </div>
        {typography.sizeHierarchy && Object.keys(typography.sizeHierarchy).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Size Hierarchy</h4>
            <div className="grid gap-1">
              {Object.entries(typography.sizeHierarchy).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-muted-foreground capitalize">{key}</span>
                  <span className="font-mono">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {typography.guidelines && (
          <div className="rounded-md bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">{typography.guidelines}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
