'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Globe, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';
import { VariantList } from '@/components/variants/variant-list';
import { CreateVariantDialog } from '@/components/variants/create-variant-dialog';
import { VariantOverrideEditor } from '@/components/variants/variant-override-editor';
import { useVariants } from '@/hooks/use-variants';

export default function VariantsPage() {
  const params = useParams();
  const brandId = params.id as string;

  const { data: variants, isLoading } = useVariants(brandId);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const hasVariants = variants && variants.length > 0;

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Regional Variants"
        description="Adapt your design system for different regional markets"
        action={
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Variant
          </Button>
        }
      />

      <Separator />

      {!isLoading && !hasVariants ? (
        <EmptyState
          icon={Globe}
          title="No regional variants"
          description="Create regional variants to adapt your design system for different markets"
          action={
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Variant
            </Button>
          }
        />
      ) : (
        <VariantList
          variants={variants || []}
          isLoading={isLoading}
          onSelect={setSelectedVariant}
        />
      )}

      {selectedVariant && (
        <>
          <Separator />
          <VariantOverrideEditor
            variant={selectedVariant}
            brandId={brandId}
            onSave={() => setSelectedVariant(null)}
          />
        </>
      )}

      <CreateVariantDialog
        brandId={brandId}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}
