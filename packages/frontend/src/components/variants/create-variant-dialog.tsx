'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useRegions, useRegion } from '@/hooks/use-cultural-regions';
import { useCreateVariant } from '@/hooks/use-variants';
import { RegionSelector } from './region-selector';
import { CulturalProfilePreview } from './cultural-profile-preview';

interface CreateVariantDialogProps {
  brandId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateVariantDialog({ brandId, open, onOpenChange }: CreateVariantDialogProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [language, setLanguage] = useState('');
  const [tier, setTier] = useState('');

  const { data: regions } = useRegions();
  const { data: regionProfile } = useRegion(selectedRegion || '');
  const createVariant = useCreateVariant(brandId);

  const handleSubmit = async () => {
    if (!selectedRegion || !language || !tier) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await createVariant.mutateAsync({
        regionCode: selectedRegion,
        language,
        tier,
      });
      toast.success('Regional variant created successfully');
      setSelectedRegion(null);
      setLanguage('');
      setTier('');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to create variant');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedRegion(null);
      setLanguage('');
      setTier('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Regional Variant</DialogTitle>
          <DialogDescription>
            Select a region and configure variant settings for localized creative production.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Select Region</Label>
            <RegionSelector
              regions={regions || []}
              selectedCode={selectedRegion}
              onSelect={setSelectedRegion}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                placeholder="e.g. Tamil, Hindi, Bengali"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tier">Tier</Label>
              <Select value={tier} onValueChange={setTier}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metro">Metro</SelectItem>
                  <SelectItem value="tier1">Tier 1</SelectItem>
                  <SelectItem value="tier2">Tier 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedRegion && regionProfile && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label>Cultural Profile Preview</Label>
                <CulturalProfilePreview profile={regionProfile} />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedRegion || !language || !tier || createVariant.isPending}
          >
            {createVariant.isPending ? 'Creating...' : 'Create Variant'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
