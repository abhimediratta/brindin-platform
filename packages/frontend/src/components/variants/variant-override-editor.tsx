'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useUpdateVariant } from '@/hooks/use-variants';

interface VariantOverrideEditorProps {
  variant: any;
  brandId: string;
  onSave?: () => void;
}

interface ColorEntry {
  hex: string;
  role: string;
}

interface FontEntry {
  family: string;
  type: string;
  role: string;
}

export function VariantOverrideEditor({ variant, brandId, onSave }: VariantOverrideEditorProps) {
  const updateVariant = useUpdateVariant(brandId);

  const [colorOverrides, setColorOverrides] = useState<ColorEntry[]>([]);
  const [typographyOverrides, setTypographyOverrides] = useState<FontEntry[]>([]);
  const [copyTone, setCopyTone] = useState('');
  const [ctaConventions, setCtaConventions] = useState<string[]>([]);
  const [newCta, setNewCta] = useState('');
  const [culturalNotes, setCulturalNotes] = useState('');

  useEffect(() => {
    if (variant) {
      setColorOverrides(variant.colorOverrides || []);
      setTypographyOverrides(variant.typographyOverrides || []);
      setCopyTone(variant.copyOverrides?.tone || '');
      setCtaConventions(variant.copyOverrides?.ctaConventions || []);
      setCulturalNotes(variant.culturalNotes || '');
    }
  }, [variant]);

  const handleSave = async () => {
    try {
      await updateVariant.mutateAsync({
        variantId: variant.id,
        overrides: {
          colorOverrides,
          typographyOverrides,
          copyOverrides: {
            tone: copyTone,
            ctaConventions,
          },
          culturalNotes,
        },
      });
      toast.success('Variant overrides saved');
      onSave?.();
    } catch (error) {
      toast.error('Failed to save overrides');
    }
  };

  // Color override helpers
  const addColor = () => setColorOverrides([...colorOverrides, { hex: '#000000', role: 'primary' }]);
  const removeColor = (idx: number) => setColorOverrides(colorOverrides.filter((_, i) => i !== idx));
  const updateColor = (idx: number, field: keyof ColorEntry, value: string) => {
    const updated = [...colorOverrides];
    updated[idx] = { ...updated[idx], [field]: value };
    setColorOverrides(updated);
  };

  // Typography override helpers
  const addFont = () => setTypographyOverrides([...typographyOverrides, { family: '', type: 'sans-serif', role: 'heading' }]);
  const removeFont = (idx: number) => setTypographyOverrides(typographyOverrides.filter((_, i) => i !== idx));
  const updateFont = (idx: number, field: keyof FontEntry, value: string) => {
    const updated = [...typographyOverrides];
    updated[idx] = { ...updated[idx], [field]: value };
    setTypographyOverrides(updated);
  };

  // CTA helpers
  const addCta = () => {
    if (newCta.trim()) {
      setCtaConventions([...ctaConventions, newCta.trim()]);
      setNewCta('');
    }
  };
  const removeCta = (idx: number) => setCtaConventions(ctaConventions.filter((_, i) => i !== idx));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Override Editor</CardTitle>
        <Button onClick={handleSave} disabled={updateVariant.isPending} size="sm">
          <Save className="h-4 w-4 mr-2" />
          {updateVariant.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="colors">
          <TabsList className="mb-4">
            <TabsTrigger value="colors">Color Overrides</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="copy">Copy</TabsTrigger>
            <TabsTrigger value="notes">Cultural Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="space-y-4">
            {colorOverrides.map((color, idx) => (
              <div key={idx} className="flex items-end gap-3">
                <div className="space-y-1 flex-1">
                  <Label className="text-xs">Hex Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color.hex}
                      onChange={(e) => updateColor(idx, 'hex', e.target.value)}
                      className="h-10 w-10 rounded border cursor-pointer"
                    />
                    <Input
                      value={color.hex}
                      onChange={(e) => updateColor(idx, 'hex', e.target.value)}
                      placeholder="#000000"
                    />
                  </div>
                </div>
                <div className="space-y-1 w-40">
                  <Label className="text-xs">Role</Label>
                  <Select value={color.role} onValueChange={(v) => updateColor(idx, 'role', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
                      <SelectItem value="accent">Accent</SelectItem>
                      <SelectItem value="background">Background</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeColor(idx)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addColor}>
              <Plus className="h-4 w-4 mr-2" /> Add Color
            </Button>
          </TabsContent>

          <TabsContent value="typography" className="space-y-4">
            {typographyOverrides.map((font, idx) => (
              <div key={idx} className="flex items-end gap-3">
                <div className="space-y-1 flex-1">
                  <Label className="text-xs">Font Family</Label>
                  <Input
                    value={font.family}
                    onChange={(e) => updateFont(idx, 'family', e.target.value)}
                    placeholder="e.g. Noto Sans Tamil"
                  />
                </div>
                <div className="space-y-1 w-32">
                  <Label className="text-xs">Type</Label>
                  <Select value={font.type} onValueChange={(v) => updateFont(idx, 'type', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="serif">Serif</SelectItem>
                      <SelectItem value="sans-serif">Sans-serif</SelectItem>
                      <SelectItem value="display">Display</SelectItem>
                      <SelectItem value="script">Script</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 w-32">
                  <Label className="text-xs">Role</Label>
                  <Select value={font.role} onValueChange={(v) => updateFont(idx, 'role', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="heading">Heading</SelectItem>
                      <SelectItem value="body">Body</SelectItem>
                      <SelectItem value="caption">Caption</SelectItem>
                      <SelectItem value="cta">CTA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeFont(idx)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addFont}>
              <Plus className="h-4 w-4 mr-2" /> Add Font
            </Button>
          </TabsContent>

          <TabsContent value="copy" className="space-y-4">
            <div className="space-y-2">
              <Label>Tone</Label>
              <Textarea
                value={copyTone}
                onChange={(e) => setCopyTone(e.target.value)}
                placeholder="Describe the copy tone for this region..."
                rows={3}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>CTA Conventions</Label>
              <div className="space-y-2">
                {ctaConventions.map((cta, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="flex-1 text-sm bg-muted px-3 py-2 rounded-md">{cta}</span>
                    <Button variant="ghost" size="icon" onClick={() => removeCta(idx)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newCta}
                  onChange={(e) => setNewCta(e.target.value)}
                  placeholder="Add CTA convention..."
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCta())}
                />
                <Button variant="outline" size="sm" onClick={addCta}>
                  <Plus className="h-4 w-4 mr-2" /> Add
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <div className="space-y-2">
              <Label>Cultural Notes</Label>
              <Textarea
                value={culturalNotes}
                onChange={(e) => setCulturalNotes(e.target.value)}
                placeholder="Add freeform notes about cultural considerations for this variant..."
                rows={8}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
