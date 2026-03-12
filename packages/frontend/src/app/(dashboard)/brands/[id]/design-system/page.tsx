'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Palette, Save } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { EmptyState } from '@/components/empty-state';

import {
  useDesignSystem,
  useUpdateDesignSystem,
  useUpdateDesignSystemStatus,
} from '@/hooks/use-design-system';

import { DesignSystemHeader } from '@/components/design-system/design-system-header';
import { ApprovalWorkflow } from '@/components/design-system/approval-workflow';
import { ColorPaletteViewer } from '@/components/design-system/color-palette-viewer';
import { TypographyViewer } from '@/components/design-system/typography-viewer';
import { LayoutPatternsViewer } from '@/components/design-system/layout-patterns-viewer';
import { CopyPatternsViewer } from '@/components/design-system/copy-patterns-viewer';
import { LogoRulesViewer } from '@/components/design-system/logo-rules-viewer';
import { ColorPaletteEditor } from '@/components/design-system/color-palette-editor';
import { TypographyEditor } from '@/components/design-system/typography-editor';
import { CopyPatternsEditor } from '@/components/design-system/copy-patterns-editor';
import { LogoRulesEditor } from '@/components/design-system/logo-rules-editor';
import { VersionHistory } from '@/components/design-system/version-history';

export default function DesignSystemPage() {
  const params = useParams();
  const brandId = params.id as string;

  const { data: designSystem, isLoading, error } = useDesignSystem(brandId);
  const updateDesignSystem = useUpdateDesignSystem(brandId);
  const updateStatus = useUpdateDesignSystemStatus(brandId);

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Record<string, unknown> | null>(null);

  const handleToggleEdit = useCallback(() => {
    if (!isEditing && designSystem) {
      // Deep clone current data for editing
      setEditedData(JSON.parse(JSON.stringify({
        colorPalette: designSystem.colorPalette ?? null,
        typography: designSystem.typography ?? null,
        copyPatterns: designSystem.copyPatterns ?? null,
        logoUsage: designSystem.logoUsage ?? null,
      })));
    } else {
      setEditedData(null);
    }
    setIsEditing((prev) => !prev);
  }, [isEditing, designSystem]);

  const handleSave = () => {
    if (!editedData) return;

    // Compute changed fields only
    const changes: Record<string, unknown> = {};
    for (const key of Object.keys(editedData)) {
      if (
        JSON.stringify(editedData[key]) !==
        JSON.stringify(designSystem?.[key as keyof typeof designSystem])
      ) {
        changes[key] = editedData[key];
      }
    }

    if (Object.keys(changes).length === 0) {
      toast.info('No changes to save');
      setIsEditing(false);
      setEditedData(null);
      return;
    }

    updateDesignSystem.mutate(changes, {
      onSuccess: () => {
        toast.success('Design system updated successfully');
        setIsEditing(false);
        setEditedData(null);
      },
      onError: (err) => {
        toast.error(err.message || 'Failed to update design system');
      },
    });
  };

  const handleStatusChange = (newStatus: string) => {
    updateStatus.mutate(newStatus, {
      onSuccess: () => toast.success(`Status changed to ${newStatus}`),
      onError: (err) => toast.error(err.message || 'Failed to update status'),
    });
  };

  const updateField = (field: string, value: unknown) => {
    setEditedData((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-48" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (error || !designSystem) {
    return (
      <EmptyState
        icon={Palette}
        title="No Design System"
        description="No design system has been extracted yet. Upload creatives and run the extraction process first."
      />
    );
  }

  return (
    <div className="space-y-6">
      <DesignSystemHeader
        designSystem={designSystem}
        isEditing={isEditing}
        onToggleEdit={handleToggleEdit}
      />

      <div className="flex items-center justify-between">
        <ApprovalWorkflow
          status={designSystem.status ?? 'draft'}
          onStatusChange={handleStatusChange}
          isUpdating={updateStatus.isPending}
        />
        {isEditing && (
          <Button
            onClick={handleSave}
            disabled={updateDesignSystem.isPending}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {updateDesignSystem.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </div>

      <Separator />

      <Tabs defaultValue="colors">
        <TabsList>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="copy">Copy</TabsTrigger>
          <TabsTrigger value="logo">Logo</TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="mt-4">
          {isEditing ? (
            <ColorPaletteEditor
              palette={editedData?.colorPalette as any}
              onChange={(v) => updateField('colorPalette', v)}
            />
          ) : (
            <ColorPaletteViewer palette={designSystem.colorPalette} />
          )}
        </TabsContent>

        <TabsContent value="typography" className="mt-4">
          {isEditing ? (
            <TypographyEditor
              typography={editedData?.typography as any}
              onChange={(v) => updateField('typography', v)}
            />
          ) : (
            <TypographyViewer typography={designSystem.typography} />
          )}
        </TabsContent>

        <TabsContent value="layout" className="mt-4">
          <LayoutPatternsViewer layouts={designSystem.layoutStructures} />
        </TabsContent>

        <TabsContent value="copy" className="mt-4">
          {isEditing ? (
            <CopyPatternsEditor
              patterns={editedData?.copyPatterns as any}
              onChange={(v) => updateField('copyPatterns', v)}
            />
          ) : (
            <CopyPatternsViewer patterns={designSystem.copyPatterns} />
          )}
        </TabsContent>

        <TabsContent value="logo" className="mt-4">
          {isEditing ? (
            <LogoRulesEditor
              rules={editedData?.logoUsage as any}
              onChange={(v) => updateField('logoUsage', v)}
            />
          ) : (
            <LogoRulesViewer rules={designSystem.logoUsage} />
          )}
        </TabsContent>
      </Tabs>

      <Separator />

      <VersionHistory brandId={brandId} />
    </div>
  );
}
