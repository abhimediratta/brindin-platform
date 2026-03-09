import io
from dataclasses import dataclass

from PIL import Image

from ..storage import download_from_s3

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB
MIN_DIMENSION = 200


@dataclass
class ValidationResult:
    valid: bool
    reason: str | None          # None if valid
    dimensions: dict | None     # {"width": int, "height": int}
    image_bytes: bytes | None   # Pass through to avoid re-download


def validate_creative(s3_key: str, file_type: str, file_size_bytes: int) -> ValidationResult:
    """Validate a creative image for format, size, and minimum dimensions."""
    if file_type not in ALLOWED_TYPES:
        return ValidationResult(valid=False, reason="unsupported format", dimensions=None, image_bytes=None)

    if file_size_bytes > MAX_FILE_SIZE:
        return ValidationResult(valid=False, reason="file too large", dimensions=None, image_bytes=None)

    image_bytes = download_from_s3(s3_key)

    img = Image.open(io.BytesIO(image_bytes))
    w, h = img.size

    if w < MIN_DIMENSION or h < MIN_DIMENSION:
        return ValidationResult(valid=False, reason=f"too small: {w}x{h}", dimensions={"width": w, "height": h}, image_bytes=None)

    return ValidationResult(valid=True, reason=None, dimensions={"width": w, "height": h}, image_bytes=image_bytes)
