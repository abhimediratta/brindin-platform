'use client';

import { Palette } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/empty-state';
import { ColorSwatch } from './color-swatch';

interface ColorPaletteViewerProps {
  palette: {
    colors: Array<{ hex: string; role: string; frequency?: number; confidence?: string }>;
    guidelines?: string;
  } | null;
}

export function ColorPaletteViewer({ palette }: ColorPaletteViewerProps) {
  if (!palette || !palette.colors?.length) {
    return (
      <EmptyState
        icon={Palette}
        title="No Color Palette"
        description="No colors have been extracted yet."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Color Palette
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {palette.colors.map((color, i) => (
            <ColorSwatch key={`${color.hex}-${i}`} color={color} />
          ))}
        </div>
        {palette.guidelines && (
          <div className="rounded-md bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">{palette.guidelines}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
