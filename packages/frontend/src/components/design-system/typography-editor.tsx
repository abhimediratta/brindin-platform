'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const FONT_TYPES = ['serif', 'sans-serif', 'display', 'monospace', 'handwriting'];
const FONT_ROLES = ['heading', 'body', 'cta', 'caption', 'other'];

interface Font {
  family: string;
  type: string;
  role: string;
  weight?: string | number;
}

interface TypographyEditorProps {
  typography: { fonts: Font[]; guidelines?: string } | null;
  onChange: (updated: { fonts: Font[]; guidelines?: string }) => void;
}

export function TypographyEditor({ typography, onChange }: TypographyEditorProps) {
  const fonts = typography?.fonts ?? [];
  const guidelines = typography?.guidelines ?? '';

  const updateFont = (index: number, field: string, value: string) => {
    const updated = fonts.map((f, i) =>
      i === index ? { ...f, [field]: value } : f
    );
    onChange({ fonts: updated, guidelines });
  };

  const addFont = () => {
    onChange({
      fonts: [...fonts, { family: '', type: 'sans-serif', role: 'body' }],
      guidelines,
    });
  };

  const removeFont = (index: number) => {
    onChange({
      fonts: fonts.filter((_, i) => i !== index),
      guidelines,
    });
  };

  return (
    <div className="space-y-4">
      {fonts.map((font, i) => (
        <div key={i} className="flex items-end gap-3 rounded-lg border p-3 flex-wrap">
          <div className="space-y-1 flex-1 min-w-[150px]">
            <Label className="text-xs">Font Family</Label>
            <Input
              value={font.family}
              onChange={(e) => updateFont(i, 'family', e.target.value)}
              placeholder="e.g., Inter"
            />
          </div>

          <div className="space-y-1 min-w-[120px]">
            <Label className="text-xs">Type</Label>
            <Select
              value={font.type}
              onValueChange={(v) => updateFont(i, 'type', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    <span className="capitalize">{type}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1 min-w-[120px]">
            <Label className="text-xs">Role</Label>
            <Select
              value={font.role}
              onValueChange={(v) => updateFont(i, 'role', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    <span className="capitalize">{role}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1 w-24">
            <Label className="text-xs">Weight</Label>
            <Input
              value={font.weight ?? ''}
              onChange={(e) => updateFont(i, 'weight', e.target.value)}
              placeholder="400"
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeFont(i)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={addFont} className="gap-1">
        <Plus className="h-4 w-4" />
        Add Font
      </Button>

      <div className="space-y-1">
        <Label className="text-xs">Guidelines</Label>
        <Textarea
          value={guidelines}
          onChange={(e) => onChange({ fonts, guidelines: e.target.value })}
          placeholder="Typography guidelines..."
          rows={3}
        />
      </div>
    </div>
  );
}
