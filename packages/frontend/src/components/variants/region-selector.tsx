'use client';

import { MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const REGION_META: Record<string, { name: string; languages: string[] }> = {
  TN: { name: 'Tamil Nadu', languages: ['Tamil', 'English'] },
  WB: { name: 'West Bengal', languages: ['Bengali', 'English'] },
  PB: { name: 'Punjab', languages: ['Punjabi', 'Hindi'] },
  KL: { name: 'Kerala', languages: ['Malayalam', 'English'] },
  MH: { name: 'Maharashtra', languages: ['Marathi', 'Hindi'] },
  KA: { name: 'Karnataka', languages: ['Kannada', 'English'] },
  GJ: { name: 'Gujarat', languages: ['Gujarati', 'Hindi'] },
  DL: { name: 'Delhi', languages: ['Hindi', 'English'] },
};

interface RegionSelectorProps {
  regions: any[];
  selectedCode: string | null;
  onSelect: (code: string) => void;
}

export function RegionSelector({ regions, selectedCode, onSelect }: RegionSelectorProps) {
  const regionCodes = regions?.length
    ? regions.map((r: any) => r.code || r.regionCode)
    : Object.keys(REGION_META);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {regionCodes.map((code: string) => {
        const meta = REGION_META[code] || { name: code, languages: [] };
        const isSelected = selectedCode === code;

        return (
          <Card
            key={code}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              isSelected
                ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                : 'hover:border-primary/30'
            )}
            onClick={() => onSelect(code)}
          >
            <CardContent className="p-3 text-center">
              <MapPin
                className={cn(
                  'h-5 w-5 mx-auto mb-1',
                  isSelected ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              <div className="font-semibold text-sm">{code}</div>
              <div className="text-xs text-muted-foreground">{meta.name}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {meta.languages.join(', ')}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
