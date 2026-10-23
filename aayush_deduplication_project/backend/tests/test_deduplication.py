import unittest
from app.core.parser import strip_honorifics, normalize_phone_number, normalize_dob, normalize_pincode, detect_shared_family_phones
from app.core.matching import matching_engine

class TestDeduplicationPipeline(unittest.TestCase):
    def test_honorific_stripping(self):
        self.assertEqual(strip_honorifics("Dr. Aaditya Malviya"), "Aaditya Malviya")
        self.assertEqual(strip_honorifics("Vaidya Dr. Aaditya Malviya"), "Aaditya Malviya")
        self.assertEqual(strip_honorifics("Shri Ram Kumar Choudhary"), "Ram Kumar Choudhary")
        self.assertEqual(strip_honorifics("Smt. Sunita Sharma"), "Sunita Sharma")
        self.assertEqual(strip_honorifics("Master Rohit Sharma"), "Rohit Sharma")

    def test_phone_normalization(self):
        self.assertEqual(normalize_phone_number("+91 98260 11223"), "9826011223")
        self.assertEqual(normalize_phone_number("09826011223"), "9826011223")
        self.assertEqual(normalize_phone_number("98260-11223"), "9826011223")
        self.assertEqual(normalize_phone_number("9826011223"), "9826011223")

    def test_dob_normalization(self):
        self.assertEqual(normalize_dob("14/08/1995"), "1995-08-14")
        self.assertEqual(normalize_dob("22-03-1978"), "1978-03-22")
        self.assertEqual(normalize_dob("1978/03/22"), "1978-03-22")
        self.assertEqual(normalize_dob("1995-08-14"), "1995-08-14")

    def test_fuzzy_text_and_vector_matching(self):
        # Regional spelling variation (Jaro-Winkler)
        jw, lev, vec, score = matching_engine.compute_hybrid_name_score("Choudhary", "Chowdhury")
        self.assertGreater(score, 0.85)

        # Keystroke typo (Levenshtein)
        jw, lev, vec, score = matching_engine.compute_hybrid_name_score("Anil Sharma", "Aniel Sharma")
        self.assertGreater(score, 0.88)

        # Inverted name order (Vector Cosine / Token-Set)
        jw, lev, vec, score = matching_engine.compute_hybrid_name_score("Malviya Aaditya", "Aaditya Malviya")
        self.assertGreater(score, 0.85)

    def test_shared_family_phone_safety_interlock(self):
        records = [
            {"cleaned_phone": "9811233445", "cleaned_name": "Ramesh Sharma"},
            {"cleaned_phone": "9811233445", "cleaned_name": "Sunita Sharma"},
            {"cleaned_phone": "9811233445", "cleaned_name": "Rohit Sharma"}
        ]
        shared = detect_shared_family_phones(records)
        self.assertIn("9811233445", shared)

        # Evaluation with shared phone safety flag
        rec_a = {
            "record_id": "1",
            "cleaned_name": "Ramesh Sharma",
            "cleaned_phone": "9811233445",
            "cleaned_dob": "1960-01-15",
            "cleaned_pin": "110001",
            "shared_family_phone": True
        }
        rec_b = {
            "record_id": "2",
            "cleaned_name": "Sunita Sharma",
            "cleaned_phone": "9811233445",
            "cleaned_dob": "1965-07-20",
            "cleaned_pin": "110001",
            "shared_family_phone": True
        }
        res = matching_engine.evaluate_pair(rec_a, rec_b)
        self.assertNotEqual(res["decision_bucket"], "Exact Match")
        self.assertTrue(res["shared_family_phone_flag"])

if __name__ == "__main__":
    unittest.main()

