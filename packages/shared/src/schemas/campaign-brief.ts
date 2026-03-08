import { z } from 'zod';
import { uuidSchema, timestampSchema, dateSchema } from './common.js';

export const CAMPAIGN_OBJECTIVES = ['awareness', 'consideration', 'conversion'] as const;
export const campaignObjectiveSchema = z.enum(CAMPAIGN_OBJECTIVES);
export type CampaignObjective = z.infer<typeof campaignObjectiveSchema>;

export const CAMPAIGN_BRIEF_STATUSES = ['draft', 'reviewed', 'finalized'] as const;
export const campaignBriefStatusSchema = z.enum(CAMPAIGN_BRIEF_STATUSES);
export type CampaignBriefStatus = z.infer<typeof campaignBriefStatusSchema>;

export const timePeriodSchema = z.object({
  start: dateSchema,
  end: dateSchema,
});

export const evidenceCitationSchema = z.object({
  source: z.string(),
  claim: z.string(),
  confidence: z.number().min(0).max(1).optional(),
  url: z.string().url().optional(),
}).passthrough();

export const campaignBriefSchema = z.object({
  id: uuidSchema,
  brand_id: uuidSchema,
  name: z.string().min(1).max(300),
  objective: campaignObjectiveSchema,
  status: campaignBriefStatusSchema,
  target_regions: z.array(z.string()),
  target_platforms: z.array(z.string()),
  target_period: timePeriodSchema.nullable(),
  audience_description: z.string().nullable(),
  key_messages: z.array(z.string()).nullable(),
  constraints: z.record(z.unknown()).nullable(),
  evidence_citations: z.array(evidenceCitationSchema).nullable(),
  intelligence_snapshot: z.record(z.unknown()).nullable(),
  created_by: uuidSchema.nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

export const campaignBriefCreateSchema = campaignBriefSchema.omit({
  id: true,
  status: true,
  created_at: true,
  updated_at: true,
}).extend({
  status: campaignBriefStatusSchema.optional(),
  target_period: timePeriodSchema.nullish(),
  audience_description: z.string().nullish(),
  key_messages: z.array(z.string()).nullish(),
  constraints: z.record(z.unknown()).nullish(),
  evidence_citations: z.array(evidenceCitationSchema).nullish(),
  intelligence_snapshot: z.record(z.unknown()).nullish(),
  created_by: uuidSchema.nullish(),
});

export const campaignBriefUpdateSchema = campaignBriefCreateSchema.partial();

export type CampaignBrief = z.infer<typeof campaignBriefSchema>;
export type CampaignBriefCreate = z.infer<typeof campaignBriefCreateSchema>;
export type CampaignBriefUpdate = z.infer<typeof campaignBriefUpdateSchema>;
export type TimePeriod = z.infer<typeof timePeriodSchema>;
export type EvidenceCitation = z.infer<typeof evidenceCitationSchema>;
