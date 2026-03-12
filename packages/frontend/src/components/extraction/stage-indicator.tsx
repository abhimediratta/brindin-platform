'use client';

import { CheckCircle, Loader2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const STAGES = ['preprocessing', 'analyzing', 'aggregating', 'synthesizing'] as const;

const stageLabels: Record<string, string> = {
  preprocessing: 'Preprocessing',
  analyzing: 'Analyzing',
  aggregating: 'Aggregating',
  synthesizing: 'Synthesizing',
};

interface StageIndicatorProps {
  currentStage: string;
  progress: number;
}

type StageStatus = 'pending' | 'active' | 'complete';

function getStageStatus(stage: string, currentStage: string): StageStatus {
  const currentIdx = STAGES.indexOf(currentStage as (typeof STAGES)[number]);
  const stageIdx = STAGES.indexOf(stage as (typeof STAGES)[number]);

  if (currentIdx < 0) return 'pending';
  if (stageIdx < currentIdx) return 'complete';
  if (stageIdx === currentIdx) return 'active';
  return 'pending';
}

function StageIcon({ status }: { status: StageStatus }) {
  switch (status) {
    case 'complete':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'active':
      return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
    default:
      return <Clock className="h-5 w-5 text-muted-foreground/40" />;
  }
}

export function StageIndicator({ currentStage }: StageIndicatorProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      {STAGES.map((stage, idx) => {
        const status = getStageStatus(stage, currentStage);
        return (
          <div key={stage} className="flex items-center gap-2 flex-1">
            <div className="flex flex-col items-center gap-1.5 min-w-0">
              <StageIcon status={status} />
              <span
                className={cn(
                  'text-xs font-medium truncate',
                  status === 'active' && 'text-primary',
                  status === 'complete' && 'text-green-600',
                  status === 'pending' && 'text-muted-foreground/60'
                )}
              >
                {stageLabels[stage]}
              </span>
            </div>
            {idx < STAGES.length - 1 && (
              <div
                className={cn(
                  'h-px flex-1 mx-1',
                  status === 'complete' ? 'bg-green-500' : 'bg-border'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
