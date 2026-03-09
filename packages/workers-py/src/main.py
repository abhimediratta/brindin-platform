import asyncio
import signal
import threading
import logging
from urllib.parse import urlparse

import uvicorn
from bullmq import Worker

from .config import REDIS_URL, HEALTH_PORT
from .health import app as health_app
from .preprocessing.thumbnails import generate_thumbnail
from .db import update_creative_thumbnail

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)


async def process_thumbnail(job, token):
    """Process a thumbnail generation job from BullMQ."""
    data = job.data
    creative_id = data["creativeId"]
    s3_key = data["s3Key"]

    logger.info("Processing thumbnail for creative %s (key: %s)", creative_id, s3_key)

    thumb_key = generate_thumbnail(s3_key)
    update_creative_thumbnail(creative_id, thumb_key)

    logger.info("Thumbnail created: %s", thumb_key)
    return {"thumbnailKey": thumb_key}


def start_health_server():
    """Run the FastAPI health server in a daemon thread."""
    uvicorn.run(health_app, host="0.0.0.0", port=HEALTH_PORT, log_level="warning")


async def main():
    # Start health server in background thread
    health_thread = threading.Thread(target=start_health_server, daemon=True)
    health_thread.start()
    logger.info("Health server started on port %d", HEALTH_PORT)

    # Parse Redis connection from URL
    parsed = urlparse(REDIS_URL)
    redis_opts = {
        "host": parsed.hostname or "localhost",
        "port": parsed.port or 6379,
    }
    if parsed.password:
        redis_opts["password"] = parsed.password

    # Create BullMQ worker
    worker = Worker("thumbnails", process_thumbnail, redis_opts)
    logger.info("Thumbnail worker started, listening on queue 'thumbnails'")

    # Graceful shutdown
    loop = asyncio.get_running_loop()
    stop_event = asyncio.Event()

    def handle_signal():
        logger.info("Shutdown signal received")
        stop_event.set()

    for sig in (signal.SIGTERM, signal.SIGINT):
        loop.add_signal_handler(sig, handle_signal)

    await stop_event.wait()

    logger.info("Closing worker...")
    await worker.close()
    logger.info("Worker stopped")


if __name__ == "__main__":
    asyncio.run(main())
