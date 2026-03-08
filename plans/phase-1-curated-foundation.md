# Phase 1 Implementation Plan: Curated Foundation

## Context

Phase 1 ("Curated Foundation") of the market intelligence and creative production platform for Indian advertising markets. Builds the pre-launch foundation: design system extraction from brand creatives, template-based creative generation, campaign briefing, and curated market intelligence for beauty/fashion.

**Competitive gap:** No existing product combines brand design system extraction + Indian market intelligence + creative generation constrained by both. Each incumbent solves one piece. The integration is the product.

**Exit criteria:** Extraction produces accurate results for test brands. Generated creatives require <30 minutes of human refinement on average. Time from brand onboarding to first generated creative: target <1 week. Intelligence covers MVP scope (beauty/fashion, 5 states, 3 tiers). Cultural error rate: zero tolerance (any cultural error in generated creative is a P0 incident).

**Builder:** Solo developer. ~18 weeks.

---

## Manual Steps (Your To-Dos)

These are things that require human action outside of code:

### Before Starting (Week 0)

1. **Create project repositories:**
   - Create a new monorepo (e.g., `brindin-platform`) with the structure below. This is a separate project from the current `website-v2` marketing site.
   - Or: create 3 separate repos if you prefer (`brindin-api`, `brindin-workers`, `brindin-dashboard`). Monorepo recommended for solo dev.

2. **Provision API keys:**
   - [ ] **Anthropic API key** - for Claude Haiku 4.5 (image analysis) and Sonnet 4.6 (synthesis + copy gen). Get from console.anthropic.com. Budget ~$20-50/month during development.
   - [ ] **Sarvam AI API key** - for translation, transliteration. Get from dashboard.sarvam.ai. Free tier: Rs.1000 credits.
   - [ ] **Cloudflare R2** or **AWS S3** bucket - for creative file storage. R2 recommended (no egress fees).
   - [ ] (Optional) **remove.bg API key** - commercial background removal. Alternative: use open-source `rembg` locally (free, good quality).

3. **Provision infrastructure (can use free/dev tiers initially):**
   - [ ] **PostgreSQL** - Local Docker for dev. For staging: Neon (free tier) or Supabase or AWS RDS.
   - [ ] **Redis** - Local Docker for dev. For staging: Upstash (free tier) or AWS ElastiCache.
   - [ ] **Compute** - Local Docker for dev. For staging: single EC2 instance or GCP Cloud Run.

4. **Collect test data:**
   - [ ] Gather 50-100 past creatives from 3-5 real Indian D2C brands (beauty/fashion). These are needed to test the extraction pipeline. Source from Meta Ad Library, brand social media, or partner agencies.
   - [ ] For each test brand: download ad creatives as images (JPEG/PNG), note the brand name, logo, and any known brand colors.

5. **Download Devanagari fonts:**
   - [ ] Noto Sans Devanagari (Google Fonts - variable weight)
   - [ ] Mukta (Google Fonts)
   - [ ] Poppins (Google Fonts - has Devanagari support)
   - [ ] Tiro Devanagari Hindi (Google Fonts - serif)

### During Sprint 5 (Weeks 13-15) - Intelligence Compilation

6. **Manually compile market intelligence data:**
   - [ ] Geographic intelligence for 5 states (Maharashtra, Karnataka, Tamil Nadu, Delhi NCR, Uttar Pradesh) x 3 tiers (Metro, T1, T2)
   - [ ] Data points per geography: primary languages, platform penetration (Meta/Google/ShareChat), CPM/CPA ranges for beauty, consumer behavior notes
   - [ ] Sources: Census 2011 data, IAMAI India Internet Reports, Meta Ad Library manual analysis (analyze 500+ beauty/fashion ads), Google Ads benchmarks, industry reports (Dentsu, GroupM, Kantar)
   - [ ] Category intelligence for beauty/fashion: creative norms, pricing patterns, seasonal trends

7. **Festival intelligence (requires cultural expertise):**
   - [ ] Choose one festival: Diwali or Navratri
   - [ ] Document 5+ regional treatments with cultural significance, approved/avoided colors, approved/avoided motifs, timing, emotional tone
   - [ ] Get subject-matter expert review (cultural consultant or someone with deep regional knowledge)
   - [ ] Compute correct festival dates from Hindu lunar calendar for current year

### Ongoing

8. **Designer testing (Sprint 2, 4, 7):**
   - [ ] Show extracted design systems to a designer - do they agree it represents the brand?
   - [ ] Show generated creatives to a designer - would they rather refine these or start fresh?
   - [ ] These are the critical validation moments. If designers reject the output, iterate before moving forward.

---

## Architecture

### High-Level

Hybrid: Node.js/TypeScript API + Python image processing workers + Next.js frontend.

```
Next.js Frontend (Dashboard)
    |
    | REST / WebSocket
    v
Hono API Server (Node.js/TypeScript)
    |
    +-- Brand Module (CRUD, uploads)
    +-- Design System Module (extraction orchestration)
    +-- Creative Generation Module (generation orchestration)
    +-- Intelligence Module (market + festival data)
    +-- Evaluation Module (compliance checker)
    |
    | BullMQ (Redis) job dispatch
    v
Workers
    +-- Node workers: Claude API calls, Sarvam API calls, aggregation, synthesis
    +-- Python workers: image preprocessing, color extraction, bg removal, Playwright rendering
    |
    v
Infrastructure
    +-- PostgreSQL (all structured data)
    +-- Redis (job queues, caching, progress tracking)
    +-- S3/R2 (image storage: uploads, generated outputs, assets)
```

### Monorepo Structure

```
brindin-platform/
  packages/
    backend/              -- Hono API server + Node workers (TypeScript)
      src/
        server/           -- Hono routes, middleware, WebSocket
        modules/
          brand/          -- Brand CRUD, asset management
          design-system/  -- Extraction orchestration, storage, versioning
          creative-gen/   -- Generation orchestration, template selection
          intelligence/   -- Market data CRUD, query layer
          evaluation/     -- Compliance checking
        workers/          -- Node BullMQ workers (Claude, Sarvam, aggregation)
        db/               -- Drizzle schema, migrations
        lib/              -- Shared utilities
      drizzle/            -- Migration files
      package.json
      tsconfig.json

    workers-py/           -- Python image processing workers
      src/
        preprocessing/    -- Image validation, pHash, thumbnails
        color/            -- Color extraction (Pillow + scikit-learn)
        background/       -- Background removal (rembg)
        renderer/         -- Playwright template rendering
        main.py           -- BullMQ consumer / Redis subscriber
      requirements.txt
      Dockerfile

    frontend/             -- Next.js dashboard
      src/
        app/              -- App Router pages
        components/       -- UI components
        lib/              -- API client, hooks, stores
      package.json
      next.config.js

    shared/               -- Shared types (TypeScript, consumed by backend + frontend)
      src/
        schemas/          -- Zod schemas (design system, brand, intelligence, etc.)
        types/            -- TypeScript type exports
      package.json

  docker-compose.yml      -- Postgres, Redis, MinIO, Python workers
  package.json            -- Workspace root (pnpm workspaces)
  pnpm-workspace.yaml
  turbo.json              -- Turborepo config (optional)
```

### Vision Layer Mapping

| Vision Layer | Plan Module(s) | Description |
|---|---|---|
| Layer 1: Brand & Market Context (Foundation) | Brand Module + Design System Module | Brand profiles, design system extraction, regional variants |
| Layer 2: Market Intelligence Engine (Brain) | Intelligence Module | Geographic, category, cultural, creative pattern intelligence |
| Layer 3: Decision Support (Interface) | Evaluation Module + Campaign Briefing | Campaign briefs, creative evaluation, compliance checking |
| Layer 4: Creative Generation (Output) | Creative Generation Module | Template-based generation, regional adaptation engine |

### Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **API server** | Hono (Node.js/TS) | Lightweight, fast, Zod validation, TypeScript-native |
| **ORM** | Drizzle | SQL-first, type-safe, lightweight migrations |
| **Job queue** | BullMQ + Redis | Progress tracking, retries, priority, rate limiting |
| **Image processing** | Pillow + OpenCV (Python) | Superior CV ecosystem |
| **Color extraction** | scikit-learn k-means + Pillow (Python) | DBSCAN/k-means in Lab color space |
| **Background removal** | rembg (Python) | Open-source, local, good quality |
| **Creative rendering** | Playwright (Python, headless Chromium) | HTML/CSS templates, guaranteed Devanagari support |
| **Frontend** | Next.js 14 + Zustand + TanStack Query + Radix + Tailwind | |
| **Database** | PostgreSQL | Structured data + JSONB flexibility |
| **Cache/Queue** | Redis | BullMQ backend, session cache |
| **Object storage** | Cloudflare R2 or AWS S3 | S3-compatible, R2 has no egress fees |
| **Compute** | Docker on EC2 or Cloud Run | Containerized deployment |
| **CDN** | Cloudflare | |
| **CI/CD** | GitHub Actions | |

### AI Services

**Claude Vision + Sarvam AI are complementary, not competing:**

| Capability | Claude (Haiku/Sonnet) | Sarvam AI |
|------------|---------------------|-----------|
| Ad creative analysis (layouts, style, composition) | Yes | No (Sarvam Vision is document OCR only) |
| Color/typography semantic detection | Yes | No |
| Design system synthesis | Yes (Sonnet for synthesis) | No |
| Copy generation for ads | Yes | No |
| Indian language translation (22 languages) | No | Yes |
| Transliteration (brand names across scripts) | No | Yes |
| TTS for audio ads (future) | No | Yes - 6 Indian voices |
| Devanagari OCR from creatives | Adequate | Excellent (can supplement if needed) |

**Strategy:** Claude for all creative analysis, design system extraction, and copy generation. Sarvam for translation, transliteration, and Indian language processing.

### API Cost Estimates

**Model configuration:** Haiku 4.5 for individual image analysis (Stage 2), Sonnet 4.6 for synthesis (Stage 4). Prompt caching enabled (same analysis prompt reused across all batches).

| Model | Input | Output | Cache Hits (0.1x) |
|-------|-------|--------|--------------------|
| Haiku 4.5 | $1/MTok | $5/MTok | $0.10/MTok |
| Sonnet 4.6 | $3/MTok | $15/MTok | $0.30/MTok |
| Batch API | 50% off all prices | | |

**Cost per brand extraction (50 images):** ~$0.35 with prompt caching
**Cost at 100 brands/month:** ~$35/month for extraction alone
**Batch API option:** 50% off for non-urgent processing (results within 24h, usually faster)

| Configuration | Cost/Brand | 100 Brands/Mo |
|---------------|-----------|---------------|
| Haiku + Sonnet + caching | ~$0.35 | ~$35 |
| Haiku + Sonnet + batch + caching | ~$0.18 | ~$18 |

---

## Design System Extraction Pipeline

### 4-Stage Pipeline (target: <10 minutes for 50 images)

```
Upload 50+ images
    |
    v
Stage 1: Preprocessing (Python worker, ~30s, parallel)
    - Validate formats (JPEG/PNG/WebP), reject >25MB
    - Perceptual hash (pHash via imagehash lib) for duplicate detection (hamming distance <5 = duplicate)
    - Thumbnail generation (300px wide via Pillow)
    - Quality filtering: exclude <200x200, corrupt files
    - Store results in Redis for pipeline resumability
    |
    v
Stage 2: Individual Analysis (~5-7 min, bottleneck)
    - [Python worker] Programmatic color extraction per image:
        - Resize to 200x200
        - Extract top 8 colors via k-means (scikit-learn) in Lab color space
        - Calculate pixel percentage per color
        - Convert to HSL, Lab, Hex
        - Identify background color (most common in border pixels)
    - [Node worker] Claude Vision batched analysis (3-5 images per API call):
        - Layout composition (product-left, text-overlay, split-horizontal, etc.)
        - Typography (serif/sans/display, hierarchy, density, script detection)
        - Image treatment (studio/lifestyle/UGC, warm/cool, product prominence)
        - Copy patterns (tone, structure, CTA, language: English/Hindi/Hinglish)
        - Logo placement and sizing
        - Platform estimate (Instagram feed/story, Facebook, Google Display)
    - [Node worker] Text/copy extraction: Claude Vision OCR + language identification
    |
    v
Stage 3: Aggregation (Node worker, ~30s-1min)
    - Color palette clustering:
        - Collect all colors across all images with pixel % and semantic roles
        - DBSCAN clustering in Lab space
        - Per cluster: centroid, frequency, typical role (brand/text/bg/CTA/accent)
        - Rank: primary (>60% of creatives), secondary (30-60%), accent (<30%)
    - Typography aggregation:
        - Group by type (serif/sans/display)
        - Identify dominant families
        - Aggregate size hierarchy (heading:body ratio)
        - Text density distribution
        - Devanagari usage frequency
    - Layout frequency analysis:
        - Normalize to canonical types
        - Count frequency, map to contexts
    - Copy pattern analysis:
        - Classify approach per creative
        - Aggregate tone, language mix ratios, CTA patterns
    - Inconsistency detection:
        - Cross-time color drift
        - Layout inconsistencies (no dominant = flag)
        - Typography inconsistencies
        - Tone inconsistencies
    |
    v
Stage 4: Synthesis (Node worker, ~30s-1min)
    - Single Claude Sonnet call with all aggregated data
    - Output: structured DesignSystem JSON
    - Per-dimension confidence: strong (>70%), moderate (40-70%), emerging (<40%)
    - Onboarding guide (markdown)
    - Inconsistency report with specific creative references
```

### Claude Vision Prompt (Stage 2)

```
Analyze these {n} advertising creatives for a brand. For each image, extract:

1. LAYOUT: Describe the spatial composition (e.g., product-left-text-right,
   full-bleed-image-text-overlay, product-center-text-below). Identify grid
   structure if apparent.

2. TYPOGRAPHY: List visible fonts (serif/sans-serif/display), estimate sizes
   relative to canvas, identify heading/subheading/body hierarchy, note text
   density (minimal/moderate/heavy), identify script (Latin/Devanagari/other).

3. IMAGE TREATMENT: Photography style (studio/lifestyle/UGC/illustration/flat-lay),
   filter/color grading (warm/cool/vibrant/muted), product prominence
   (hero/supporting/absent).

4. COPY PATTERNS: Tone (formal/casual/playful), structure (offer-led/benefit-led/
   question-hook/testimonial/social-proof), CTA text and style, language
   (English/Hindi/Hinglish/other).

5. LOGO: Position (top-left/top-right/bottom-left/bottom-right/center),
   approximate size relative to canvas, background treatment (on solid/on image/
   with padding).

6. PLATFORM ESTIMATE: What platform/format was this likely designed for
   (Instagram feed/story, Facebook feed, Google Display)?

Return structured JSON for each image.
```

### Claude Sonnet Synthesis Prompt (Stage 4)

```
Given the following aggregated analysis of {n} brand creatives, generate
a structured Brand Design System:

[Aggregated color data]
[Aggregated typography data]
[Aggregated layout data]
[Aggregated copy patterns]
[Aggregated logo usage]

Generate a Design System with these sections:
1. Color Palette: Primary, secondary, accent colors with hex codes and usage rules
2. Typography: Font recommendations, size hierarchy, text density guidelines
3. Layout Structures: Approved layouts ranked by frequency, with usage context
4. Image Treatment: Photography style guidelines, filter/grading rules
5. Copy Guidelines: Tone of voice, structure preferences, CTA conventions, language rules
6. Logo Usage: Placement rules, size minimums, background requirements
7. Inconsistency Report: List specific contradictions with example references
8. Confidence Score: Per-dimension confidence (high/moderate/low) based on data consistency

For each guideline, cite how many creatives support it (e.g., "Used in 42/53 creatives").
Mark guidelines as "strong" (>70% consistency), "moderate" (40-70%), or "emerging" (<40%).
```

### Performance Budget

| Stage | Time | Bottleneck |
|-------|------|-----------|
| Preprocessing | ~30s | Image processing (parallel) |
| Individual Analysis | 5-7 min | Claude API calls (rate-limited, 2-3 concurrent) |
| Aggregation | 30s-1 min | CPU compute |
| Synthesis | 30s-1 min | Claude Sonnet single call |
| **Total** | **~7-9 min** | |

---

## Template-Based Creative Generation

### Template Architecture

Templates are HTML/CSS files with JSON metadata. Rendered in headless Chromium via Playwright.

**Template metadata (JSON):**
```typescript
interface TemplateDefinition {
  id: string;
  name: string;
  category: 'product-hero' | 'lifestyle' | 'testimonial' | 'offer-led' |
            'benefit-grid' | 'social-proof' | 'split-layout' | 'text-overlay';
  platforms: { name: string; width: number; height: number }[];
  slots: {
    id: string;
    type: 'image' | 'text' | 'logo' | 'shape' | 'badge';
    role: 'hero-image' | 'product' | 'headline' | 'subhead' | 'body' |
          'cta' | 'price' | 'logo' | 'background' | 'accent-shape';
    optional: boolean;
    textConfig?: { maxChars: number; alignment: string; scriptAware: boolean };
  }[];
  variationAxes: string[];  // Built-in variation parameters
}
```

**Template HTML/CSS:** Standard HTML with CSS variables for brand customization:
```html
<div class="creative" style="
  --brand-primary: {{colors.primary}};
  --brand-secondary: {{colors.secondary}};
  --brand-bg: {{colors.background}};
  --font-heading: {{typography.headingFamily}};
  --font-body: {{typography.bodyFamily}};
">
  <div class="product-image">
    <img src="{{productImageDataUri}}" />
  </div>
  <h1 class="headline">{{headline}}</h1>
  <p class="cta-button">{{ctaText}}</p>
  <img class="logo" src="{{logoDataUri}}" />
</div>
```

### Design System Constraint Application

1. **Color mapping:** CSS variables populated from brand palette. Template semantic roles (--brand-primary, --cta-bg, --text-color) mapped to brand colors.
2. **Typography binding:** @font-face loaded from downloaded fonts. Heading/body families from design system.
3. **Layout selection:** Select templates matching brand's dominant layout patterns.
4. **Logo placement:** CSS position per design system rules.
5. **Image treatment:** Product images pre-processed (Pillow/OpenCV) with brand's color grading before injection.

### Rendering Pipeline (Playwright, Python worker)

```
1. Receive generation job from BullMQ
2. Pre-process product images (Python):
   - Background removal (rembg)
   - Resize to template slot dimensions
   - Apply color grading per design system
   - Convert to base64 data URIs
3. Generate copy variants via Claude (Node worker, parallel):
   - 2-3 copy approaches per template (offer-led, benefit-led, question hook, social proof)
   - Sarvam translation for Hindi/regional versions
4. For each variant:
   a. Select template HTML/CSS
   b. Inject: brand colors (CSS vars), fonts (@font-face), product images (data URIs),
      copy text, logo (data URI)
   c. Launch Playwright, set viewport to target dimensions (e.g., 1080x1080)
   d. Load HTML
   e. Screenshot at 2x device pixel ratio
   f. Optimize PNG via Pillow
   g. Upload to S3/R2
5. Attach rationale metadata to each variant
6. Return variant URLs + rationale
```

**Performance:** ~2-5s per variant. 8 variants = ~20-40s render time. With copy generation and preprocessing: ~2-2.5 min total.

### Variant Diversity Strategy

Each generation produces 4-8 variants across these axes:
1. **Layout:** 2-3 different template categories (e.g., product-hero + testimonial + offer-led)
2. **Copy approach:** 2 variants per layout (offer-led / benefit-led / question hook / social proof)
3. **Visual emphasis:** product-hero / lifestyle / face-focus
4. **Color scheme:** primary-dominant / secondary-accent / dark mode

**Selection algorithm:**
```
1. From design system, identify brand's top 3 layout patterns
2. For each layout, select 1-2 matching templates
3. For each template, generate copy variants via Claude
4. For each copy variant, select a color scheme
5. Ensure final set covers at least 3 distinct creative approaches
6. Generate all variants, attach rationale metadata
```

### Regional Adaptation Engine (Differentiated Capability)

The core differentiator: one master brief, adapted versions per region -- automatically applying the right language, cultural references, price framing, and visual adaptations.

**Multi-region generation mode:**
A single generation job can target multiple regions simultaneously, producing region-specific variant sets for each.

**How it works:**
1. Agency creates one brief for a campaign (e.g., skincare Navratri campaign)
2. Selects multiple target regions (e.g., UP/Rajasthan, Gujarat, Tamil Nadu, Metro)
3. System generates region-adapted variant sets:
   - Hindi for UP/Rajasthan: festival palette, EMI pricing, festive motifs
   - Gujarati for Gujarat: dandiya motifs, percentage-off framing
   - Tamil for Tamil Nadu: Navaratri/golu/kolu themes
   - Metro English: subtle festive elements, product emphasis
4. Each variant is on-brand (design system), culturally appropriate (intelligence), and performance-informed

**Database support:**
Update `generation_jobs` to support multi-region targets -- the `target_geography` and `target_language` fields become arrays, or each region spawns a linked sub-job with a shared `parent_job_id`. See the `generation_jobs` table updates in the Database Schema section.

### Devanagari Typography

Handled by Chrome's native text shaping (via Playwright):
- Fonts loaded via @font-face: Noto Sans Devanagari, Mukta, Poppins, Tiro Devanagari Hindi
- Line height 1.5-1.6x via CSS
- Mixed Hinglish: Chrome's font fallback chain handles naturally
- No custom text rendering code needed
- Validation: visual regression tests comparing rendered output against reference images

---

## Market Intelligence & Festival Module

### Confidence Framework (4 tiers)

| Tier | Label | Description | Example |
|------|-------|-------------|---------|
| 1 | Verified Fact | Census, published stats, confirmed dates | "Hindi spoken by 83% of UP population" |
| 2 | Observed Pattern | Aggregated data with sample size | "UGC creatives 1.7x CTR for beauty in T2 North India (n=340)" |
| 3 | Directional Inference | Limited data or analogies | "Based on T2 West data, expect similar CPA in T2 North" |
| 4 | Stated Unknown | Insufficient data, explicitly stated | "No data for premium skincare in T3 South India" |

Every entry carries: source, sample_size, date_range, last_verified, verified_by.

This tiered confidence system is non-negotiable. All features surfacing intelligence -- including campaign briefing output, creative evaluation output, and generation rationale -- must carry per-recommendation confidence tiers. No insight is surfaced without its confidence tier and evidence source.

### Intelligence Scope (MVP)

- **Geographies:** Maharashtra, Karnataka, Tamil Nadu, Delhi NCR, Uttar Pradesh x Metro/T1/T2
- **Category:** Beauty/fashion (skincare, haircare, color cosmetics)
- **Sources:** Census 2011, IAMAI reports, Meta Ad Library (500+ ads analyzed), platform benchmarks, Dentsu/GroupM/Kantar reports
- **Festival:** Diwali OR Navratri - 5+ regional treatments

### Festival Intelligence Structure

```typescript
interface FestivalIntelligence {
  festival: 'diwali' | 'navratri';
  region: string;
  culturalSignificance: string;
  emotionalTone: string[];
  dateRange: { start: Date; end: Date };  // Current year, lunar calendar
  approvedColors: { hex: string; name: string; significance: string }[];
  avoidColors: { hex: string; reason: string }[];
  approvedMotifs: string[];
  avoidMotifs: { motif: string; reason: string }[];
  effectiveAngles: { angle: string; evidence: string; confidence: number }[];
  campaignStartWeeksBefore: number;
  peakEngagementWindow: string;
  categoryNotes: Record<string, string>;
  sensitivityRules: { rule: string; severity: 'blocker' | 'warning' }[];
}
```

---

## Database Schema

### Full SQL Schema

```sql
-- Organizations (agencies)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,  -- 'admin', 'manager', 'designer', 'viewer'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brands
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  category_vertical TEXT,
  category_sub TEXT,
  target_geographies TEXT[],
  description TEXT,
  logo_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, slug)
);

-- Uploaded creatives (source images for analysis)
CREATE TABLE brand_creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id),
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_type TEXT NOT NULL,
  dimensions JSONB,              -- {width, height}
  file_size_bytes INT,
  original_filename TEXT,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  creative_date DATE,            -- When originally produced (for date-range filtering)
  phash TEXT,                    -- Perceptual hash for dedup
  analysis JSONB,                -- Individual Claude Vision analysis results
  color_analysis JSONB,          -- Programmatic color extraction results
  is_excluded BOOLEAN DEFAULT FALSE,
  exclusion_reason TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Design systems
CREATE TABLE design_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) UNIQUE,
  version INT DEFAULT 1,
  status TEXT DEFAULT 'draft',   -- 'draft', 'review', 'approved'
  color_palette JSONB NOT NULL,
  typography JSONB NOT NULL,
  layout_structures JSONB NOT NULL,
  image_treatment JSONB NOT NULL,
  copy_patterns JSONB NOT NULL,
  logo_usage JSONB NOT NULL,
  inconsistency_report JSONB,
  onboarding_guide TEXT,
  confidence_scores JSONB,
  extraction_metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Design system version history
CREATE TABLE design_system_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_system_id UUID REFERENCES design_systems(id),
  version INT NOT NULL,
  snapshot JSONB NOT NULL,
  change_summary TEXT,
  changed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Regional variants
CREATE TABLE regional_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_system_id UUID REFERENCES design_systems(id),
  region_code TEXT NOT NULL,
  language TEXT NOT NULL,
  tier TEXT,
  color_overrides JSONB DEFAULT '{}',
  typography_overrides JSONB DEFAULT '{}',
  copy_overrides JSONB DEFAULT '{}',
  cultural_notes JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(design_system_id, region_code, language, tier)
);

-- Extraction jobs
CREATE TABLE extraction_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id),
  status TEXT DEFAULT 'queued',  -- 'queued', 'preprocessing', 'analyzing', 'aggregating', 'synthesizing', 'completed', 'failed'
  total_images INT,
  processed_images INT DEFAULT 0,
  excluded_images INT DEFAULT 0,
  stage TEXT,
  progress INT DEFAULT 0,       -- 0-100
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Generation jobs
CREATE TABLE generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id),
  design_system_id UUID REFERENCES design_systems(id),
  target_platform TEXT NOT NULL,
  target_dimensions JSONB NOT NULL,
  target_geography TEXT,              -- For single-region jobs
  target_language TEXT DEFAULT 'en',   -- For single-region jobs
  target_geographies TEXT[],           -- Array of target geographies (for multi-region jobs)
  target_languages TEXT[],             -- Array of target languages
  parent_job_id UUID REFERENCES generation_jobs(id),  -- For multi-region sub-jobs
  campaign_brief JSONB,
  product_images TEXT[],         -- S3 URLs
  additional_instructions TEXT,
  status TEXT DEFAULT 'queued',
  progress INT DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Generated variants
CREATE TABLE generated_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES generation_jobs(id),
  brand_id UUID REFERENCES brands(id),
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  template_id TEXT,
  rationale JSONB NOT NULL,
  compliance_report JSONB,
  copy_content JSONB,
  layout_type TEXT,
  copy_approach TEXT,
  visual_emphasis TEXT,
  color_scheme TEXT,
  status TEXT DEFAULT 'generated', -- 'generated', 'selected', 'refined', 'approved', 'rejected'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market intelligence entries
CREATE TABLE intelligence_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dimension TEXT NOT NULL,       -- 'geographic', 'category', 'cultural', 'creative_pattern'
  geography_state TEXT,
  geography_tier TEXT,           -- 'metro', 'tier1', 'tier2'
  geography_city TEXT,
  category_vertical TEXT,
  category_sub TEXT,
  festival TEXT,
  entry_type TEXT NOT NULL,      -- 'platform_mix', 'language_preference', 'cpm_range', 'creative_style', 'festival_timing'
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  summary TEXT,
  confidence_tier INT NOT NULL CHECK (confidence_tier BETWEEN 1 AND 4),
  source TEXT NOT NULL,
  sample_size INT,
  date_range_from DATE,
  date_range_to DATE,
  last_verified TIMESTAMPTZ NOT NULL,
  verified_by TEXT,
  source_type TEXT NOT NULL DEFAULT 'curated',  -- 'curated' | 'aggregated'
  aggregation_metadata JSONB,                    -- Future: thresholds, contributing brand count, etc.
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: Brand-specific data is inherently private-scoped via org_id/brand_id FK chain.
-- Phase 1 uses curated intelligence only; the two-layer data model (brand-private vs
-- market-aggregated) is acknowledged but not yet active.

CREATE INDEX idx_intel_geo ON intelligence_entries(geography_state, geography_tier);
CREATE INDEX idx_intel_category ON intelligence_entries(category_vertical, category_sub);
CREATE INDEX idx_intel_festival ON intelligence_entries(festival, geography_state);
CREATE INDEX idx_intel_dimension ON intelligence_entries(dimension, entry_type);

-- Usage events (append-only log of billable actions)
CREATE TABLE usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) NOT NULL,
  brand_id UUID REFERENCES brands(id),
  event_type TEXT NOT NULL,        -- 'extraction', 'generation', 'evaluation', 'storage_upload', 'ai_api_call'
  event_subtype TEXT,              -- e.g., 'claude_haiku', 'claude_sonnet', 'sarvam_translate', 'variant_rendered'
  quantity NUMERIC NOT NULL DEFAULT 1,  -- units (images processed, variants generated, bytes stored, tokens used)
  unit TEXT NOT NULL,              -- 'images', 'variants', 'bytes', 'input_tokens', 'output_tokens', 'api_call'
  cost_microdollars INT,          -- internal cost in microdollars (1/1,000,000 USD) for AI API calls, NULL for non-API events
  metadata JSONB DEFAULT '{}',    -- flexible: model name, image count, job_id reference, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_usage_org ON usage_events(org_id, created_at);
CREATE INDEX idx_usage_brand ON usage_events(brand_id, created_at);
CREATE INDEX idx_usage_type ON usage_events(event_type, created_at);

-- Monthly usage summaries (materialized for fast dashboard queries)
CREATE TABLE usage_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) NOT NULL,
  brand_id UUID REFERENCES brands(id),
  month DATE NOT NULL,             -- first day of month
  extractions INT DEFAULT 0,
  images_processed INT DEFAULT 0,
  generations INT DEFAULT 0,
  variants_generated INT DEFAULT 0,
  evaluations INT DEFAULT 0,
  storage_bytes_added BIGINT DEFAULT 0,
  ai_cost_microdollars BIGINT DEFAULT 0,  -- total internal AI API cost
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, brand_id, month)
);

-- Campaign briefs
CREATE TABLE campaign_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) NOT NULL,
  target_geography TEXT,
  target_segment TEXT,
  objective TEXT,                    -- 'awareness' | 'consideration' | 'conversion'
  time_period JSONB,                 -- {start: date, end: date}
  generated_content JSONB NOT NULL,  -- Full structured brief output
  evidence_citations JSONB,          -- Array of {claim, source, confidence_tier, sample_size}
  intelligence_entries_referenced UUID[],  -- References to intelligence_entries used
  status TEXT DEFAULT 'draft',       -- 'draft' | 'reviewed' | 'finalized'
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Key API Endpoints

```
POST   /api/brands                              -- Create brand
GET    /api/brands                              -- List brands for org
GET    /api/brands/:id                          -- Get brand detail
POST   /api/brands/:id/creatives/upload         -- Upload creatives (multipart)
GET    /api/brands/:id/creatives                -- List uploaded creatives

POST   /api/brands/:id/design-system/extract    -- Trigger extraction
GET    /api/brands/:id/design-system            -- Get current design system
PATCH  /api/brands/:id/design-system            -- Update (agency edits)
POST   /api/brands/:id/design-system/versions   -- Snapshot version
GET    /api/brands/:id/design-system/versions   -- List versions

POST   /api/brands/:id/design-system/variants   -- Create regional variant
PATCH  /api/brands/:id/design-system/variants/:vid -- Update variant

POST   /api/generate                            -- Trigger creative generation
GET    /api/generate/:jobId/status              -- Poll status
GET    /api/generate/:jobId/variants            -- Get generated variants

POST   /api/brands/:id/briefs                    -- Generate campaign brief
GET    /api/brands/:id/briefs                    -- List briefs for brand
GET    /api/brands/:id/briefs/:bid               -- Get specific brief
PATCH  /api/brands/:id/briefs/:bid               -- Update/finalize brief

POST   /api/evaluate                            -- Evaluate creative against design system

GET    /api/intelligence/geographic/:state       -- Query geographic intelligence
GET    /api/intelligence/festival/:festival      -- Query festival intelligence
GET    /api/intelligence/category/:vertical      -- Query category intelligence

WS     /ws/jobs/:jobId                          -- Real-time job progress
```

---

## Sprint Plan (~18 weeks, solo developer)

> Strategy: Build backend pipelines first with CLI/API testing, layer frontend after core pipelines work.

> Note: 18 weeks (~4.5 months) extends slightly beyond the vision's "3-4 months" target for Phase 1. Sprint 7 (polish) could be compressed if needed to hit a festival date target.

> Planning dependency: Sprint plan should be back-calculated from a target festival date (Navratri or Diwali). The festival module must be production-ready 6+ weeks before the festival.

### Sprint 1: Infrastructure & Data Layer (Weeks 1-3)

**Goal:** Project scaffolding, database, storage, job queue, basic brand management.

- [ ] Monorepo setup: pnpm workspaces, Turborepo (optional)
- [ ] `packages/backend`: Hono server, Drizzle ORM, TypeScript config
- [ ] `packages/workers-py`: Python project with FastAPI health + Redis consumer
- [ ] `packages/frontend`: Next.js 14 App Router scaffold
- [ ] `packages/shared`: Zod schemas for core entities
- [ ] Docker Compose: Postgres 16, Redis 7, MinIO (S3-compatible for local dev)
- [ ] Database: All tables above via Drizzle migrations
- [ ] S3 storage abstraction: upload, download, presigned URLs
- [ ] BullMQ setup: Node dispatches jobs, Python consumes via `bullmq` Python package or Redis BRPOP
- [ ] Brand CRUD API endpoints
- [ ] Creative upload endpoint: multipart -> S3, trigger thumbnail job
- [ ] Python thumbnail worker: receive job, download from S3, resize via Pillow, upload thumb
- [ ] Basic API key auth (simple middleware, defer full auth)
- [ ] `.env` setup for all API keys and connection strings
- [ ] Usage metering: `usage_events` and `usage_summaries` tables via Drizzle migration
- [ ] Usage recording utility: `recordUsageEvent(orgId, brandId, eventType, ...)` helper in `packages/backend/src/lib/usage.ts`
- [ ] Instrument creative upload: record `storage_upload` event with byte count

**Milestone:** Create brand via API, upload 50 images, thumbnails auto-generated in S3.

### Sprint 2: Extraction Pipeline - Backend (Weeks 4-6)

**Goal:** Full extraction pipeline working via API.

- [ ] Stage 1 - Preprocessing worker (Python): validation, pHash (imagehash lib), quality filtering, dedup
- [ ] Stage 2 - Color extraction worker (Python): Pillow resize, scikit-learn k-means in Lab space, output JSON
- [ ] Stage 2 - Claude Vision worker (Node): Haiku 4.5 batched analysis (3-5 images/call), prompt caching, structured JSON output, retry logic
- [ ] Stage 3 - Aggregation engine (Node): color clustering, typography aggregation, layout frequency, copy patterns, inconsistency detection
- [ ] Stage 4 - Synthesis worker (Node): Sonnet 4.6 call, DesignSystem JSON output, confidence scoring
- [ ] Multi-stage job orchestration: preprocessing -> (color + vision in parallel) -> aggregation -> synthesis
- [ ] Progress tracking: each stage updates Redis, WebSocket broadcasts to frontend
- [ ] Store extraction results: DesignSystem row in Postgres, per-creative analysis in brand_creatives
- [ ] Test via curl/Postman against 3-5 real brand creative sets
- [ ] Compare extracted design systems against manual human analysis
- [ ] Instrument extraction pipeline: record `extraction` event (with image count), `ai_api_call` events for each Claude/Sarvam call (with token counts and cost)

**Milestone:** `POST /api/brands/:id/design-system/extract` returns structured design system in <10 min. Designer validates accuracy.

### Sprint 3: Extraction Frontend + Editor (Weeks 7-9)

**Goal:** Full browser-based extract-review-edit-approve workflow.

- [ ] Next.js dashboard: brand list page, brand detail page
- [ ] Creative upload UI: drag-and-drop zone, upload progress bars, grid view of uploaded creatives
- [ ] Extraction trigger button + real-time progress bar (WebSocket)
- [ ] Design system viewer: color swatches, typography samples, layout frequency chart, copy pattern summary
- [ ] Design system editor:
  - Color palette: add/remove/edit colors, set roles (primary/secondary/accent/bg/text)
  - Typography: edit font families, size hierarchy, density preference
  - Layout rules: approve/reject/reorder layout structures
  - Copy guidelines: edit tone, CTA conventions, language preferences
  - Logo rules: placement, sizing
- [ ] Version history: snapshot on save, view previous versions
- [ ] Regional variant UI: create variant for region+language, edit override fields
- [ ] Approval workflow: draft -> review -> approved status transitions
- [ ] Onboarding guide: markdown render + download

**Milestone:** Full extract-review-edit-approve flow in browser. Regional variants for Hindi/English.

### Sprint 4: Creative Generation - Backend (Weeks 10-12)

**Goal:** Template rendering pipeline producing 4-8 variants via API.

- [ ] Template definition schema: JSON metadata + HTML/CSS file per template
- [ ] Build 10-15 HTML/CSS templates:
  - product-hero (2-3 variants)
  - lifestyle (2 variants)
  - testimonial (2 variants)
  - offer-led (2-3 variants)
  - social-proof (1-2 variants)
  - split-layout (1-2 variants)
  - text-overlay (1-2 variants)
- [ ] Playwright rendering worker (Python):
  - Install Chromium via Playwright
  - Load HTML with injected CSS variables, data URIs, text content
  - Screenshot at 2x device pixel ratio
  - Optimize via Pillow
  - Upload to S3/R2
- [ ] Background removal worker (Python): rembg processing, quality detection
- [ ] Design system constraint engine (Node): map brand colors/fonts/rules to CSS variables
- [ ] Copy generation worker (Node): Claude generates copy variants (multiple approaches per template)
- [ ] Sarvam integration (Node): translation API for Hindi copy, transliteration for brand names
- [ ] Variant selection algorithm (Node): ensure diversity across layout, copy, emphasis, color
- [ ] Rationale generation: structured JSON per variant
- [ ] Generation job orchestration: copy gen + image preprocessing (parallel) -> rendering -> upload
- [ ] Test via API against 3-5 brands with approved design systems
- [ ] Instrument generation pipeline: record `generation` event (with variant count), `ai_api_call` events for copy generation and translation calls

**Milestone:** `POST /api/generate` returns 4-8 PNG variants with rationale in <3 min. Show to designer.

### Sprint 5: Generation Frontend + Intelligence (Weeks 13-15)

**Goal:** Generation UI working. Intelligence data compiled and integrated.

- [ ] Generation UI:
  - Select brand (design system auto-loaded)
  - Upload product images
  - Select platform (Instagram feed/story, Facebook, Google Display) + dimensions
  - Select target region + language
  - Optional: additional instructions text field
  - Generate button + progress
- [ ] Variant gallery: grid of generated variants, each with expandable rationale
- [ ] Variant actions: select, reject, regenerate with adjustments, download
- [ ] Intelligence CRUD API + admin seed scripts
- [ ] **[MANUAL] Compile geographic intelligence** (see Manual Steps section)
- [ ] **[MANUAL] Compile category intelligence** (see Manual Steps section)
- [ ] Import intelligence data via seed script or admin API
- [ ] Confidence framework: tier badges on all intelligence data
- [ ] Integrate intelligence into generation pipeline:
  - When target region selected, fetch relevant intelligence
  - Auto-adjust copy tone, language mix, price framing based on region
  - Include intelligence citations in variant rationale
- [ ] Define campaign brief output schema in `packages/shared` (Zod schema for brief structure including evidence citations and confidence tiers)
- [ ] Add `campaign_briefs` table to database (see Database Schema section)
- [ ] Add campaign briefing API endpoints: `POST /api/brands/:id/briefs`, `GET /api/brands/:id/briefs`, `GET /api/brands/:id/briefs/:bid`

**Milestone:** End-to-end flow with intelligence-informed generation. Region affects output. Campaign briefing schema and API layer ready.

### Sprint 6: Festival Module + Compliance (Weeks 16-17)

**Goal:** Festival-specific generation. Brand compliance checker.

- [ ] **[MANUAL] Compile festival intelligence** (see Manual Steps section)
- [ ] Festival intelligence API endpoints
- [ ] Festival-specific HTML/CSS templates (festival color palettes, motif overlays as CSS backgrounds/borders)
- [ ] Festival generation workflow: brand + festival + regions -> region-adapted variants
- [ ] Brand compliance checker:
  - Upload any creative (human-made or AI-generated)
  - Check against design system: color compliance, typography, logo placement, copy tone
  - Cultural sensitivity checks (hard blockers)
  - Output structured evaluation with specific pass/fail per rule
- [ ] Compliance API endpoint + basic UI
- [ ] Instrument evaluation: record `evaluation` event per compliance check
- [ ] Campaign briefing generation worker (Node): Claude-powered, informed by intelligence + design system + brand profile
- [ ] Structured briefing UI: input form (brand auto-populated, target geography, segment, objective, time period) + structured output display
- [ ] Brief output carries per-recommendation confidence tiers and evidence citations
- [ ] Brief references intelligence entries with linked UUIDs
- [ ] Brief-to-generation flow: use finalized brief as input to creative generation pipeline

**Milestone:** Festival creatives regionally distinct + brand-compliant. Compliance checker works.

### Sprint 7: Polish & Validation (Week 18)

**Goal:** Meet Phase 1 exit criteria.

- [ ] End-to-end testing with 5-10 real brand sets
- [ ] Performance optimization (extraction <10 min, generation <3 min)
- [ ] Edge cases: insufficient creatives (<20), highly inconsistent brands, missing product images, large files
- [ ] Frontend polish: loading states, error states, empty states, responsive layout
- [ ] Devanagari validation across all templates and font combinations
- [ ] Error handling: graceful failures, retry logic, user-facing error messages
- [ ] Basic monitoring: Sentry for errors, simple health checks
- [ ] Usage summary aggregation: cron job to roll up `usage_events` into `usage_summaries` monthly. Basic usage dashboard showing per-org and per-brand consumption (replaces manual API cost tracking)
- [ ] **[MANUAL] Designer validation** - final round of "refine vs redo" testing

**Milestone:** Phase 1 exit criteria met. Ready for Phase 2 (early agency partners).

---

## Out of Scope for Phase 1

The following are explicitly deferred to later phases:

- **Video generation** -- static ad creatives only
- **Self-serve brand tier** -- agency-only access in Phase 1
- **Competitive intelligence** -- no ad library scraping or competitor tracking
- **More than one vertical** -- beauty/fashion only
- **More than two languages** -- Hindi + English only (regional languages deferred)
- **Full market intelligence network** -- curated data only, not yet aggregated from agencies
- **Ad account API connections** -- CSV upload for data ingestion; API integrations deferred to Phase 2

---

## Key Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Claude Vision accuracy on Indian ads | Extraction quality | Build 100-creative validation dataset. Compare vs human ground truth. Supplement with programmatic extraction. Haiku 4.5 for analysis, Sonnet for synthesis. Upgrade to Sonnet for analysis if Haiku quality insufficient. |
| Node-Python integration complexity | Dev overhead | BullMQ Redis as communication layer. Python workers are standalone processes. Interface: JSON in, JSON + URLs out. |
| Playwright rendering speed | Slow generation | ~2-5s per variant is acceptable. Pre-warm browser instance. Multiple browser contexts in parallel. |
| Claude API cost at scale | Budget concern | Haiku 4.5 for analysis + Sonnet for synthesis = ~$0.35/brand. Prompt caching saves ~20%. Batch API halves cost further. At 100 brands/month: ~$35. |
| Template variety insufficient | "Template-y" output | HTML/CSS more expressive than canvas. Study Meta Ad Library. 3-5 variation params per template. Early designer feedback. |
| Cultural sensitivity errors | Trust-destroying | Human expert verification for festival data. Conservative defaults. Cultural checks as hard blockers. |
| Solo developer timeline (18 weeks) | Scope slip | Prioritize P0 (extraction + generation). Intelligence/festival can defer. Ship working extraction+generation loop first. |
| Data breach between agencies | Trust-destroying | Design constraint: org_id isolation must be absolute. No cross-org data access at any layer. Review all queries for org_id scoping. |
| Meta/Google platform API changes | Core functionality degradation | Phase 1 uses CSV upload by default -- this IS the mitigation. API integrations deferred to Phase 2. |
| Cold start intelligence quality | Early trust loss | Phase 1 intelligence is manually curated and expert-validated -- this IS the mitigation. Narrow scope (1 vertical, 5 states) concentrates depth. |

### Known Unknowns

- Will agencies actually connect ad accounts, or will data ingestion be friction-heavy? (Phase 2 question -- Phase 1 uses CSV upload)
- Is the creative generation quality threshold achievable in v1, or will "80% done" drafts still require too much human rework?
- How quickly does market intelligence decay? Is a 6-month refresh cycle fast enough, or do patterns shift quarterly?
- Will brand founders engage with the design system review, or will they delegate and disengage?

---

## Verification & Exit Criteria

- **Extraction accuracy:** Compare extracted design systems against human-produced ones for 5+ brands. Target: 80%+ agreement on color, layout, typography.
- **Generation quality:** Designer blind test - show generated vs blank canvas. Target: >70% prefer to refine generated output. Generated creatives require <30 minutes of human refinement on average (not just "refine vs redo").
- **Time to first creative:** Time from brand onboarding to first generated creative: target <1 week.
- **Cultural safety:** Cultural error rate: zero tolerance. Any cultural error in generated creative is a P0 incident.
- **Devanagari rendering:** Playwright/Chrome handles natively. Visual regression tests against reference renders. Target: pixel-perfect for supported fonts.
- **Performance:** Extraction <10 min for 50 images. Generation <3 min for 8 variants.
- **Intelligence coverage:** Audit checklist for 5 states x 3 tiers x beauty/fashion. Every entry has confidence tier + source.
- **Campaign briefing:** Generates structured brief within 2 minutes. Every recommendation carries evidence citation.
