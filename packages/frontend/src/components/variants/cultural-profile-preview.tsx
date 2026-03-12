'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface CulturalProfilePreviewProps {
  profile: any;
}

const SECTIONS = [
  { key: 'typographyStyle', label: 'Typography Style' },
  { key: 'colorTendencies', label: 'Color Tendencies' },
  { key: 'layoutDensity', label: 'Layout Density' },
  { key: 'copyTone', label: 'Copy Tone' },
  { key: 'trustSignals', label: 'Trust Signals' },
  { key: 'visualGrammar', label: 'Visual Grammar' },
  { key: 'whatFails', label: 'What Fails' },
  { key: 'languageDevices', label: 'Language Devices' },
];

function renderValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground italic">Not specified</span>;
  }
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc list-inside space-y-1">
        {value.map((item, i) => (
          <li key={i} className="text-sm">
            {typeof item === 'object' ? JSON.stringify(item) : String(item)}
          </li>
        ))}
      </ul>
    );
  }
  if (typeof value === 'object') {
    return (
      <div className="space-y-1">
        {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
          <div key={k} className="text-sm">
            <span className="font-medium capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}:</span>{' '}
            <span className="text-muted-foreground">{String(v)}</span>
          </div>
        ))}
      </div>
    );
  }
  return <p className="text-sm">{String(value)}</p>;
}

export function CulturalProfilePreview({ profile }: CulturalProfilePreviewProps) {
  if (!profile) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        No profile data
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {SECTIONS.map(({ key, label }, idx) => {
        const value = profile[key];
        if (value === undefined) return null;

        return (
          <div key={key}>
            {idx > 0 && <Separator className="mb-4" />}
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold">{label}</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">{renderValue(value)}</CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
