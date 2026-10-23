import re
from datetime import datetime
from typing import Optional, Tuple, Dict, Set, List
import unicodedata

try:
    import jellyfish
except ImportError:
    jellyfish = None

# Comprehensive list of Indian honorifics and professional titles
HONORIFICS = [
    r"^dr\.?", r"^vaidya\b", r"^vaid\b", r"^shri\b", r"^shree\b", r"^smt\.?",
    r"^shrimati\b", r"^kumari\b", r"^km\.?", r"^mr\.?", r"^mrs\.?", r"^ms\.?",
    r"^prof\.?", r"^master\b", r"^er\.?", r"^pandit\b", r"^pt\.?", r"^late\b",
    r"^adv\.?", r"^swami\b"
]
HONORIFIC_REGEX = re.compile(r"|".join(HONORIFICS), re.IGNORECASE)

COMMON_DATE_FORMATS = [
    "%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%m/%d/%Y",
    "%Y/%m/%d", "%d.%m.%Y", "%d %b %Y", "%d %B %Y",
    "%Y%m%d", "%d%m%Y"
]

def clean_text(text: Optional[str]) -> str:
    """Normalize unicode, strip unwanted special characters, and collapse spaces."""
    if not text:
        return ""
    text = unicodedata.normalize("NFKD", str(text))
    # Replace non-word characters except hyphen and apostrophe (useful in names)
    text = re.sub(r"[^a-zA-Z0-9\s\-\']", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def strip_honorifics(name: Optional[str]) -> str:
    """
    Strips Indian honorifics and titles to prevent structural false negatives.
    Example: 'Vaidya Dr. Aaditya Malviya' -> 'Aaditya Malviya'
             'Smt. Sunita Sharma' -> 'Sunita Sharma'
    """
    if not name:
        return ""
    cleaned = clean_text(name)
    tokens = cleaned.split()
    while tokens:
        first_token = tokens[0].lower().rstrip(".")
        is_honorific = any(re.match(h, first_token, re.IGNORECASE) for h in HONORIFICS)
        if is_honorific:
            tokens.pop(0)
        else:
            break
    
    result = " ".join(tokens).title()
    return result

def normalize_phone_number(phone_raw: Optional[str]) -> str:
    """
    Normalizes phone number to strict 10-digit Indian mobile number format.
    Handles +91, 0 prefix, spaces, dashes, parentheses.
    """
    if not phone_raw:
        return ""
    # Extract only digits
    digits = re.sub(r"\D", "", str(phone_raw))
    
    # Strip leading 91 if length is 12 (e.g., 919876543210 -> 9876543210)
    if len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]
    # Strip leading 0 if length is 11 (e.g., 09876543210 -> 9876543210)
    elif len(digits) == 11 and digits.startswith("0"):
        digits = digits[1:]
    
    # Return 10-digit string if valid length
    if len(digits) == 10:
        return digits
    elif len(digits) > 10:
        # Sometimes extra trailing digits/extension or repeated country code
        return digits[-10:]
    return digits  # fallback to whatever digits exist

def normalize_dob(dob_raw: Optional[str]) -> str:
    """
    Standardizes varied date-of-birth formats to ISO YYYY-MM-DD.
    """
    if not dob_raw:
        return ""
    cleaned_date = str(dob_raw).strip()
    if not cleaned_date:
        return ""
    
    # Check if already ISO
    if re.match(r"^\d{4}-\d{2}-\d{2}$", cleaned_date):
        return cleaned_date
    
    for fmt in COMMON_DATE_FORMATS:
        try:
            parsed = datetime.strptime(cleaned_date, fmt)
            return parsed.strftime("%Y-%m-%d")
        except ValueError:
            continue
            
    # Try regex fallback for partial formats
    m = re.match(r"^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$", cleaned_date)
    if m:
        d, mth, yr = m.groups()
        if len(yr) == 2:
            yr = f"19{yr}" if int(yr) > 30 else f"20{yr}"
        try:
            parsed = datetime(int(yr), int(mth), int(d))
            return parsed.strftime("%Y-%m-%d")
        except ValueError:
            pass
            
    return cleaned_date

def normalize_pincode(pin_raw: Optional[str]) -> str:
    """Standardizes PIN Code to 6-digit string."""
    if not pin_raw:
        return ""
    digits = re.sub(r"\D", "", str(pin_raw))
    if len(digits) >= 6:
        return digits[:6]
    return digits

def compute_soundex(name: str) -> str:
    """Computes Soundex phonetic representation."""
    if not name:
        return "0000"
    if jellyfish:
        return jellyfish.soundex(name)
    # Simple Python fallback
    name = name.upper()
    first_char = name[0]
    mapping = {
        'B': '1', 'F': '1', 'P': '1', 'V': '1',
        'C': '2', 'G': '2', 'J': '2', 'K': '2', 'Q': '2', 'S': '2', 'X': '2', 'Z': '2',
        'D': '3', 'T': '3',
        'L': '4',
        'M': '5', 'N': '5',
        'R': '6'
    }
    encoded = [first_char]
    for char in name[1:]:
        code = mapping.get(char, '0')
        if code != '0' and code != encoded[-1]:
            encoded.append(code)
    soundex_code = "".join(encoded).replace('0', '')
    return (soundex_code + "0000")[:4]

def compute_metaphone(name: str) -> str:
    """Computes Metaphone phonetic key optimized for Indic names."""
    if not name:
        return ""
    if jellyfish:
        return jellyfish.metaphone(name)
    # Minimal phonetic simplification fallback
    val = name.upper()
    val = re.sub(r"[AEIOU]", "", val[1:])  # drop vowels after first
    return (name[:1].upper() + val)[:6]

def detect_shared_family_phones(records: List[Dict]) -> Set[str]:
    """
    Phase 2 Safety Rule:
    Flags phone numbers associated with 3 or more distinct patient names
    (common multi-generational household entries in Indian demographics)
    to deactivate aggressive auto-merging on phone match alone.
    """
    phone_to_names: Dict[str, Set[str]] = {}
    for r in records:
        phone = r.get("cleaned_phone")
        name = r.get("cleaned_name")
        if phone and len(phone) == 10 and name:
            if phone not in phone_to_names:
                phone_to_names[phone] = set()
            phone_to_names[phone].add(name.lower())
    
    shared_phones = {phone for phone, names in phone_to_names.items() if len(names) >= 3}
    return shared_phones

