'use client';

import { Image } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/empty-state';

interface LogoRulesViewerProps {
  rules: {
    preferredPosition?: string;
    sizeGuideline?: string;
    backgroundTreatment?: string;
  } | null;
}

export function LogoRulesViewer({ rules }: LogoRulesViewerProps) {
  if (!rules) {
    return (
      <EmptyState
        icon={Image}
        title="No Logo Rules"
        description="No logo usage rules have been extracted yet."
      />
    );
  }

  const entries = [
    { label: 'Preferred Position', value: rules.preferredPosition },
    { label: 'Size Guideline', value: rules.sizeGuideline },
    { label: 'Background Treatment', value: rules.backgroundTreatment },
  ].filter((e) => e.value);

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={Image}
        title="No Logo Rules"
        description="No logo usage rules have been extracted yet."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Logo Usage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-3">
          {entries.map(({ label, value }) => (
            <div key={label} className="rounded-lg border p-4 space-y-1">
              <h4 className="text-xs font-semibold text-muted-foreground">{label}</h4>
              <p className="text-sm">{value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
