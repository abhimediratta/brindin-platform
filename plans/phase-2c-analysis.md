# Phase 2C: Individual Analysis Workers (Color Extraction + Claude Vision)

**Status: COMPLETED**

## Context

Phase 2A built the infrastructure (Redis pub/sub, new queues, worker entry point). Phase 2B built the preprocessing worker (validation, phash dedup). Phase 2C builds Stage 2 of the extraction pipeline: two workers that run in parallel — Python color extraction (k-means in Lab space) and Node Claude Vision analysis (layout, typography, copy, image treatment, logo, OCR).

## What Exists (key files to read first)

- `packages/workers-py/src/main.py` — BullMQ Workers for `thumbnails` + `preprocessing` queues. Asyncio loop with graceful shutdown.
- `packages/workers-py/src/storage.py` — (from 2B) `get_s3_client()`, `download_from_s3(s3_key)`
- `packages/workers-py/src/db.py` — (from 2B) has `update_creative_preprocessing()`, `get_brand_phashes()`
- `packages/workers-py/requirements.txt` — already includes `scikit-learn>=1.3.0`, `Pillow>=10.0.0`
- `packages/backend/src/lib/queue.ts` — (from 2A) has `colorExtractionQueue`, `visionAnalysisQueue`, `createWorker()` factory
- `packages/backend/src/lib/redis-pubsub.ts` — (from 2A) `signalStageProgress(jobId, stage)`
- `packages/backend/src/workers/start.ts` — (from 2A) Node worker entry point skeleton
- `packages/backend/src/lib/storage.ts` — `getSignedDownloadUrl(key)` for generating presigned URLs
- `packages/backend/src/db/schema.ts` — `brandCreatives` table:
  - `colorAnalysis` (jsonb, nullable) — stores color extraction output
  - `analysis` (jsonb, nullable) — stores Claude Vision output
- `packages/shared/src/schemas/design-system.ts` — target output schemas for reference:
  - `colorEntrySchema`: `{ hex, role, frequency, confidence }`
  - `fontEntrySchema`: `{ family, type, role, weight }`
  - `layoutEntrySchema`: `{ type, frequency, platforms }`

## What to Build

### 1. Color Extraction (Python)

**New file: `packages/workers-py/src/color/__init__.py`** (empty package init)

**New file: `packages/workers-py/src/color/extractor.py`**

```python
import numpy as np
from PIL import Image
from sklearn.cluster import KMeans
import io, colorsys

RESIZE_SIZE = 200   # Resize to 200x200 for analysis
NUM_CLUSTERS = 8    # Extract top 8 colors
BORDER_SAMPLE = 10  # Pixels from edge to sample for background detection

def extract_colors(image_bytes: bytes) -> dict:
    """
    Full color analysis pipeline.

    1. Open image, convert RGBA/P to RGB, resize to 200x200
    2. Convert to numpy array, reshape to (pixels, 3)
    3. Convert RGB to Lab color space:
       - RGB → XYZ → Lab (use standard conversion matrices)
       - Or use sklearn.preprocessing if simpler
    4. K-means clustering (k=8) in Lab space
    5. Calculate pixel percentage per cluster center
    6. Background detection:
       - Sample 10px border on all 4 edges
       - Find which cluster those border pixels belong to
       - Most common cluster in borders = background
    7. Convert cluster centers: Lab → RGB → Hex, RGB → HSL
    8. Sort by percentage (descending)

    Returns:
    {
        "colors": [
            {
                "hex": "#RRGGBB",
                "rgb": [r, g, b],
                "hsl": [h, s, l],
                "lab": [l, a, b],
                "percentage": 0.0-1.0,
                "isBackground": bool
            },
            ...
        ],
        "dominantColor": "#RRGGBB",
        "backgroundColor": "#RRGGBB" | None,
        "colorCount": 8
    }
    """
```

Color space conversion helpers (within the same file):
```python
def rgb_to_lab(rgb: np.ndarray) -> np.ndarray:
    """Convert RGB (0-255) array to CIE Lab. Standard D65 illuminant."""
    # RGB → linear RGB → XYZ → Lab
    # Use the sRGB to XYZ matrix and Lab conversion formulas

def lab_to_rgb(lab: np.ndarray) -> np.ndarray:
    """Inverse of above."""

def rgb_to_hex(r: int, g: int, b: int) -> str:
    return f"#{r:02x}{g:02x}{b:02x}"

def rgb_to_hsl(r: int, g: int, b: int) -> list[float]:
    return list(colorsys.rgb_to_hls(r/255, g/255, b/255))  # Note: Python uses HLS not HSL
```

**New file: `packages/workers-py/src/color/processor.py`**

```python
async def process_color_extraction(job, token):
    """
    BullMQ job processor for 'color-extraction' queue.

    Job data:
    {
        "creativeId": str,
        "s3Key": str,
        "jobId": str     # extraction_jobs.id for progress tracking
    }

    Flow:
    1. download_from_s3(s3Key) → image_bytes
    2. colors = extract_colors(image_bytes)
    3. update_creative_color_analysis(creativeId, colors)  # DB update
    4. signal_stage_progress(jobId, 'color-extraction')    # Redis counter
    5. return { creativeId, colorCount: len(colors) }
    """
```

**Modify: `packages/workers-py/src/db.py`**

Add:
```python
def update_creative_color_analysis(creative_id: str, color_analysis: dict) -> None:
    """UPDATE brand_creatives SET color_analysis = %s WHERE id = %s"""
    # Pass json.dumps(color_analysis) as the parameter
```

**Modify: `packages/workers-py/src/main.py`**

Register the color extraction worker:
```python
from src.color.processor import process_color_extraction

color_worker = Worker("color-extraction", process_color_extraction, redis_opts)
# Add to graceful shutdown
```

### 2. Claude Vision Analysis (Node)

**New file: `packages/backend/src/workers/claude-vision.ts`**

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { createWorker } from '../lib/queue.js';
import { db } from '../db/index.js';
import { brandCreatives } from '../db/schema.js';
import { getSignedDownloadUrl } from '../lib/storage.js';
import { signalStageProgress, publishProgress } from '../lib/redis-pubsub.js';
import { recordUsageEvent } from '../lib/usage.js';
import { eq } from 'drizzle-orm';

// ── Types ──

interface VisionJobData {
  creativeIds: string[];   // batch of 3-5
  s3Keys: string[];        // matching S3 keys
  jobId: string;           // extraction_jobs.id
  brandId: string;
  orgId: string;
}

interface IndividualAnalysis {
  creativeId: string;
  layout: {
    type: string;          // e.g. "product-hero", "testimonial", "offer-led", "split-layout"
    gridStructure: string; // e.g. "single-column", "two-column", "overlay"
    hierarchy: string;     // e.g. "image-dominant", "text-dominant", "balanced"
  };
  typography: {
    fonts: Array<{
      family: string;      // detected or estimated font family
      role: string;        // "heading" | "body" | "cta" | "other"
      weight: string;      // "bold", "regular", "light"
      estimatedSize: string; // "large", "medium", "small"
    }>;
    textDensity: string;   // "high", "medium", "low"
  };
  imageTreatment: {
    style: string;         // "photography", "illustration", "flat-lay", "lifestyle", "UGC-style"
    colorGrading: string;  // "warm", "cool", "neutral", "vibrant", "muted"
    productProminence: string; // "hero", "contextual", "minimal", "absent"
  };
  copyPatterns: {
    headline: string | null;     // extracted headline text
    bodyText: string | null;     // extracted body text
    cta: string | null;          // extracted CTA text
    tone: string;                // "formal", "casual", "playful", "aspirational", "urgent"
    structure: string;           // "offer-led", "benefit-led", "question-hook", "social-proof", "testimonial"
    languages: string[];         // ["en", "hi", "hinglish", etc.]
    languageMix: string;         // "english-only", "hindi-only", "code-mixed", etc.
  };
  logoUsage: {
    position: string;     // "top-left", "top-right", "bottom-center", etc.
    size: string;         // "large", "medium", "small", "absent"
    treatment: string;    // "on-color", "on-white", "transparent", "absent"
  };
  platformEstimate: string; // "instagram-feed", "instagram-story", "facebook", "google-display", "unknown"
}

// ── System Prompt (cached across calls) ──

const SYSTEM_PROMPT = `You are a brand design system analyst. You analyze advertising creatives to extract structured design patterns.

For each image provided, output a JSON object with these exact fields:

{
  "creativeId": "<the creative ID provided>",
  "layout": {
    "type": "product-hero" | "testimonial" | "offer-led" | "split-layout" | "text-overlay" | "lifestyle" | "social-proof" | "benefit-grid" | "minimal" | "other",
    "gridStructure": "single-column" | "two-column" | "overlay" | "grid" | "asymmetric" | "other",
    "hierarchy": "image-dominant" | "text-dominant" | "balanced"
  },
  "typography": {
    "fonts": [{"family": "...", "role": "heading|body|cta|other", "weight": "bold|regular|light", "estimatedSize": "large|medium|small"}],
    "textDensity": "high" | "medium" | "low"
  },
  "imageTreatment": {
    "style": "photography" | "illustration" | "flat-lay" | "lifestyle" | "UGC-style" | "graphic" | "mixed",
    "colorGrading": "warm" | "cool" | "neutral" | "vibrant" | "muted",
    "productProminence": "hero" | "contextual" | "minimal" | "absent"
  },
  "copyPatterns": {
    "headline": "extracted text or null",
    "bodyText": "extracted text or null",
    "cta": "extracted text or null",
    "tone": "formal" | "casual" | "playful" | "aspirational" | "urgent",
    "structure": "offer-led" | "benefit-led" | "question-hook" | "social-proof" | "testimonial" | "other",
    "languages": ["en", "hi", ...],
    "languageMix": "english-only" | "hindi-only" | "code-mixed" | "regional-only" | "mixed"
  },
  "logoUsage": {
    "position": "top-left" | "top-right" | "bottom-left" | "bottom-right" | "bottom-center" | "center" | "absent",
    "size": "large" | "medium" | "small" | "absent",
    "treatment": "on-color" | "on-white" | "transparent" | "absent"
  },
  "platformEstimate": "instagram-feed" | "instagram-story" | "facebook-feed" | "google-display" | "whatsapp" | "unknown"
}

Important:
- Extract ALL visible text in the image (headlines, body copy, CTAs, fine print)
- Identify languages accurately — distinguish Hindi, English, Hinglish (code-mixed), and regional languages
- For fonts, estimate the family (e.g., "sans-serif", "Poppins-like", "serif") even if you can't identify exactly
- Be specific about layout type — don't default to "other" unless truly unusual
- Output ONLY valid JSON array with one object per image, in the same order as images provided`;

// ── Worker ──

async function processVisionBatch(job: any): Promise<void> {
  const { creativeIds, s3Keys, jobId, brandId, orgId } = job.data as VisionJobData;
  const anthropic = new Anthropic();

  // Download images and encode as base64
  const imageContents: Anthropic.ImageBlockParam[] = [];
  for (const s3Key of s3Keys) {
    const url = await getSignedDownloadUrl(s3Key);
    // Fetch image bytes via URL
    const response = await fetch(url);
    const buffer = Buffer.from(await response.arrayBuffer());
    const base64 = buffer.toString('base64');
    const mediaType = s3Key.endsWith('.png') ? 'image/png'
      : s3Key.endsWith('.webp') ? 'image/webp'
      : 'image/jpeg';

    imageContents.push({
      type: 'image',
      source: { type: 'base64', media_type: mediaType, data: base64 },
    });
  }

  // Build user message: images + creative IDs
  const userContent: Anthropic.ContentBlockParam[] = [
    ...imageContents,
    {
      type: 'text',
      text: `Analyze these ${creativeIds.length} creatives. Creative IDs in order: ${JSON.stringify(creativeIds)}. Return a JSON array with one analysis object per image.`,
    },
  ];

  // Call Claude Haiku 4.5
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20241022',
    max_tokens: 4096,
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: userContent }],
  });

  // Parse response
  const textContent = response.content.find(c => c.type === 'text');
  if (!textContent || textContent.type !== 'text') throw new Error('No text response from Claude');

  const analyses: IndividualAnalysis[] = JSON.parse(textContent.text);

  // Store each creative's analysis in DB
  for (const analysis of analyses) {
    await db.update(brandCreatives)
      .set({ analysis })
      .where(eq(brandCreatives.id, analysis.creativeId));
  }

  // Record API usage (fire-and-forget)
  recordUsageEvent({
    orgId,
    brandId,
    eventType: 'ai_api_call',
    eventSubtype: 'vision_analysis',
    quantity: creativeIds.length,
    unit: 'images',
    metadata: {
      model: 'claude-haiku-4-5-20241022',
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    },
  }).catch(() => {});

  // Signal stage progress (one signal per batch)
  for (const _id of creativeIds) {
    await signalStageProgress(jobId, 'vision-analysis');
  }
}

// Register worker
export const visionWorker = createWorker<VisionJobData>(
  'vision-analysis',
  processVisionBatch,
  {
    concurrency: 3,
    limiter: { max: 10, duration: 60000 }, // Rate limit: 10 jobs/min
  },
);
```

**Modify: `packages/backend/src/workers/start.ts`**

Import and register the vision worker:
```typescript
import { visionWorker } from './claude-vision.js';
console.log('  - vision analysis (queue: vision-analysis)');

// In shutdown:
await visionWorker.close();
```

## Files Summary

| Action | File | What Changes |
|--------|------|-------------|
| New | `workers-py/src/color/__init__.py` | Package init |
| New | `workers-py/src/color/extractor.py` | K-means color extraction in Lab space |
| New | `workers-py/src/color/processor.py` | Color extraction queue job handler |
| New | `backend/src/workers/claude-vision.ts` | Claude Haiku vision analysis worker |
| Modify | `workers-py/src/db.py` | Add `update_creative_color_analysis()` |
| Modify | `workers-py/src/main.py` | Register color-extraction worker |
| Modify | `backend/src/workers/start.ts` | Import + register vision worker |

## Verification

### Color Extraction
1. Start infra + Python workers
2. Upload a test image with clear dominant colors (e.g., a red/white brand creative)
3. Enqueue a color-extraction job: `{ creativeId, s3Key, jobId: "test" }`
4. Check `brand_creatives.color_analysis` — should contain 8 colors with hex values, dominant color should match visual inspection, background detection should identify the correct background

### Vision Analysis
1. Start infra + Node workers (`pnpm --filter backend dev:workers`)
2. Ensure `ANTHROPIC_API_KEY` is set in `.env`
3. Upload 3-5 test ad creatives (preferably real Indian D2C ads)
4. Enqueue a vision-analysis job with creativeIds + s3Keys
5. Check `brand_creatives.analysis` for each creative — should contain layout type, typography, copy extraction, language detection
6. Verify extracted text matches what's visible in the images
7. Verify usage event was recorded in `usage_events` table
