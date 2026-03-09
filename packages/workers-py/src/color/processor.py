import logging

from ..db import update_creative_color_analysis
from ..progress import signal_stage_progress
from ..storage import download_from_s3
from .extractor import extract_colors

logger = logging.getLogger(__name__)


async def process_color_extraction(job, token) -> dict:
    """Process a color extraction job: download image, extract colors, save to DB."""
    data = job.data
    creative_id = data["creativeId"]
    s3_key = data["s3Key"]
    job_id = data.get("jobId")

    logger.info("Color extraction for creative %s (key: %s)", creative_id, s3_key)

    try:
        image_bytes = download_from_s3(s3_key)
        color_analysis = extract_colors(image_bytes)

        update_creative_color_analysis(creative_id, color_analysis)

        if job_id:
            signal_stage_progress(job_id, "color-extraction")

        logger.info("Color extraction complete for creative %s: %d colors", creative_id, color_analysis["colorCount"])
        return {"creativeId": creative_id, "colorCount": color_analysis["colorCount"]}

    except Exception:
        logger.exception("Error extracting colors for creative %s", creative_id)
        if job_id:
            signal_stage_progress(job_id, "color-extraction")
        return {"creativeId": creative_id, "status": "error"}
