'use client';

import { useState } from 'react';
import { CheckCircle2, Send, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const statusStyles: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  review: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
};

interface ApprovalWorkflowProps {
  status: string;
  onStatusChange: (newStatus: string) => void;
  isUpdating?: boolean;
}

const transitions: Record<string, { label: string; target: string; icon: typeof Send; variant: 'default' | 'outline' }> = {
  draft: { label: 'Submit for Review', target: 'review', icon: Send, variant: 'default' },
  review: { label: 'Approve', target: 'approved', icon: CheckCircle2, variant: 'default' },
  approved: { label: 'Revert to Draft', target: 'draft', icon: RotateCcw, variant: 'outline' },
};

export function ApprovalWorkflow({
  status,
  onStatusChange,
  isUpdating,
}: ApprovalWorkflowProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const transition = transitions[status];

  const handleConfirm = () => {
    if (transition) {
      onStatusChange(transition.target);
    }
    setConfirmOpen(false);
  };

  if (!transition) return null;

  const Icon = transition.icon;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">Status:</span>
      <Badge variant="outline" className={cn('capitalize', statusStyles[status])}>
        {status}
      </Badge>
      <Button
        variant={transition.variant}
        size="sm"
        onClick={() => setConfirmOpen(true)}
        disabled={isUpdating}
        className="gap-1"
      >
        <Icon className="h-4 w-4" />
        {transition.label}
      </Button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to change the status from{' '}
              <span className="font-semibold capitalize">{status}</span> to{' '}
              <span className="font-semibold capitalize">{transition.target}</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
