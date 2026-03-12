'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ConfidenceBadge } from './confidence-badge';

interface ColorSwatchProps {
  color: {
    hex: string;
    role: string;
    frequency?: number;
    confidence?: string;
  };
}

export function ColorSwatch({ color }: ColorSwatchProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(color.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors hover:bg-muted/50"
    >
      <div
        className="h-12 w-12 rounded-md border shadow-sm transition-transform group-hover:scale-105"
        style={{ backgroundColor: color.hex }}
      />
      <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
        {copied ? (
          <Check className="h-3 w-3 text-green-600" />
        ) : (
          <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
        {color.hex}
      </div>
      <Badge variant="secondary" className="text-[10px] capitalize">
        {color.role}
      </Badge>
      {color.frequency != null && (
        <div className="w-full">
          <div className="h-1.5 w-full rounded-full bg-secondary">
            <div
              className="h-1.5 rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(color.frequency, 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground">{color.frequency}%</span>
        </div>
      )}
      {color.confidence && (
        <ConfidenceBadge level={color.confidence as 'strong' | 'moderate' | 'emerging'} />
      )}
    </button>
  );
}
