import psycopg2
from psycopg2.extras import Json

from .config import DATABASE_URL


def update_creative_thumbnail(creative_id: str, thumbnail_key: str) -> None:
    """Update the thumbnail_url column for a brand_creatives row."""
    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE brand_creatives SET thumbnail_url = %s WHERE id = %s",
                (thumbnail_key, creative_id),
            )
        conn.commit()
    finally:
        conn.close()


def update_creative_preprocessing(
    creative_id: str,
    phash: str | None,
    dimensions: dict | None,
    is_excluded: bool,
    exclusion_reason: str | None,
) -> None:
    """Update preprocessing results for a brand_creatives row."""
    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor() as cur:
            cur.execute(
                """UPDATE brand_creatives
                   SET phash = %s,
                       dimensions = %s,
                       is_excluded = %s,
                       exclusion_reason = %s
                 WHERE id = %s""",
                (phash, Json(dimensions) if dimensions else None, is_excluded, exclusion_reason, creative_id),
            )
        conn.commit()
    finally:
        conn.close()


def get_brand_phashes(brand_id: str) -> dict[str, str]:
    """Return {creative_id: phash_hex} for all non-excluded creatives with a phash in the brand."""
    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, phash FROM brand_creatives WHERE brand_id = %s AND phash IS NOT NULL AND is_excluded = false",
                (brand_id,),
            )
            return {row[0]: row[1] for row in cur.fetchall()}
    finally:
        conn.close()
