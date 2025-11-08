import re
import io
from PIL import Image

AMT_REGEX = r'(?:rs\.?|inr|₹|rs)\s?[:\-]?\s?([0-9\.,]+)'
ALT_AMT_REGEX = r'([0-9]{1,3}(?:[,\.][0-9]{3})*(?:\.[0-9]{1,2})?)'
DATE_REGEX = r'(\d{1,2}[\/\-\.\s]\d{1,2}[\/\-\.\s]\d{2,4})'
DATE_REGEX2 = r'([A-Za-z]{3,9}\s+\d{1,2},\s*\d{4})'


def load_image_from_bytes(image_bytes):
    """Return PIL Image from raw bytes or file-like object."""
    if isinstance(image_bytes, (bytes, bytearray)):
        return Image.open(io.BytesIO(image_bytes))
    return Image.open(image_bytes)


def normalize_spaces(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()
