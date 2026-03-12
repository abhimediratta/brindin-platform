import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  date,
  jsonb,
  numeric,
  bigint,
  index,
  unique,
} from 'drizzle-orm/pg-core';

// ─── 1. Organizations ───────────────────────────────────────────────

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  plan: text('plan').default('free'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ─── 2. Users ────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id),
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ─── 3. Brands ───────────────────────────────────────────────────────

export const brands = pgTable(
  'brands',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id').references(() => organizations.id),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    categoryVertical: text('category_vertical'),
    categorySub: text('category_sub'),
    targetGeographies: text('target_geographies').array(),
    description: text('description'),
    logoUrl: text('logo_url'),
    metadata: jsonb('metadata').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [unique('brands_org_id_slug_unique').on(t.orgId, t.slug)],
);

// ─── 4. Brand Creatives ─────────────────────────────────────────────

export const brandCreatives = pgTable('brand_creatives', {
  id: uuid('id').primaryKey().defaultRandom(),
  brandId: uuid('brand_id').references(() => brands.id),
  fileUrl: text('file_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  fileType: text('file_type').notNull(),
  dimensions: jsonb('dimensions'),
  fileSizeBytes: integer('file_size_bytes'),
  originalFilename: text('original_filename'),
  uploadDate: timestamp('upload_date', { withTimezone: true }).defaultNow(),
  creativeDate: date('creative_date'),
  phash: text('phash'),
  analysis: jsonb('analysis'),
  colorAnalysis: jsonb('color_analysis'),
  isExcluded: boolean('is_excluded').default(false),
  exclusionReason: text('exclusion_reason'),
  metadata: jsonb('metadata').default({}),
});

// ─── 5. Design Systems ──────────────────────────────────────────────

export const designSystems = pgTable('design_systems', {
  id: uuid('id').primaryKey().defaultRandom(),
  brandId: uuid('brand_id')
    .references(() => brands.id)
    .unique(),
  version: integer('version').default(1),
  status: text('status').default('draft'),
  colorPalette: jsonb('color_palette').notNull(),
  typography: jsonb('typography').notNull(),
  layoutStructures: jsonb('layout_structures').notNull(),
  imageTreatment: jsonb('image_treatment').notNull(),
  copyPatterns: jsonb('copy_patterns').notNull(),
  logoUsage: jsonb('logo_usage').notNull(),
  inconsistencyReport: jsonb('inconsistency_report'),
  onboardingGuide: text('onboarding_guide'),
  confidenceScores: jsonb('confidence_scores'),
  extractionMetadata: jsonb('extraction_metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─── 6. Design System Versions ──────────────────────────────────────

export const designSystemVersions = pgTable('design_system_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  designSystemId: uuid('design_system_id').references(() => designSystems.id),
  version: integer('version').notNull(),
  snapshot: jsonb('snapshot').notNull(),
  changeSummary: text('change_summary'),
  changedBy: uuid('changed_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ─── 7. Regional Variants ───────────────────────────────────────────

export const regionalVariants = pgTable(
  'regional_variants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    designSystemId: uuid('design_system_id').references(
      () => designSystems.id,
    ),
    regionCode: text('region_code').notNull(),
    language: text('language').notNull(),
    tier: text('tier'),
    colorOverrides: jsonb('color_overrides').default({}),
    typographyOverrides: jsonb('typography_overrides').default({}),
    copyOverrides: jsonb('copy_overrides').default({}),
    culturalNotes: jsonb('cultural_notes').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [
    unique('regional_variants_ds_region_lang_tier_unique').on(
      t.designSystemId,
      t.regionCode,
      t.language,
      t.tier,
    ),
  ],
);

// ─── 8. Extraction Jobs ─────────────────────────────────────────────

export const extractionJobs = pgTable('extraction_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  brandId: uuid('brand_id').references(() => brands.id),
  status: text('status').default('queued'),
  totalImages: integer('total_images'),
  processedImages: integer('processed_images').default(0),
  excludedImages: integer('excluded_images').default(0),
  stage: text('stage'),
  progress: integer('progress').default(0),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});

// ─── 9. Generation Jobs ─────────────────────────────────────────────

export const generationJobs = pgTable('generation_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  brandId: uuid('brand_id').references(() => brands.id),
  designSystemId: uuid('design_system_id').references(() => designSystems.id),
  targetPlatform: text('target_platform').notNull(),
  targetDimensions: jsonb('target_dimensions').notNull(),
  targetGeography: text('target_geography'),
  targetLanguage: text('target_language').default('en'),
  targetGeographies: text('target_geographies').array(),
  targetLanguages: text('target_languages').array(),
  parentJobId: uuid('parent_job_id').references(
    (): any => generationJobs.id,
  ),
  campaignBrief: jsonb('campaign_brief'),
  productImages: text('product_images').array(),
  additionalInstructions: text('additional_instructions'),
  status: text('status').default('queued'),
  progress: integer('progress').default(0),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});

// ─── 10. Generated Variants ─────────────────────────────────────────

export const generatedVariants = pgTable('generated_variants', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').references(() => generationJobs.id),
  brandId: uuid('brand_id').references(() => brands.id),
  imageUrl: text('image_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  templateId: text('template_id'),
  rationale: jsonb('rationale').notNull(),
  complianceReport: jsonb('compliance_report'),
  copyContent: jsonb('copy_content'),
  layoutType: text('layout_type'),
  copyApproach: text('copy_approach'),
  visualEmphasis: text('visual_emphasis'),
  colorScheme: text('color_scheme'),
  status: text('status').default('generated'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ─── 11. Intelligence Entries ────────────────────────────────────────

export const intelligenceEntries = pgTable(
  'intelligence_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    dimension: text('dimension').notNull(),
    geographyState: text('geography_state'),
    geographyTier: text('geography_tier'),
    geographyCity: text('geography_city'),
    categoryVertical: text('category_vertical'),
    categorySub: text('category_sub'),
    festival: text('festival'),
    entryType: text('entry_type').notNull(),
    title: text('title').notNull(),
    content: jsonb('content').notNull(),
    summary: text('summary'),
    confidenceTier: integer('confidence_tier').notNull(),
    source: text('source').notNull(),
    sampleSize: integer('sample_size'),
    dateRangeFrom: date('date_range_from'),
    dateRangeTo: date('date_range_to'),
    lastVerified: timestamp('last_verified', {
      withTimezone: true,
    }).notNull(),
    verifiedBy: text('verified_by'),
    sourceType: text('source_type').notNull().default('curated'),
    aggregationMetadata: jsonb('aggregation_metadata'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index('idx_intel_geo').on(t.geographyState, t.geographyTier),
    index('idx_intel_category').on(t.categoryVertical, t.categorySub),
    index('idx_intel_festival').on(t.festival, t.geographyState),
    index('idx_intel_dimension').on(t.dimension, t.entryType),
  ],
);

// ─── 12. Regional Creative Profiles ────────────────────────────────

export const regionalCreativeProfiles = pgTable('regional_creative_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  regionCode: text('region_code').notNull().unique(),
  regionName: text('region_name').notNull(),
  primaryLanguages: text('primary_languages').array().notNull(),
  typographyStyle: jsonb('typography_style').notNull(),
  colorTendencies: jsonb('color_tendencies').notNull(),
  layoutDensity: jsonb('layout_density').notNull(),
  copyTone: jsonb('copy_tone').notNull(),
  trustSignals: jsonb('trust_signals').notNull(),
  visualGrammar: jsonb('visual_grammar').notNull(),
  whatFails: jsonb('what_fails'),
  languageDevices: jsonb('language_devices'),
  confidenceTier: integer('confidence_tier').notNull().default(1),
  source: text('source').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─── 13. Usage Events ──────────────────────────────────────────────

export const usageEvents = pgTable(
  'usage_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .references(() => organizations.id)
      .notNull(),
    brandId: uuid('brand_id').references(() => brands.id),
    eventType: text('event_type').notNull(),
    eventSubtype: text('event_subtype'),
    quantity: numeric('quantity').notNull().default('1'),
    unit: text('unit').notNull(),
    costMicrodollars: integer('cost_microdollars'),
    metadata: jsonb('metadata').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index('idx_usage_org').on(t.orgId, t.createdAt),
    index('idx_usage_brand').on(t.brandId, t.createdAt),
    index('idx_usage_type').on(t.eventType, t.createdAt),
  ],
);

// ─── 14. Usage Summaries ────────────────────────────────────────────

export const usageSummaries = pgTable(
  'usage_summaries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .references(() => organizations.id)
      .notNull(),
    brandId: uuid('brand_id').references(() => brands.id),
    month: date('month').notNull(),
    extractions: integer('extractions').default(0),
    imagesProcessed: integer('images_processed').default(0),
    generations: integer('generations').default(0),
    variantsGenerated: integer('variants_generated').default(0),
    evaluations: integer('evaluations').default(0),
    storageBytesAdded: bigint('storage_bytes_added', {
      mode: 'number',
    }).default(0),
    aiCostMicrodollars: bigint('ai_cost_microdollars', {
      mode: 'number',
    }).default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [
    unique('usage_summaries_org_brand_month_unique').on(
      t.orgId,
      t.brandId,
      t.month,
    ),
  ],
);

// ─── 15. Campaign Briefs ────────────────────────────────────────────

export const campaignBriefs = pgTable('campaign_briefs', {
  id: uuid('id').primaryKey().defaultRandom(),
  brandId: uuid('brand_id')
    .references(() => brands.id)
    .notNull(),
  targetGeography: text('target_geography'),
  targetSegment: text('target_segment'),
  objective: text('objective'),
  timePeriod: jsonb('time_period'),
  generatedContent: jsonb('generated_content').notNull(),
  evidenceCitations: jsonb('evidence_citations'),
  intelligenceEntriesReferenced: uuid('intelligence_entries_referenced').array(),
  status: text('status').default('draft'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
