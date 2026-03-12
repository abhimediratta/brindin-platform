'use client';

import { MapPin, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const TIER_STYLES: Record<string, string> = {
  metro: 'bg-purple-100 text-purple-700 border-purple-200',
  tier1: 'bg-blue-100 text-blue-700 border-blue-200',
  tier2: 'bg-gray-100 text-gray-700 border-gray-200',
};

const REGION_NAMES: Record<string, string> = {
  TN: 'Tamil Nadu',
  WB: 'West Bengal',
  PB: 'Punjab',
  KL: 'Kerala',
  MH: 'Maharashtra',
  KA: 'Karnataka',
  GJ: 'Gujarat',
  DL: 'Delhi',
};

interface VariantCardProps {
  variant: any;
  onClick?: () => void;
}

export function VariantCard({ variant, onClick }: VariantCardProps) {
  const regionName = REGION_NAMES[variant.regionCode] || variant.regionCode;
  const tierStyle = TIER_STYLES[variant.tier] || TIER_STYLES.tier2;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md hover:border-primary/30',
        onClick && 'hover:ring-1 hover:ring-primary/20'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">{regionName}</span>
            <Badge variant="outline" className="text-xs">
              {variant.regionCode}
            </Badge>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm text-muted-foreground">{variant.language}</span>
          <Badge className={cn('text-xs border', tierStyle)} variant="outline">
            {variant.tier}
          </Badge>
        </div>

        {variant.status && (
          <div className="mt-3 flex items-center gap-1.5">
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                variant.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
              )}
            />
            <span className="text-xs text-muted-foreground capitalize">{variant.status}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
