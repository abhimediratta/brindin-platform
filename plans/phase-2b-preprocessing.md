# Phase 2B: Preprocessing Worker (Python)

## Context

Phase 2A added Redis pub/sub infrastructure, new queue definitions (`preprocessing`, `color-extraction`, `vision-analysis`), and the Node worker entry point. Phase 2B builds Stage 1 of the extraction pipeline: the Python preprocessing worker that validates images, computes perceptual hashes for deduplication, and filters out unusable creatives.

## What Exists (key files to read first)

- `packages/workers-py/src/main.py` — BullMQ Worker on `thumbnails` queue, FastAPI health server on daemon thread, asyncio event loop with graceful shutdown
- `packages/workers-py/src/config.py` — env vars (REDIS_URL, DATABASE_URL, R2_*, HEALTH_PORT)
- `packages/workers-py/src/db.py` — `update_creative_thumbnail(creative_id, thumbnail_key)` using psycopg2
- `packages/workers-py/src/preprocessing/thumbnails.py` — `generate_thumbnail(s3_key)`: S3 download → Pillow resize 300px → WebP → S3 upload. Uses `_get_s3_client()` helper and `_derive_thumbnail_key()`.
- `packages/backend/src/db/schema.ts` — `brandCreatives` table columns:
  - `phash` (text, nullable)
  - `dimensions` (jsonb, nullable)
  - `isExcluded` (boolean, default false)
  - `exclusionReason` (text, nullable)
  - `fileUrl` (text, not null) — S3 key
  - `fileType` (text, not null) — MIME type
  - `fileSizeBytes` (integer, nullable)
- `packages/workers-py/requirements.txt` — already includes `imagehash>=4.3.0`, `Pillow>=10.0.0`
- `packages/backend/src/lib/redis-pubsub.ts` — (from 2A) `signalStageProgress(jobId, stage)` for counter-based coordination

## What to Build

### 1. Image Validator

**New file: `packages/workers-py/src/preprocessing/validator.py`**

```python
from dataclasses import dataclass

@dataclass
class ValidationResult:
    valid: bool
    reason: str | None          # None if valid, description if invalid
    dimensions: dict | None     # {"width": int, "height": int} if valid
    image_bytes: bytes | None   # Pass through to avoid re-downloading

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25MB
MIN_DIMENSION = 200               # 200x200 minimum

def validate_creative(s3_key: str, file_type: str, file_size_bytes: int) -> ValidationResult:
    """
    1. Check file_type in ALLOWED_TYPES → reject with "unsupported format: {type}"
    2. Check file_size_bytes <= MAX_FILE_SIZE → reject with "file too large: {size}MB"
    3. Download from S3 using _get_s3_client() pattern from thumbnails.py
    4. Open with Pillow, get dimensions
    5. Check width >= MIN_DIMENSION and height >= MIN_DIMENSION → reject with "too small: {w}x{h}"
    6. Return ValidationResult(valid=True, dimensions={width, height}, image_bytes=bytes)
    """
```

Reuse the `_get_s3_client()` helper from `thumbnails.py` — either import it or extract to a shared `src/storage.py` util.

### 2. Perceptual Hashing + Dedup

**New file: `packages/workers-py/src/preprocessing/phash.py`**

```python
import imagehash
from PIL import Image
import io

def compute_phash(image_bytes: bytes) -> str:
    """
    Open image with Pillow, compute phash via imagehash.phash().
    Returns hex string representation.
    """
    img = Image.open(io.BytesIO(image_bytes))
    return str(imagehash.phash(img))

def find_duplicate(phash_hex: str, existing_phashes: dict[str, str]) -> str | None:
    """
    Compare phash against existing_phashes {creativeId: phashHex}.
    Returns creativeId of duplicate if hamming distance < 5, else None.
    Uses imagehash.hex_to_hash() for conversion.
    """
    target = imagehash.hex_to_hash(phash_hex)
    for creative_id, existing_hex in existing_phashes.items():
        existing = imagehash.hex_to_hash(existing_hex)
        if target - existing < 5:  # hamming distance
            return creative_id
    return None
```

### 3. Preprocessing Queue Processor

**New file: `packages/workers-py/src/preprocessing/processor.py`**

```python
import json
import redis as redis_lib
from ..config import REDIS_URL

async def process_preprocessing(job, token):
    """
    BullMQ job processor for 'preprocessing' queue.

    Job data schema:
    {
        "creativeId": str,    # brand_creatives.id
        "brandId": str,       # brand_creatives.brand_id
        "s3Key": str,         # brand_creatives.file_url (S3 key)
        "fileType": str,      # brand_creatives.file_type (MIME)
        "fileSizeBytes": int, # brand_creatives.file_size_bytes
        "jobId": str          # extraction_jobs.id (for progress tracking)
    }

    Flow:
    1. validate_creative(s3Key, fileType, fileSizeBytes)
    2. If invalid:
       - update_creative_preprocessing(creativeId, phash=None, dimensions=None, is_excluded=True, exclusion_reason=reason)
       - signal_stage_progress(jobId, 'preprocessing')
       - return { creativeId, excluded: True, reason }
    3. compute_phash(image_bytes)
    4. get_brand_phashes(brandId) → check for duplicates
    5. If duplicate:
       - update_creative_preprocessing(creativeId, phash=hash, dimensions=dims, is_excluded=True, exclusion_reason=f"duplicate of {dup_id}")
    6. Else:
       - update_creative_preprocessing(creativeId, phash=hash, dimensions=dims, is_excluded=False, exclusion_reason=None)
    7. signal_stage_progress(jobId, 'preprocessing') via Redis INCR
    8. return { creativeId, excluded, reason }
    """
```

For `signal_stage_progress`: directly use Redis INCR + PUBLISH (same logic as the Node `signalStageProgress`):
```python
def signal_stage_progress(job_id: str, stage: str):
    r = redis_lib.from_url(REDIS_URL)
    completed = r.incr(f"extraction:{job_id}:{stage}:completed")
    total = r.get(f"extraction:{job_id}:{stage}:total")
    if total and completed >= int(total):
        r.publish(f"extraction:orchestration:{job_id}",
                  json.dumps({"stage": stage, "event": "complete"}))
    r.close()
```

### 4. Extend DB Helper

**Modify: `packages/workers-py/src/db.py`**

Add functions following the existing `update_creative_thumbnail` pattern (psycopg2, direct connection, parameterized queries):

```python
def update_creative_preprocessing(
    creative_id: str,
    phash: str | None,
    dimensions: dict | None,  # {"width": int, "height": int} or None
    is_excluded: bool,
    exclusion_reason: str | None
) -> None:
    """
    UPDATE brand_creatives
    SET phash = %s, dimensions = %s, is_excluded = %s, exclusion_reason = %s
    WHERE id = %s

    Note: dimensions is JSONB — pass json.dumps(dimensions) or None
    """

def get_brand_phashes(brand_id: str) -> dict[str, str]:
    """
    SELECT id, phash FROM brand_creatives
    WHERE brand_id = %s AND phash IS NOT NULL AND is_excluded = false

    Returns {creative_id: phash_hex_string}
    """
```

### 5. Register Preprocessing Worker

**Modify: `packages/workers-py/src/main.py`**

Add the preprocessing worker alongside the existing thumbnail worker:

```python
from src.preprocessing.processor import process_preprocessing

# In the main() function, after thumbnail worker creation:
preprocessing_worker = Worker("preprocessing", process_preprocessing, redis_opts)
print("[Worker] Preprocessing worker registered on queue: preprocessing")

# Add to graceful shutdown:
await preprocessing_worker.close()
```

Note: Don't add the `color-extraction` worker yet — that's Phase 2C.

### 6. Extract Shared S3 Helper (optional but recommended)

**New file: `packages/workers-py/src/storage.py`**

Extract `_get_s3_client()` from `thumbnails.py` into a shared module to avoid duplication between thumbnails, validator, and color extractor.

```python
import boto3
from .config import S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY, S3_REGION, S3_BUCKET

def get_s3_client():
    return boto3.client("s3", endpoint_url=S3_ENDPOINT, ...)

def download_from_s3(s3_key: str) -> bytes:
    client = get_s3_client()
    response = client.get_object(Bucket=S3_BUCKET, Key=s3_key)
    return response["Body"].read()
```

Update `thumbnails.py` to import from this shared module.

## Files Summary

| Action | File | What Changes |
|--------|------|-------------|
| New | `workers-py/src/preprocessing/validator.py` | Image validation (format, size, dimensions) |
| New | `workers-py/src/preprocessing/phash.py` | Perceptual hashing + duplicate detection |
| New | `workers-py/src/preprocessing/processor.py` | BullMQ job processor for preprocessing queue |
| New | `workers-py/src/preprocessing/__init__.py` | Package init (if missing) |
| New | `workers-py/src/storage.py` | Shared S3 client helper (extracted from thumbnails) |
| Modify | `workers-py/src/db.py` | Add `update_creative_preprocessing`, `get_brand_phashes` |
| Modify | `workers-py/src/main.py` | Register preprocessing worker |
| Modify | `workers-py/src/preprocessing/thumbnails.py` | Import S3 client from shared storage.py |

## Verification

1. Start infra: `docker compose up -d`
2. Start API + Python workers: `pnpm --filter backend dev` & `cd packages/workers-py && python -m src.main`
3. Create a brand and upload test images (valid + invalid):
   - A normal JPEG (should pass)
   - A 100x100 PNG (should be excluded: "too small")
   - A 30MB file (should be excluded: "file too large")
   - Two near-identical images (second should be excluded: "duplicate of {id}")
4. Set Redis stage counters: `redis-cli SET extraction:test:preprocessing:total 4` and `SET extraction:test:preprocessing:completed 0`
5. Enqueue preprocessing jobs manually via Redis or the API
6. Verify `brand_creatives` rows: excluded images have `is_excluded=true` + `exclusion_reason`, valid ones have `phash` + `dimensions` populated
7. Verify Redis counter incremented to total and completion event published
