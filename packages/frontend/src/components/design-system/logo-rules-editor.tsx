'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LogoRulesEditorProps {
  rules: {
    preferredPosition?: string;
    sizeGuideline?: string;
    backgroundTreatment?: string;
  } | null;
  onChange: (updated: {
    preferredPosition?: string;
    sizeGuideline?: string;
    backgroundTreatment?: string;
  }) => void;
}

export function LogoRulesEditor({ rules, onChange }: LogoRulesEditorProps) {
  const current = rules ?? {};

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label className="text-xs">Preferred Position</Label>
        <Input
          value={current.preferredPosition ?? ''}
          onChange={(e) =>
            onChange({ ...current, preferredPosition: e.target.value })
          }
          placeholder="e.g., Top-left"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Size Guideline</Label>
        <Input
          value={current.sizeGuideline ?? ''}
          onChange={(e) =>
            onChange({ ...current, sizeGuideline: e.target.value })
          }
          placeholder="e.g., Max 20% of canvas width"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Background Treatment</Label>
        <Input
          value={current.backgroundTreatment ?? ''}
          onChange={(e) =>
            onChange({ ...current, backgroundTreatment: e.target.value })
          }
          placeholder="e.g., Clear space, no overlay"
        />
      </div>
    </div>
  );
}
