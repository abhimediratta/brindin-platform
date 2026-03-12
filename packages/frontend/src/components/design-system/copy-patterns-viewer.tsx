'use client';

import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';

interface CopyPatternsViewerProps {
  patterns: {
    tone?: string;
    ctaConventions?: string[];
    structurePreferences?: Record<string, string>;
    languagePreferences?: Record<string, string>;
  } | null;
}

export function CopyPatternsViewer({ patterns }: CopyPatternsViewerProps) {
  if (!patterns) {
    return (
      <EmptyState
        icon={FileText}
        title="No Copy Patterns"
        description="No copy patterns have been extracted yet."
      />
    );
  }

  const hasContent =
    patterns.tone ||
    patterns.ctaConventions?.length ||
    (patterns.structurePreferences && Object.keys(patterns.structurePreferences).length) ||
    (patterns.languagePreferences && Object.keys(patterns.languagePreferences).length);

  if (!hasContent) {
    return (
      <EmptyState
        icon={FileText}
        title="No Copy Patterns"
        description="No copy patterns have been extracted yet."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Copy Patterns
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {patterns.tone && (
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Tone</h4>
            <p className="text-sm text-muted-foreground">{patterns.tone}</p>
          </div>
        )}

        {patterns.ctaConventions && patterns.ctaConventions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">CTA Conventions</h4>
            <div className="flex flex-wrap gap-2">
              {patterns.ctaConventions.map((cta, i) => (
                <Badge key={i} variant="secondary">
                  {cta}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {patterns.structurePreferences &&
          Object.keys(patterns.structurePreferences).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Structure Preferences</h4>
              <div className="grid gap-1">
                {Object.entries(patterns.structurePreferences).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        {patterns.languagePreferences &&
          Object.keys(patterns.languagePreferences).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Language Preferences</h4>
              <div className="grid gap-1">
                {Object.entries(patterns.languagePreferences).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
