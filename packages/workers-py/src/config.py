import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from monorepo root
_root_env = Path(__file__).resolve().parent.parent.parent.parent / ".env"
load_dotenv(_root_env)

REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379")
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/brindin")

S3_ENDPOINT = os.environ.get("R2_ENDPOINT", "http://localhost:9000")
S3_ACCESS_KEY = os.environ.get("R2_ACCESS_KEY", "minioadmin")
S3_SECRET_KEY = os.environ.get("R2_SECRET_KEY", "minioadmin")
S3_BUCKET = os.environ.get("R2_BUCKET", "brindin-assets")
S3_REGION = os.environ.get("R2_REGION", "us-east-1")

HEALTH_PORT = int(os.environ.get("HEALTH_PORT", "3002"))
