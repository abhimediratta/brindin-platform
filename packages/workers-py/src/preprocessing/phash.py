import io

import imagehash
from PIL import Image

HAMMING_THRESHOLD = 5


def compute_phash(image_bytes: bytes) -> str:
    """Compute a perceptual hash of the image and return it as a hex string."""
    img = Image.open(io.BytesIO(image_bytes))
    return str(imagehash.phash(img))


def find_duplicate(phash_hex: str, existing_phashes: dict[str, str]) -> str | None:
    """Check if phash_hex is a near-duplicate of any existing hash.

    Returns the matching creative ID if hamming distance < HAMMING_THRESHOLD, else None.
    """
    target = imagehash.hex_to_hash(phash_hex)
    for creative_id, existing_hex in existing_phashes.items():
        existing = imagehash.hex_to_hash(existing_hex)
        if target - existing < HAMMING_THRESHOLD:
            return creative_id
    return None
