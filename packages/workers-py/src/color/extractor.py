import colorsys
import io
import math

from PIL import Image
import numpy as np
from sklearn.cluster import KMeans

# sRGB → XYZ D65 matrix
_SRGB_TO_XYZ = np.array([
    [0.4124564, 0.3575761, 0.1804375],
    [0.2126729, 0.7151522, 0.0721750],
    [0.0193339, 0.1191920, 0.9503041],
])

# XYZ → sRGB matrix (inverse)
_XYZ_TO_SRGB = np.linalg.inv(_SRGB_TO_XYZ)

# D65 reference white
_D65 = np.array([0.95047, 1.00000, 1.08883])


def _linearize_srgb(c: np.ndarray) -> np.ndarray:
    """Convert sRGB [0,1] to linear RGB."""
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def _delinearize_srgb(c: np.ndarray) -> np.ndarray:
    """Convert linear RGB to sRGB [0,1]."""
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(np.maximum(c, 0), 1.0 / 2.4) - 0.055)


def _f(t: np.ndarray) -> np.ndarray:
    """CIE Lab forward transform helper."""
    delta = 6.0 / 29.0
    return np.where(t > delta ** 3, np.cbrt(t), t / (3 * delta ** 2) + 4.0 / 29.0)


def _f_inv(t: np.ndarray) -> np.ndarray:
    """CIE Lab inverse transform helper."""
    delta = 6.0 / 29.0
    return np.where(t > delta, t ** 3, 3 * delta ** 2 * (t - 4.0 / 29.0))


def rgb_to_lab(rgb: np.ndarray) -> np.ndarray:
    """Convert RGB (0-255) array of shape (..., 3) to CIE Lab."""
    srgb = rgb.astype(np.float64) / 255.0
    linear = _linearize_srgb(srgb)
    xyz = linear @ _SRGB_TO_XYZ.T
    xyz_norm = xyz / _D65

    fx = _f(xyz_norm)
    L = 116.0 * fx[..., 1] - 16.0
    a = 500.0 * (fx[..., 0] - fx[..., 1])
    b = 200.0 * (fx[..., 1] - fx[..., 2])

    return np.stack([L, a, b], axis=-1)


def lab_to_rgb(lab: np.ndarray) -> np.ndarray:
    """Convert CIE Lab array of shape (..., 3) to RGB (0-255)."""
    L, a, b = lab[..., 0], lab[..., 1], lab[..., 2]

    fy = (L + 16.0) / 116.0
    fx = a / 500.0 + fy
    fz = fy - b / 200.0

    xyz_norm = np.stack([_f_inv(fx), _f_inv(fy), _f_inv(fz)], axis=-1)
    xyz = xyz_norm * _D65
    linear = xyz @ _XYZ_TO_SRGB.T
    srgb = _delinearize_srgb(linear)
    rgb = np.clip(srgb * 255.0, 0, 255).astype(np.uint8)
    return rgb


def rgb_to_hex(r: int, g: int, b: int) -> str:
    """Convert RGB values to hex string."""
    return f"#{r:02x}{g:02x}{b:02x}"


def rgb_to_hsl(r: int, g: int, b: int) -> dict:
    """Convert RGB (0-255) to HSL using colorsys (returns H 0-360, S 0-100, L 0-100)."""
    h, l, s = colorsys.rgb_to_hls(r / 255.0, g / 255.0, b / 255.0)
    return {
        "h": round(h * 360, 1),
        "s": round(s * 100, 1),
        "l": round(l * 100, 1),
    }


def extract_colors(image_bytes: bytes, k: int = 8) -> dict:
    """
    Extract dominant colors from an image using k-means clustering in Lab space.

    Returns:
        {
            colors: [{ hex, rgb, hsl, lab, percentage }],
            dominantColor: { hex, rgb },
            backgroundColor: { hex, rgb },
            colorCount: int
        }
    """
    img = Image.open(io.BytesIO(image_bytes))

    # Normalize to RGB
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")

    # Resize for performance
    img = img.resize((200, 200), Image.LANCZOS)
    pixels = np.array(img).reshape(-1, 3)

    # Convert to Lab space for perceptually uniform clustering
    lab_pixels = rgb_to_lab(pixels)

    # K-Means clustering
    kmeans = KMeans(n_clusters=k, n_init=10, random_state=42)
    labels = kmeans.fit_predict(lab_pixels)
    centers_lab = kmeans.cluster_centers_

    # Calculate percentage per cluster
    total_pixels = len(labels)
    unique, counts = np.unique(labels, return_counts=True)
    percentages = {label: count / total_pixels * 100 for label, count in zip(unique, counts)}

    # Background detection: sample 10px border edges
    img_array = np.array(img)
    h, w = img_array.shape[:2]
    border_pixels = []
    for row in range(h):
        for col in range(w):
            if row < 10 or row >= h - 10 or col < 10 or col >= w - 10:
                border_pixels.append(row * w + col)
    border_labels = labels[border_pixels]
    border_unique, border_counts = np.unique(border_labels, return_counts=True)
    bg_cluster = border_unique[np.argmax(border_counts)]

    # Convert centers back to RGB
    centers_rgb = lab_to_rgb(centers_lab)

    # Build color list
    colors = []
    for i in range(k):
        r, g, b = int(centers_rgb[i][0]), int(centers_rgb[i][1]), int(centers_rgb[i][2])
        lab_vals = centers_lab[i]
        colors.append({
            "hex": rgb_to_hex(r, g, b),
            "rgb": {"r": r, "g": g, "b": b},
            "hsl": rgb_to_hsl(r, g, b),
            "lab": {"l": round(float(lab_vals[0]), 2), "a": round(float(lab_vals[1]), 2), "b": round(float(lab_vals[2]), 2)},
            "percentage": round(percentages.get(i, 0), 2),
        })

    # Sort by percentage descending
    colors.sort(key=lambda c: c["percentage"], reverse=True)

    dominant = colors[0]
    bg_r, bg_g, bg_b = int(centers_rgb[bg_cluster][0]), int(centers_rgb[bg_cluster][1]), int(centers_rgb[bg_cluster][2])

    return {
        "colors": colors,
        "dominantColor": {"hex": dominant["hex"], "rgb": dominant["rgb"]},
        "backgroundColor": {"hex": rgb_to_hex(bg_r, bg_g, bg_b), "rgb": {"r": bg_r, "g": bg_g, "b": bg_b}},
        "colorCount": k,
    }
