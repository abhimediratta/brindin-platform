'use client';

import { History, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useVersions, useCreateVersion, useRestoreVersion } from '@/hooks/use-design-system-versions';
import { VersionList } from './version-list';
import { toast } from 'sonner';

interface VersionHistoryProps {
  brandId: string;
}

export function VersionHistory({ brandId }: VersionHistoryProps) {
  const { data, isLoading } = useVersions(brandId);
  const createVersion = useCreateVersion(brandId);
  const restoreVersion = useRestoreVersion(brandId);

  const versions = Array.isArray(data) ? data : data?.versions ?? [];

  const handleCreate = () => {
    createVersion.mutate(undefined, {
      onSuccess: () => toast.success('Version snapshot created'),
      onError: (err) => toast.error(err.message || 'Failed to create version'),
    });
  };

  const handleRestore = (versionId: string) => {
    restoreVersion.mutate(versionId, {
      onSuccess: () => toast.success('Version restored successfully'),
      onError: (err) => toast.error(err.message || 'Failed to restore version'),
    });
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Version History
        </CardTitle>
        <Button
          size="sm"
          onClick={handleCreate}
          disabled={createVersion.isPending}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          {createVersion.isPending ? 'Creating...' : 'Create Snapshot'}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <VersionList
            versions={versions}
            onRestore={handleRestore}
            isRestoring={restoreVersion.isPending}
          />
        )}
      </CardContent>
    </Card>
  );
}
