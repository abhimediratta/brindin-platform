from datetime import datetime, timezone
from fastapi import FastAPI

app = FastAPI(docs_url=None, redoc_url=None)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "worker": "workers-py",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
