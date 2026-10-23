from collections import defaultdict
from typing import List, Dict, Tuple, Set
from app.core.parser import compute_soundex, compute_metaphone

def generate_blocking_keys(record: Dict) -> Dict[str, str]:
    """
    Extracts blocking keys for multi-pass pre-filtering:
    - pass_1_phone: 10-digit clean phone
    - pass_2_dob_soundex: DOB + Soundex(FirstName)
    - pass_2_dob_metaphone: DOB + Metaphone(FirstName)
    - pass_3_pincode_soundex: PIN + Soundex(LastName/FirstName)
    """
    phone = record.get("cleaned_phone", "")
    dob = record.get("cleaned_dob", "")
    name = record.get("cleaned_name", "")
    pin = record.get("cleaned_pin", "")
    
    tokens = name.split()
    first_name = tokens[0] if tokens else ""
    last_name = tokens[-1] if len(tokens) > 1 else first_name
    
    sndx_first = compute_soundex(first_name)
    meta_first = compute_metaphone(first_name)
    
    keys = {
        "phone": phone if (phone and len(phone) == 10) else None,
        "dob_soundex": f"{dob}_{sndx_first}" if (dob and sndx_first) else None,
        "dob_metaphone": f"{dob}_{meta_first}" if (dob and meta_first) else None,
        "pin_soundex": f"{pin}_{compute_soundex(last_name)}" if (pin and len(pin) == 6) else None
    }
    return keys

def run_multi_pass_blocking(records: List[Dict]) -> List[Tuple[Dict, Dict, str]]:
    """
    Executes Phase 3 Multi-Pass Blocking.
    Returns unique candidate pairs with their match source/pass rationale.
    Avoids expensive O(N^2) pairwise comparisons.
    """
    phone_blocks = defaultdict(list)
    dob_phonetic_blocks = defaultdict(list)
    
    for idx, rec in enumerate(records):
        rec_id = rec.get("record_id", str(idx))
        keys = generate_blocking_keys(rec)
        
        # Pass 1: Exact Phone Block
        if keys["phone"]:
            phone_blocks[keys["phone"]].append(rec)
            
        # Pass 2: DOB + Phonetic (Metaphone or Soundex)
        if keys["dob_metaphone"]:
            dob_phonetic_blocks[keys["dob_metaphone"]].append(rec)
        elif keys["dob_soundex"]:
            dob_phonetic_blocks[keys["dob_soundex"]].append(rec)

    seen_pairs: Set[Tuple[str, str]] = set()
    candidate_pairs: List[Tuple[Dict, Dict, str]] = []

    def get_pair_key(id_a: str, id_b: str) -> Tuple[str, str]:
        return (id_a, id_b) if id_a < id_b else (id_b, id_a)

    # Process Pass 1
    for phone, block in phone_blocks.items():
        if len(block) > 1:
            for i in range(len(block)):
                for j in range(i + 1, len(block)):
                    rec_a = block[i]
                    rec_b = block[j]
                    id_a = rec_a.get("record_id")
                    id_b = rec_b.get("record_id")
                    if id_a == id_b:
                        continue
                    pair_key = get_pair_key(id_a, id_b)
                    if pair_key not in seen_pairs:
                        seen_pairs.add(pair_key)
                        candidate_pairs.append((rec_a, rec_b, "Pass 1: Exact Phone"))

    # Process Pass 2
    for key, block in dob_phonetic_blocks.items():
        if len(block) > 1:
            for i in range(len(block)):
                for j in range(i + 1, len(block)):
                    rec_a = block[i]
                    rec_b = block[j]
                    id_a = rec_a.get("record_id")
                    id_b = rec_b.get("record_id")
                    if id_a == id_b:
                        continue
                    pair_key = get_pair_key(id_a, id_b)
                    if pair_key not in seen_pairs:
                        seen_pairs.add(pair_key)
                        candidate_pairs.append((rec_a, rec_b, "Pass 2: Phonetic + DOB"))

    return candidate_pairs
