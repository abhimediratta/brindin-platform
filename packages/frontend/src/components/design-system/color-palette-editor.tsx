'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const COLOR_ROLES = ['primary', 'secondary', 'accent', 'background', 'text', 'cta', 'other'];

interface Color {
  hex: string;
  role: string;
  frequency?: number;
  confidence?: string;
}

interface ColorPaletteEditorProps {
  palette: { colors: Color[]; guidelines?: string } | null;
  onChange: (updated: { colors: Color[]; guidelines?: string }) => void;
}

export function ColorPaletteEditor({ palette, onChange }: ColorPaletteEditorProps) {
  const colors = palette?.colors ?? [];
  const guidelines = palette?.guidelines ?? '';

  const updateColor = (index: number, field: string, value: string | number) => {
    const updated = colors.map((c, i) =>
      i === index ? { ...c, [field]: value } : c
    );
    onChange({ colors: updated, guidelines });
  };

  const addColor = () => {
    onChange({
      colors: [...colors, { hex: '#000000', role: 'other' }],
      guidelines,
    });
  };

  const removeColor = (index: number) => {
    onChange({
      colors: colors.filter((_, i) => i !== index),
      guidelines,
    });
  };

  return (
    <div className="space-y-4">
      {colors.map((color, i) => (
        <div key={i} className="flex items-end gap-3 rounded-lg border p-3">
          <div className="space-y-1">
            <Label className="text-xs">Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color.hex}
                onChange={(e) => updateColor(i, 'hex', e.target.value)}
                className="h-10 w-10 cursor-pointer rounded border-0 p-0"
              />
              <Input
                value={color.hex}
                onChange={(e) => updateColor(i, 'hex', e.target.value)}
                className="w-28 font-mono text-sm"
                placeholder="#000000"
              />
            </div>
          </div>

          <div className="space-y-1 min-w-[120px]">
            <Label className="text-xs">Role</Label>
            <Select
              value={color.role}
              onValueChange={(v) => updateColor(i, 'role', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLOR_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    <span className="capitalize">{role}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1 flex-1 min-w-[100px]">
            <Label className="text-xs">Frequency: {color.frequency ?? 0}%</Label>
            <Slider
              value={[color.frequency ?? 0]}
              onValueChange={([v]) => updateColor(i, 'frequency', v)}
              max={100}
              step={1}
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeColor(i)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={addColor} className="gap-1">
        <Plus className="h-4 w-4" />
        Add Color
      </Button>

      <div className="space-y-1">
        <Label className="text-xs">Guidelines</Label>
        <Textarea
          value={guidelines}
          onChange={(e) => onChange({ colors, guidelines: e.target.value })}
          placeholder="Color usage guidelines..."
          rows={3}
        />
      </div>
    </div>
  );
}
