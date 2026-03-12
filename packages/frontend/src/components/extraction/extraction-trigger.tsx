'use client';

import { useState } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ExtractionTriggerProps {
  brandId: string;
  onTriggered?: (jobId: string) => void;
  isExtracting?: boolean;
  creativeCount?: number;
}

export function ExtractionTrigger({
  brandId,
  onTriggered,
  isExtracting,
  creativeCount,
}: ExtractionTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={isExtracting} size="sm">
          {isExtracting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Extracting...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Extract Design System
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start Extraction</DialogTitle>
          <DialogDescription>
            This will analyze{' '}
            {creativeCount !== undefined
              ? `all ${creativeCount} uploaded creatives`
              : 'all uploaded creatives'}{' '}
            to extract your brand design system. This may take a few minutes.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setOpen(false);
              onTriggered?.(brandId);
            }}
          >
            <Play className="mr-2 h-4 w-4" />
            Start Extraction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
