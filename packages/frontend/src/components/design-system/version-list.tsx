'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface VersionListProps {
  versions: Array<{
    id: string;
    versionNumber?: number;
    createdAt?: string;
    changeSummary?: string;
  }>;
  onRestore: (versionId: string) => void;
  isRestoring?: boolean;
}

export function VersionList({ versions, onRestore, isRestoring }: VersionListProps) {
  const [restoreId, setRestoreId] = useState<string | null>(null);

  const handleConfirmRestore = () => {
    if (restoreId) {
      onRestore(restoreId);
      setRestoreId(null);
    }
  };

  if (versions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No versions yet. Create a snapshot to save the current state.
      </p>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Version</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Summary</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {versions.map((version) => (
            <TableRow key={version.id}>
              <TableCell className="font-medium">
                v{version.versionNumber ?? '—'}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {version.createdAt
                  ? new Date(version.createdAt).toLocaleString()
                  : '—'}
              </TableCell>
              <TableCell className="text-sm">
                {version.changeSummary || 'No summary'}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRestoreId(version.id)}
                  disabled={isRestoring}
                  className="gap-1"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restore
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!restoreId} onOpenChange={() => setRestoreId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Version</DialogTitle>
            <DialogDescription>
              This will restore the design system to this version. Any unsaved
              changes will be lost. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreId(null)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmRestore} disabled={isRestoring}>
              {isRestoring ? 'Restoring...' : 'Restore'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
