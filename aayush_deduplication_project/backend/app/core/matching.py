import math
from typing import Dict, Any, Tuple
import jellyfish
from config import settings

class DualMatchingEngine:
    """
    Core Dual-Matching Engine combining:
    1. Fuzzy Text Comparison (Jaro-Winkler, Levenshtein)
    2. Vector Embedding Semantic Space (MiniLM / Character-Ngram Cosine)
    3. Multi-Attribute Verification (DOB, PIN, Phone, Shared Family Phone)
    """

    def __init__(self):
        self._sbert_model = None
        self._load_vector_model()

    def _load_vector_model(self):
        try:
            from sentence_transformers import SentenceTransformer
            self._sbert_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        except Exception:
            self._sbert_model = None

    def jaro_winkler_similarity(self, s1: str, s2: str) -> float:
        """Calculates Jaro-Winkler similarity with prefix bonus (evaluating both natural and token-sorted variants)."""
        if not s1 or not s2:
            return 0.0
        raw_sim = float(jellyfish.jaro_winkler_similarity(s1.lower(), s2.lower()))
        sorted_s1 = " ".join(sorted(s1.lower().split()))
        sorted_s2 = " ".join(sorted(s2.lower().split()))
        sorted_sim = float(jellyfish.jaro_winkler_similarity(sorted_s1, sorted_s2))
        return max(raw_sim, sorted_sim)

    def levenshtein_similarity(self, s1: str, s2: str) -> float:
        """Normalized Levenshtein similarity metric (evaluating both natural and token-sorted variants)."""
        if not s1 or not s2:
            return 0.0
        s1_lower = s1.lower()
        s2_lower = s2.lower()
        dist = jellyfish.levenshtein_distance(s1_lower, s2_lower)
        max_len = max(len(s1_lower), len(s2_lower), 1)
        raw_sim = float(max(0.0, 1.0 - (dist / max_len)))

        sorted_s1 = " ".join(sorted(s1_lower.split()))
        sorted_s2 = " ".join(sorted(s2_lower.split()))
        sorted_dist = jellyfish.levenshtein_distance(sorted_s1, sorted_s2)
        sorted_max = max(len(sorted_s1), len(sorted_s2), 1)
        sorted_sim = float(max(0.0, 1.0 - (sorted_dist / sorted_max)))
        return max(raw_sim, sorted_sim)

    def token_set_cosine_similarity(self, s1: str, s2: str) -> float:
        """
        Calculates semantic vector closeness in token and subword n-gram space.
        Specifically engineered for:
        - Inverted name order: 'Malviya Aaditya' vs 'Aaditya Malviya' -> 1.0
        - Structural abbreviations: 'R. K. Choudhary' vs 'Ram Kumar Choudhary'
        """
        if not s1 or not s2:
            return 0.0

        t1 = set(s1.lower().split())
        t2 = set(s2.lower().split())

        # Exact token match (order-invariant)
        if t1 == t2:
            return 1.0

        # Check abbreviation / initial matching
        # e.g., 'R' matches 'Ram', 'K' matches 'Kumar'
        list1 = [t.rstrip(".") for t in s1.lower().split()]
        list2 = [t.rstrip(".") for t in s2.lower().split()]

        # Generate character 2-grams and 3-grams for semantic n-gram vector
        def get_ngrams(text: str, n: int = 2) -> Dict[str, int]:
            grams = {}
            clean = f" {text.lower()} "
            for i in range(len(clean) - n + 1):
                gram = clean[i:i+n]
                grams[gram] = grams.get(gram, 0) + 1
            return grams

        g1 = get_ngrams(s1, 2)
        g2 = get_ngrams(s2, 2)

        # Dot product and magnitudes for cosine similarity
        dot = sum(g1[k] * g2.get(k, 0) for k in g1)
        mag1 = math.sqrt(sum(v * v for v in g1.values()))
        mag2 = math.sqrt(sum(v * v for v in g2.values()))

        ngram_cosine = dot / (mag1 * mag2) if (mag1 * mag2) > 0 else 0.0

        # Check initials compatibility bonus
        initials_bonus = 0.0
        if len(list1) == len(list2):
            matches = 0
            for a, b in zip(list1, list2):
                if a == b:
                    matches += 1
                elif len(a) == 1 and b.startswith(a):
                    matches += 0.95
                elif len(b) == 1 and a.startswith(b):
                    matches += 0.95
            if matches >= len(list1):
                initials_bonus = 0.25

        # Check phonetic equivalence for Indic regional spelling variations (e.g., Choudhary vs Chowdhury)
        phonetic_bonus = 0.0
        from app.core.parser import compute_soundex, compute_metaphone
        m1 = [compute_metaphone(t) for t in list1]
        m2 = [compute_metaphone(t) for t in list2]
        s1_snd = [compute_soundex(t) for t in list1]
        s2_snd = [compute_soundex(t) for t in list2]

        if len(list1) == len(list2) and len(list1) > 0:
            p_matches = sum(1 for a, b in zip(m1, m2) if a and a == b)
            snd_matches = sum(1 for a, b in zip(s1_snd, s2_snd) if a and a != "0000" and a == b)
            if p_matches == len(list1) or snd_matches == len(list1):
                phonetic_bonus = 0.30

        score = min(1.0, ngram_cosine + initials_bonus + phonetic_bonus)
        return float(score)

    def vector_cosine_similarity(self, s1: str, s2: str) -> float:
        """
        Calculates Bi-Encoder MiniLM semantic cosine similarity if model is loaded,
        otherwise uses high-precision token-set vector space engine.
        """
        if self._sbert_model:
            try:
                embeddings = self._sbert_model.encode([s1, s2])
                dot = sum(a * b for a, b in zip(embeddings[0], embeddings[1]))
                norm_a = math.sqrt(sum(a * a for a in embeddings[0]))
                norm_b = math.sqrt(sum(b * b for b in embeddings[1]))
                if norm_a > 0 and norm_b > 0:
                    return float(max(0.0, min(1.0, dot / (norm_a * norm_b))))
            except Exception:
                pass
        
        return self.token_set_cosine_similarity(s1, s2)

    def compute_hybrid_name_score(self, name_a: str, name_b: str) -> Tuple[float, float, float, float]:
        """
        Returns (jaro_winkler, levenshtein, vector_cosine, combined_score).
        """
        jw = self.jaro_winkler_similarity(name_a, name_b)
        lev = self.levenshtein_similarity(name_a, name_b)
        vec = self.vector_cosine_similarity(name_a, name_b)

        w1 = settings.WEIGHT_JARO_WINKLER
        w2 = settings.WEIGHT_LEVENSHTEIN
        w3 = settings.WEIGHT_VECTOR_COSINE

        combined = (w1 * jw) + (w2 * lev) + (w3 * vec)
        return jw, lev, vec, round(combined, 4)

    def evaluate_pair(self, rec_a: Dict[str, Any], rec_b: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates a candidate pair across all demographic vectors and returns
        the full confidence scoring, decision bucket, and explanation.
        """
        name_a = rec_a.get("cleaned_name", "")
        name_b = rec_b.get("cleaned_name", "")

        phone_a = rec_a.get("cleaned_phone", "")
        phone_b = rec_b.get("cleaned_phone", "")

        dob_a = rec_a.get("cleaned_dob", "")
        dob_b = rec_b.get("cleaned_dob", "")

        pin_a = rec_a.get("cleaned_pin", "")
        pin_b = rec_b.get("cleaned_pin", "")

        shared_family_phone = (
            rec_a.get("shared_family_phone", False) or 
            rec_b.get("shared_family_phone", False)
        )

        jw, lev, vec, name_score = self.compute_hybrid_name_score(name_a, name_b)

        # Attribute agreement modifiers
        dob_exact = bool(dob_a and dob_b and dob_a == dob_b)
        phone_exact = bool(phone_a and phone_b and phone_a == phone_b)
        pin_exact = bool(pin_a and pin_b and pin_a == pin_b)

        overall_score = name_score

        # Multi-attribute confidence weighting
        # If Phone + DOB match exactly, boost name confidence
        if phone_exact and dob_exact:
            overall_score = min(1.0, overall_score * 0.70 + 0.30)
        elif phone_exact and not dob_exact and dob_a and dob_b:
            # Different DOB with same phone: check if year differs (possible parent/child)
            if dob_a[:4] != dob_b[:4]:
                overall_score *= 0.85
        elif not phone_exact and dob_exact:
            # DOB matches but phone differs: slight adjustment
            overall_score = min(1.0, overall_score * 0.85 + 0.15)

        if pin_exact and overall_score < 0.95:
            overall_score = min(1.0, overall_score + 0.03)

        overall_score = round(overall_score, 4)

        # Decision Bucketing logic (Phase 5)
        decision_bucket = "New Patient"
        reasons = []

        if overall_score >= settings.EXACT_MATCH_THRESHOLD:
            decision_bucket = "Exact Match"
            reasons.append("High multi-attribute similarity exceeding 95% threshold.")
        elif overall_score >= settings.POSSIBLE_MATCH_THRESHOLD:
            decision_bucket = "Possible Match"
            reasons.append("Moderate similarity between 75% and 94% requiring human review.")
        else:
            decision_bucket = "New Patient"
            reasons.append("Insufficient similarity (< 75%); identity determined distinct.")

        # SAFETY NET: Shared Family Phone Rule
        # If phone is shared across 3+ distinct names and name similarity isn't near perfect,
        # never auto-merge!
        if shared_family_phone and phone_exact:
            if decision_bucket == "Exact Match" and name_score < 0.95:
                decision_bucket = "Possible Match"
                reasons.append(
                    "[Safety Interlock] Shared family phone detected (multi-generational household). "
                    "Auto-merge deactivated to prevent combining family member records."
                )

        return {
            "record_a_id": rec_a.get("record_id"),
            "record_b_id": rec_b.get("record_id"),
            "record_a_name": name_a,
            "record_b_name": name_b,
            "record_a_branch": rec_a.get("source_branch"),
            "record_b_branch": rec_b.get("source_branch"),
            "record_a_phone": phone_a,
            "record_b_phone": phone_b,
            "record_a_dob": dob_a,
            "record_b_dob": dob_b,
            "record_a_pin": pin_a,
            "record_b_pin": pin_b,
            "jaro_winkler_score": jw,
            "levenshtein_score": lev,
            "vector_cosine_score": vec,
            "hybrid_confidence_score": overall_score,
            "decision_bucket": decision_bucket,
            "shared_family_phone_flag": shared_family_phone,
            "explanation": " ".join(reasons)
        }

matching_engine = DualMatchingEngine()
