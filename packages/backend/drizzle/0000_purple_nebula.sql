CREATE TABLE "brand_creatives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid,
	"file_url" text NOT NULL,
	"thumbnail_url" text,
	"file_type" text NOT NULL,
	"dimensions" jsonb,
	"file_size_bytes" integer,
	"original_filename" text,
	"upload_date" timestamp with time zone DEFAULT now(),
	"creative_date" date,
	"phash" text,
	"analysis" jsonb,
	"color_analysis" jsonb,
	"is_excluded" boolean DEFAULT false,
	"exclusion_reason" text,
	"metadata" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"category_vertical" text,
	"category_sub" text,
	"target_geographies" text[],
	"description" text,
	"logo_url" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "brands_org_id_slug_unique" UNIQUE("org_id","slug")
);
--> statement-breakpoint
CREATE TABLE "campaign_briefs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"target_geography" text,
	"target_segment" text,
	"objective" text,
	"time_period" jsonb,
	"generated_content" jsonb NOT NULL,
	"evidence_citations" jsonb,
	"intelligence_entries_referenced" uuid[],
	"status" text DEFAULT 'draft',
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "design_system_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"design_system_id" uuid,
	"version" integer NOT NULL,
	"snapshot" jsonb NOT NULL,
	"change_summary" text,
	"changed_by" uuid,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "design_systems" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid,
	"version" integer DEFAULT 1,
	"status" text DEFAULT 'draft',
	"color_palette" jsonb NOT NULL,
	"typography" jsonb NOT NULL,
	"layout_structures" jsonb NOT NULL,
	"image_treatment" jsonb NOT NULL,
	"copy_patterns" jsonb NOT NULL,
	"logo_usage" jsonb NOT NULL,
	"inconsistency_report" jsonb,
	"onboarding_guide" text,
	"confidence_scores" jsonb,
	"extraction_metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "design_systems_brand_id_unique" UNIQUE("brand_id")
);
--> statement-breakpoint
CREATE TABLE "extraction_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid,
	"status" text DEFAULT 'queued',
	"total_images" integer,
	"processed_images" integer DEFAULT 0,
	"excluded_images" integer DEFAULT 0,
	"stage" text,
	"progress" integer DEFAULT 0,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "generated_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid,
	"brand_id" uuid,
	"image_url" text NOT NULL,
	"thumbnail_url" text,
	"template_id" text,
	"rationale" jsonb NOT NULL,
	"compliance_report" jsonb,
	"copy_content" jsonb,
	"layout_type" text,
	"copy_approach" text,
	"visual_emphasis" text,
	"color_scheme" text,
	"status" text DEFAULT 'generated',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "generation_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid,
	"design_system_id" uuid,
	"target_platform" text NOT NULL,
	"target_dimensions" jsonb NOT NULL,
	"target_geography" text,
	"target_language" text DEFAULT 'en',
	"target_geographies" text[],
	"target_languages" text[],
	"parent_job_id" uuid,
	"campaign_brief" jsonb,
	"product_images" text[],
	"additional_instructions" text,
	"status" text DEFAULT 'queued',
	"progress" integer DEFAULT 0,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "intelligence_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dimension" text NOT NULL,
	"geography_state" text,
	"geography_tier" text,
	"geography_city" text,
	"category_vertical" text,
	"category_sub" text,
	"festival" text,
	"entry_type" text NOT NULL,
	"title" text NOT NULL,
	"content" jsonb NOT NULL,
	"summary" text,
	"confidence_tier" integer NOT NULL,
	"source" text NOT NULL,
	"sample_size" integer,
	"date_range_from" date,
	"date_range_to" date,
	"last_verified" timestamp with time zone NOT NULL,
	"verified_by" text,
	"source_type" text DEFAULT 'curated' NOT NULL,
	"aggregation_metadata" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"plan" text DEFAULT 'free',
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "regional_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"design_system_id" uuid,
	"region_code" text NOT NULL,
	"language" text NOT NULL,
	"tier" text,
	"color_overrides" jsonb DEFAULT '{}'::jsonb,
	"typography_overrides" jsonb DEFAULT '{}'::jsonb,
	"copy_overrides" jsonb DEFAULT '{}'::jsonb,
	"cultural_notes" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "regional_variants_ds_region_lang_tier_unique" UNIQUE("design_system_id","region_code","language","tier")
);
--> statement-breakpoint
CREATE TABLE "usage_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"brand_id" uuid,
	"event_type" text NOT NULL,
	"event_subtype" text,
	"quantity" numeric DEFAULT '1' NOT NULL,
	"unit" text NOT NULL,
	"cost_microdollars" integer,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "usage_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"brand_id" uuid,
	"month" date NOT NULL,
	"extractions" integer DEFAULT 0,
	"images_processed" integer DEFAULT 0,
	"generations" integer DEFAULT 0,
	"variants_generated" integer DEFAULT 0,
	"evaluations" integer DEFAULT 0,
	"storage_bytes_added" bigint DEFAULT 0,
	"ai_cost_microdollars" bigint DEFAULT 0,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "usage_summaries_org_brand_month_unique" UNIQUE("org_id","brand_id","month")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "brand_creatives" ADD CONSTRAINT "brand_creatives_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brands" ADD CONSTRAINT "brands_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_briefs" ADD CONSTRAINT "campaign_briefs_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_briefs" ADD CONSTRAINT "campaign_briefs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "design_system_versions" ADD CONSTRAINT "design_system_versions_design_system_id_design_systems_id_fk" FOREIGN KEY ("design_system_id") REFERENCES "public"."design_systems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "design_system_versions" ADD CONSTRAINT "design_system_versions_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "design_systems" ADD CONSTRAINT "design_systems_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extraction_jobs" ADD CONSTRAINT "extraction_jobs_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_variants" ADD CONSTRAINT "generated_variants_job_id_generation_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."generation_jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_variants" ADD CONSTRAINT "generated_variants_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generation_jobs" ADD CONSTRAINT "generation_jobs_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generation_jobs" ADD CONSTRAINT "generation_jobs_design_system_id_design_systems_id_fk" FOREIGN KEY ("design_system_id") REFERENCES "public"."design_systems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generation_jobs" ADD CONSTRAINT "generation_jobs_parent_job_id_generation_jobs_id_fk" FOREIGN KEY ("parent_job_id") REFERENCES "public"."generation_jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "regional_variants" ADD CONSTRAINT "regional_variants_design_system_id_design_systems_id_fk" FOREIGN KEY ("design_system_id") REFERENCES "public"."design_systems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_summaries" ADD CONSTRAINT "usage_summaries_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_summaries" ADD CONSTRAINT "usage_summaries_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_intel_geo" ON "intelligence_entries" USING btree ("geography_state","geography_tier");--> statement-breakpoint
CREATE INDEX "idx_intel_category" ON "intelligence_entries" USING btree ("category_vertical","category_sub");--> statement-breakpoint
CREATE INDEX "idx_intel_festival" ON "intelligence_entries" USING btree ("festival","geography_state");--> statement-breakpoint
CREATE INDEX "idx_intel_dimension" ON "intelligence_entries" USING btree ("dimension","entry_type");--> statement-breakpoint
CREATE INDEX "idx_usage_org" ON "usage_events" USING btree ("org_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_usage_brand" ON "usage_events" USING btree ("brand_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_usage_type" ON "usage_events" USING btree ("event_type","created_at");