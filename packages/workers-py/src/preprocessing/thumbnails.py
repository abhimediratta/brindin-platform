import io
from pathlib import PurePosixPath

from PIL import Image

from ..config import S3_BUCKET
from ..storage import get_s3_client

THUMB_WIDTH = 300
THUMB_QUALITY = 80


def _derive_thumbnail_key(original_key: str) -> str:
    """Given orgs/.../creatives/{fileId}/{filename}, return orgs/.../creatives/{fileId}/thumb.webp"""
    parent = str(PurePosixPath(original_key).parent)
    return f"{parent}/thumb.webp"


def generate_thumbnail(s3_key: str) -> str:
    """Download original from S3, resize to 300px wide WebP, upload, return thumbnail key."""
    s3 = get_s3_client()

    # Download original
    response = s3.get_object(Bucket=S3_BUCKET, Key=s3_key)
    image_data = response["Body"].read()

    # Resize
    img = Image.open(io.BytesIO(image_data))
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")

    aspect = img.height / img.width
    new_height = round(THUMB_WIDTH * aspect)
    img = img.resize((THUMB_WIDTH, new_height), Image.LANCZOS)

    # Encode as WebP
    buffer = io.BytesIO()
    img.save(buffer, format="WEBP", quality=THUMB_QUALITY)
    buffer.seek(0)

    # Upload thumbnail
    thumb_key = _derive_thumbnail_key(s3_key)
    s3.put_object(
        Bucket=S3_BUCKET,
        Key=thumb_key,
        Body=buffer.getvalue(),
        ContentType="image/webp",
    )

    return thumb_key
