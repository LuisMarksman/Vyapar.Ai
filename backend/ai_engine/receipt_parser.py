"""
receipt_parser.py
-----------------
Extracts structured data from receipt/invoice images.
Now improved for Indian receipts with smart regexes, multiple fallbacks, and confidence scores.
"""

from PIL import Image
import pytesseract
import re
from datetime import datetime
from io import BytesIO

# --- Regex patterns ---
AMT_REGEX = r'(?:Total|Balance\s*Due|Grand\s*Total|Amount\s*Due|Net\s*Amount|Total\s*Bill|Total\s*Payable)\s*[:\-]?\s*₹?\s*([0-9,]+(?:\.\d{1,2})?)'
ALT_AMT_REGEX = r'(?:₹|INR|Rs\.?)\s*[:\-]?\s*([0-9,]+(?:\.\d{1,2})?)'
DATE_REGEXES = [
    r'(\d{1,2}[\/\-\.\s]\d{1,2}[\/\-\.\s]\d{2,4})',             # 04/11/2025
    r'([A-Za-z]{3,9}\s+\d{1,2},\s*\d{4})',                     # Nov 4, 2025
    r'(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})',                   # 2025-11-04
]
VENDOR_LINE_HINTS = r'(invoice|gst|tax|bill|receipt|door|item|total|balance|amount|due)'

# --- OCR + Cleaning ---
def extract_text_from_image(image_bytes):
    """Extract raw text using Tesseract OCR."""
    try:
        if isinstance(image_bytes, str):
            img = Image.open(image_bytes)
        else:
            img = Image.open(BytesIO(image_bytes))
        img = img.convert('L')
        text = pytesseract.image_to_string(img, lang='eng')
        return text.strip()
    except Exception as e:
        print(f"[OCR ERROR] {e}")
        return ""

# --- Amount Parser ---
def parse_amount(text):
    candidates = []
    for pat in [AMT_REGEX, ALT_AMT_REGEX]:
        found = re.findall(pat, text, re.IGNORECASE)
        for f in found:
            try:
                val = float(str(f).replace(',', '').strip())
                if 10 <= val <= 10000000:  # sanity range
                    candidates.append(val)
            except:
                pass
    if not candidates:
        return None, 0.3
    # pick the largest number (usually total)
    best = max(candidates)
    confidence = 0.8 if len(candidates) > 0 else 0.5
    if 'total' in text.lower() or 'balance' in text.lower():
        confidence += 0.1
    return best, min(confidence, 1.0)

# --- Date Parser ---
def parse_date(text):
    for pat in DATE_REGEXES:
        m = re.search(pat, text)
        if m:
            date_str = m.group(1)
            for fmt in ['%d/%m/%Y', '%d-%m-%Y', '%Y-%m-%d', '%b %d, %Y', '%d.%m.%Y']:
                try:
                    d = datetime.strptime(date_str.strip(), fmt).date()
                    return d.isoformat(), 0.9
                except:
                    continue
    return None, 0.3

# --- Vendor Parser ---
def parse_vendor(text):
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    if not lines:
        return None, 0.0
    first_lines = lines[:5]  # top section
    for line in first_lines:
        if not re.search(VENDOR_LINE_HINTS, line, re.I) and len(line) > 3:
            return line, 0.8
    return lines[0], 0.6

# --- Category Guess ---
def guess_category(text):
    text_lower = text.lower()
    if 'fuel' in text_lower or 'diesel' in text_lower or 'petrol' in text_lower:
        return 'Fuel'
    if 'grocery' in text_lower or 'supermarket' in text_lower or 'mart' in text_lower:
        return 'Grocery'
    if 'restaurant' in text_lower or 'hotel' in text_lower or 'food' in text_lower:
        return 'Food'
    if 'hardware' in text_lower or 'plywood' in text_lower or 'furniture' in text_lower:
        return 'Hardware'
    return 'General'

# --- Main Function ---
def parse_receipt(image_bytes):
    text = extract_text_from_image(image_bytes)
    amount, amt_conf = parse_amount(text)
    date, date_conf = parse_date(text)
    vendor, vend_conf = parse_vendor(text)
    category = guess_category(text)

    return {
        "raw_text": text,
        "vendor": vendor,
        "date": date,
        "amount": amount,
        "category_guess": category,
        "confidences": {
            "amount_confidence": amt_conf,
            "date_confidence": date_conf,
            "vendor_confidence": vend_conf
        }
    }

if __name__ == "__main__":
    # Quick local test
    print(parse_receipt("sample_receipt.jpg"))
