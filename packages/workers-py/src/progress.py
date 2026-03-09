import json
import logging

import redis as redispy

from .config import REDIS_URL

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
