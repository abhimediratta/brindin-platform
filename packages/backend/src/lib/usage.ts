import { db } from '../db/index.js';
import { usageEvents } from '../db/schema.js';

export async function recordUsageEvent(input: {
  orgId: string;
  brandId?: string;
  eventType: string;
  eventSubtype?: string;
  quantity?: number;
  unit: string;
  costMicrodollars?: number;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await db.insert(usageEvents).values({
    orgId: input.orgId,
    brandId: input.brandId,
    eventType: input.eventType,
    eventSubtype: input.eventSubtype,
    quantity: String(input.quantity ?? 1),
    unit: input.unit,
    costMicrodollars: input.costMicrodollars,
    metadata: input.metadata,
  });
}
