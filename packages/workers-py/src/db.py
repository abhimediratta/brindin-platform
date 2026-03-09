import psycopg2
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
