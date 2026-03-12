'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CopyPatternsEditorProps {
  patterns: {
    tone?: string;
    ctaConventions?: string[];
    languagePreferences?: Record<string, string>;
  } | null;
  onChange: (updated: {
    tone?: string;
    ctaConventions?: string[];
    languagePreferences?: Record<string, string>;
  }) => void;
}

export function CopyPatternsEditor({ patterns, onChange }: CopyPatternsEditorProps) {
  const tone = patterns?.tone ?? '';
  const ctaConventions = patterns?.ctaConventions ?? [];
  const languagePreferences = patterns?.languagePreferences ?? {};

  const updateCta = (index: number, value: string) => {
    const updated = ctaConventions.map((c, i) => (i === index ? value : c));
    onChange({ ...patterns, ctaConventions: updated });
  };

  const addCta = () => {
    onChange({ ...patterns, ctaConventions: [...ctaConventions, ''] });
  };

  const removeCta = (index: number) => {
    onChange({
      ...patterns,
      ctaConventions: ctaConventions.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label className="text-xs">Tone</Label>
        <Textarea
          value={tone}
          onChange={(e) => onChange({ ...patterns, tone: e.target.value })}
          placeholder="Describe the brand tone..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">CTA Conventions</Label>
        {ctaConventions.map((cta, i) => (
          <div key={i} className="flex gap-2">
            <Input
              value={cta}
              onChange={(e) => updateCta(i, e.target.value)}
              placeholder="e.g., Shop Now"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeCta(i)}
              className="text-destructive hover:text-destructive shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addCta} className="gap-1">
          <Plus className="h-4 w-4" />
          Add CTA
        </Button>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Language Preferences</Label>
        {Object.entries(languagePreferences).map(([key, value]) => (
          <div key={key} className="flex gap-2">
            <Input value={key} disabled className="w-40" />
            <Input
              value={value}
              onChange={(e) =>
                onChange({
                  ...patterns,
                  languagePreferences: {
                    ...languagePreferences,
                    [key]: e.target.value,
                  },
                })
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
