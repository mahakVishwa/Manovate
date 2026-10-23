import json
import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import pandas as pd
import io

from app.db.database import get_db
from app.models.patient import (
    StagedPatientRecord,
    MasterPatientIndex,
    ReviewQueueItem,
    MergeAuditLedger
)
from app.core.parser import (
    strip_honorifics,
    normalize_phone_number,
    normalize_dob,
    normalize_pincode,
    compute_soundex,
    compute_metaphone,
    detect_shared_family_phones
)
from app.core.blocking import run_multi_pass_blocking
from app.core.matching import matching_engine
from config import settings

router = APIRouter(prefix="/ingestion", tags=["Data Ingestion & Consolidation"])

# Schema standardizer for the 6 decentralized clinic branches (Phase 1)
BRANCH_SCHEMA_MAPPINGS = {
    "Branch 01 - North": {
        "name": "Name", "phone": "Phone", "dob": "DOB", "pin": "Pin", "local_id": "Local_ID_01"
    },
    "Branch 02 - South": {
        "name": "FullName", "phone": "Contact", "dob": "BirthDate", "pin": "PostalCode", "local_id": "Local_ID_02"
    },
    "Branch 03 - East": {
        "name": "Patient_Name", "phone": "Mobile", "dob": "DoB", "pin": "PinCode", "local_id": "Local_ID_03"
    },
    "Branch 04 - West": {
        "name": "Name", "phone": "Phone_No", "dob": "DateOfBirth", "pin": "Zip", "local_id": "Local_ID_04"
    },
    "Branch 05 - Central": {
        "name": "CustName", "phone": "MobileNo", "dob": "DOB", "pin": "Pincode", "local_id": "Local_ID_05"
    },
    "Branch 06 - Metro": {
        "name": "Name", "phone": "Contact_Number", "dob": "DOB", "pin": "Code", "local_id": "Local_ID_06"
    }
}

def safe_str(val: Any) -> str:
    if val is None:
        return ""
    s = str(val).strip()
    return "" if s.lower() == "nan" else s

def extract_branch_fields(source_branch: str, raw_payload: Dict[str, Any]) -> Dict[str, Any]:
    """Dynamically maps disparate localized branch schemas to unified raw identity vectors."""
    mapping = BRANCH_SCHEMA_MAPPINGS.get(source_branch, {})
    
    # Try mapped key first, then common fallbacks
    name = (
        raw_payload.get(mapping.get("name", "")) or
        raw_payload.get("raw_name") or
        raw_payload.get("name") or raw_payload.get("Name") or raw_payload.get("FullName") or
        raw_payload.get("Patient_Name") or raw_payload.get("CustName") or ""
    )
    phone = (
        raw_payload.get(mapping.get("phone", "")) or
        raw_payload.get("raw_phone") or
        raw_payload.get("phone") or raw_payload.get("Phone") or raw_payload.get("Contact") or
        raw_payload.get("Mobile") or raw_payload.get("MobileNo") or raw_payload.get("Contact_Number") or ""
    )
    dob = (
        raw_payload.get(mapping.get("dob", "")) or
        raw_payload.get("raw_dob") or
        raw_payload.get("dob") or raw_payload.get("DOB") or raw_payload.get("BirthDate") or
        raw_payload.get("DateOfBirth") or raw_payload.get("DoB") or ""
    )
    pin = (
        raw_payload.get(mapping.get("pin", "")) or
        raw_payload.get("raw_pin") or
        raw_payload.get("pin") or raw_payload.get("Pin") or raw_payload.get("PostalCode") or
        raw_payload.get("PinCode") or raw_payload.get("Zip") or raw_payload.get("Pincode") or raw_payload.get("Code") or ""
    )
    local_id = (
        raw_payload.get(mapping.get("local_id", "")) or
        raw_payload.get("local_id") or raw_payload.get("Local_ID") or raw_payload.get("id") or str(uuid.uuid4())[:8]
    )
    
    return {
        "raw_name": safe_str(name),
        "raw_phone": safe_str(phone),
        "raw_dob": safe_str(dob),
        "raw_pin": safe_str(pin),
        "local_id": safe_str(local_id),
        "clinical_notes": safe_str(raw_payload.get("clinical_notes") or raw_payload.get("Diagnostic_Notes") or "Initial Ayurvedic consultation"),
        "treatment_plan": safe_str(raw_payload.get("treatment_plan") or raw_payload.get("Ayurvedic_Treatment") or "Panchakarma consultation recommended"),
        "allergies": safe_str(raw_payload.get("allergies") or raw_payload.get("Allergies") or "None documented"),
        "prescriptions": safe_str(raw_payload.get("prescriptions") or raw_payload.get("Prescription") or "Ashwagandha Churna, Triphala")
    }

@router.post("/process-batch")
def process_batch_ingestion(payloads: List[Dict[str, Any]], db: Session = Depends(get_db)):
    """
    Ingest, normalize, block, match, and reconcile a batch of patient records.
    Implements Phase 1 through Phase 5 of the architectural pipeline.
    """
    if not payloads:
        raise HTTPException(status_code=400, detail="Empty payload batch provided")

    # Step 1: Normalize incoming records
    staged_objs: List[StagedPatientRecord] = []
    normalized_dicts: List[Dict[str, Any]] = []

    for item in payloads:
        source_branch = item.get("source_branch", "Branch 01 - North")
        raw_data = item.get("raw_data") or item
        fields = extract_branch_fields(source_branch, raw_data)

        cleaned_name = strip_honorifics(fields["raw_name"])
        cleaned_phone = normalize_phone_number(fields["raw_phone"])
        cleaned_dob = normalize_dob(fields["raw_dob"])
        cleaned_pin = normalize_pincode(fields["raw_pin"])

        sndx = compute_soundex(cleaned_name)
        meta = compute_metaphone(cleaned_name)
        rec_id = f"REC_{uuid.uuid4().hex[:10]}"

        rec_dict = {
            "record_id": rec_id,
            "source_branch": source_branch,
            "local_id": fields["local_id"],
            "raw_name": fields["raw_name"],
            "raw_phone": fields["raw_phone"],
            "raw_dob": fields["raw_dob"],
            "raw_pin": fields["raw_pin"],
            "raw_data_json": json.dumps(raw_data),
            "cleaned_name": cleaned_name,
            "cleaned_phone": cleaned_phone,
            "cleaned_dob": cleaned_dob,
            "cleaned_pin": cleaned_pin,
            "phonetic_soundex": sndx,
            "phonetic_metaphone": meta,
            "clinical_notes": fields["clinical_notes"],
            "treatment_plan": fields["treatment_plan"],
            "allergies": fields["allergies"],
            "prescriptions": fields["prescriptions"]
        }
        normalized_dicts.append(rec_dict)

    # Step 2: Shared Family Phone Detection (Phase 2 Safety Rule)
    shared_phones = detect_shared_family_phones(normalized_dicts)
    for rec in normalized_dicts:
        if rec["cleaned_phone"] in shared_phones:
            rec["shared_family_phone"] = True
        else:
            rec["shared_family_phone"] = False

    # Persist staged records into DB (Phase 1 Master Dataset Staging)
    record_map: Dict[str, StagedPatientRecord] = {}
    for rec in normalized_dicts:
        obj = StagedPatientRecord(
            record_id=rec["record_id"],
            source_branch=rec["source_branch"],
            local_id=rec["local_id"],
            raw_name=rec["raw_name"],
            raw_phone=rec["raw_phone"],
            raw_dob=rec["raw_dob"],
            raw_pin=rec["raw_pin"],
            raw_data_json=rec["raw_data_json"],
            cleaned_name=rec["cleaned_name"],
            cleaned_phone=rec["cleaned_phone"],
            cleaned_dob=rec["cleaned_dob"],
            cleaned_pin=rec["cleaned_pin"],
            phonetic_soundex=rec["phonetic_soundex"],
            phonetic_metaphone=rec["phonetic_metaphone"],
            shared_family_phone=rec["shared_family_phone"],
            clinical_notes=rec["clinical_notes"],
            treatment_plan=rec["treatment_plan"],
            allergies=rec["allergies"],
            prescriptions=rec["prescriptions"],
            processing_status="staged"
        )
        db.add(obj)
        record_map[rec["record_id"]] = obj
    db.commit()

    # Step 3: Multi-Pass Blocking (Phase 3)
    candidate_pairs = run_multi_pass_blocking(normalized_dicts)

    # Step 4: Dual-Matching Engine & Bucketing (Phase 4 & 5)
    auto_merged_count = 0
    queued_review_count = 0
    new_patient_count = 0

    # Keep track of active cluster groups for auto-merge
    # union-find or adjacency mapping for records with >95% score
    parent_map: Dict[str, str] = {rec["record_id"]: rec["record_id"] for rec in normalized_dicts}

    def find_parent(x: str) -> str:
        if parent_map[x] != x:
            parent_map[x] = find_parent(parent_map[x])
        return parent_map[x]

    def union_parent(x: str, y: str):
        root_x = find_parent(x)
        root_y = find_parent(y)
        if root_x != root_y:
            parent_map[root_y] = root_x

    evaluations = []
    for rec_a, rec_b, match_source in candidate_pairs:
        eval_result = matching_engine.evaluate_pair(rec_a, rec_b)
        eval_result["match_source"] = match_source
        evaluations.append(eval_result)

        bucket = eval_result["decision_bucket"]

        if bucket == "Exact Match":
            # Auto-merge union
            union_parent(eval_result["record_a_id"], eval_result["record_b_id"])
        elif bucket == "Possible Match":
            # Push to Human-in-the-loop review queue (Phase 6)
            review_item = ReviewQueueItem(
                pair_id=f"PAIR_{uuid.uuid4().hex[:10]}",
                record_a_id=eval_result["record_a_id"],
                record_b_id=eval_result["record_b_id"],
                match_source=match_source,
                jaro_winkler_score=eval_result["jaro_winkler_score"],
                levenshtein_score=eval_result["levenshtein_score"],
                vector_cosine_score=eval_result["vector_cosine_score"],
                hybrid_confidence_score=eval_result["hybrid_confidence_score"],
                decision_bucket="Possible Match",
                shared_family_phone_flag=eval_result["shared_family_phone_flag"],
                explanation=eval_result["explanation"],
                status="PENDING"
            )
            db.add(review_item)
            queued_review_count += 1
            # Update staged status
            record_map[eval_result["record_a_id"]].processing_status = "queued_for_review"
            record_map[eval_result["record_b_id"]].processing_status = "queued_for_review"

    db.commit()

    # Step 5: Resolve clusters and create Master Patient IDs
    clusters: Dict[str, List[str]] = {}
    for rec_id in parent_map:
        root = find_parent(rec_id)
        if root not in clusters:
            clusters[root] = []
        clusters[root].append(rec_id)

    for root, cluster_rec_ids in clusters.items():
        primary_rec = record_map[root]
        master_id = f"MP_{uuid.uuid4().hex[:8].upper()}"

        master_obj = MasterPatientIndex(
            master_patient_id=master_id,
            primary_name=primary_rec.cleaned_name,
            primary_phone=primary_rec.cleaned_phone,
            primary_dob=primary_rec.cleaned_dob,
            primary_pin=primary_rec.cleaned_pin,
            status="active"
        )
        db.add(master_obj)

        # Snapshot for Audit Ledger before merge (Phase 6)
        snapshot_records = []
        for rid in cluster_rec_ids:
            r = record_map[rid]
            r.master_patient_id = master_id
            if len(cluster_rec_ids) > 1:
                r.processing_status = "auto_merged"
            elif r.processing_status == "staged":
                r.processing_status = "new_patient"
                new_patient_count += 1

            snapshot_records.append({
                "record_id": r.record_id,
                "source_branch": r.source_branch,
                "local_id": r.local_id,
                "cleaned_name": r.cleaned_name,
                "cleaned_phone": r.cleaned_phone,
                "cleaned_dob": r.cleaned_dob,
                "cleaned_pin": r.cleaned_pin,
                "clinical_notes": r.clinical_notes,
                "treatment_plan": r.treatment_plan
            })

        if len(cluster_rec_ids) > 1:
            auto_merged_count += len(cluster_rec_ids)
            ledger_entry = MergeAuditLedger(
                transaction_id=f"TX_{uuid.uuid4().hex[:10].upper()}",
                master_patient_id=master_id,
                merged_record_ids_json=json.dumps(cluster_rec_ids),
                snapshot_before_merge_json=json.dumps(snapshot_records),
                merge_type="AUTOMATIC",
                status="ACTIVE"
            )
            db.add(ledger_entry)

    db.commit()

    return {
        "status": "SUCCESS",
        "total_records_ingested": len(payloads),
        "candidate_pairs_blocked": len(candidate_pairs),
        "auto_merged_records": auto_merged_count,
        "queued_for_review_pairs": queued_review_count,
        "new_patients_created": len(clusters),
        "shared_family_phones_flagged": list(shared_phones)
    }

@router.post("/upload-csv")
async def upload_csv_dataset(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload and process CSV dataset containing branch records."""
    contents = await file.read()
    df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
    records = df.to_dict(orient="records")
    return process_batch_ingestion(records, db)
