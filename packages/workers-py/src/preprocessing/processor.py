import json
import logging

import redis as redispy

from ..config import REDIS_URL
from ..db import update_creative_preprocessing, get_brand_phashes
from .validator import validate_creative
from .phash import compute_phash, find_duplicate

logger = logging.getLogger(__name__)


def signal_stage_progress(job_id: str, stage: str) -> bool:
    """Mirror Node signalStageProgress: increment completed counter, publish if stage done."""
    r = redispy.from_url(REDIS_URL)
    try:
        completed = r.incr(f"extraction:{job_id}:{stage}:completed")
        total = r.get(f"extraction:{job_id}:{stage}:total")

        if total is not None and completed >= int(total):
            r.publish(
                f"extraction:orchestration:{job_id}",
                json.dumps({"event": "stage-complete", "stage": stage}),
            )
            return True
        return False
    finally:
        r.close()


async def process_preprocessing(job, token) -> dict:
    """Process a preprocessing job: validate, hash, detect duplicates."""
    data = job.data
    creative_id = data["creativeId"]
    brand_id = data["brandId"]
    s3_key = data["s3Key"]
    file_type = data["fileType"]
    file_size_bytes = data["fileSizeBytes"]
    job_id = data.get("jobId")

    logger.info("Preprocessing creative %s (key: %s)", creative_id, s3_key)

    try:
        # Step 1: Validate
        result = validate_creative(s3_key, file_type, file_size_bytes)

        if not result.valid:
            logger.info("Creative %s excluded: %s", creative_id, result.reason)
            update_creative_preprocessing(
                creative_id,
                phash=None,
                dimensions=result.dimensions,
                is_excluded=True,
                exclusion_reason=result.reason,
            )
            if job_id:
                signal_stage_progress(job_id, "preprocessing")
            return {"creativeId": creative_id, "status": "excluded", "reason": result.reason}

        # Step 2: Compute perceptual hash
        phash_hex = compute_phash(result.image_bytes)

        # Step 3: Check for duplicates
        existing_phashes = get_brand_phashes(brand_id)
        duplicate_of = find_duplicate(phash_hex, existing_phashes)

        if duplicate_of:
            reason = f"duplicate of {duplicate_of}"
            logger.info("Creative %s excluded: %s", creative_id, reason)
            update_creative_preprocessing(
                creative_id,
                phash=phash_hex,
                dimensions=result.dimensions,
                is_excluded=True,
                exclusion_reason=reason,
            )
            if job_id:
                signal_stage_progress(job_id, "preprocessing")
            return {"creativeId": creative_id, "status": "duplicate", "duplicateOf": duplicate_of}

        # Step 4: Valid and unique — save results
        update_creative_preprocessing(
            creative_id,
            phash=phash_hex,
            dimensions=result.dimensions,
            is_excluded=False,
            exclusion_reason=None,
        )
        if job_id:
            signal_stage_progress(job_id, "preprocessing")

        logger.info("Creative %s preprocessed: %s", creative_id, phash_hex)
        return {"creativeId": creative_id, "status": "ok", "phash": phash_hex, "dimensions": result.dimensions}

    except Exception:
        logger.exception("Error preprocessing creative %s", creative_id)
        update_creative_preprocessing(
            creative_id,
            phash=None,
            dimensions=None,
            is_excluded=True,
            exclusion_reason="preprocessing error",
        )
        if job_id:
            signal_stage_progress(job_id, "preprocessing")
        return {"creativeId": creative_id, "status": "error"}
