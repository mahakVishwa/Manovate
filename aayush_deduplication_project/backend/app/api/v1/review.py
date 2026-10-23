from datetime import datetime
import json
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.patient import (
    ReviewQueueItem,
    StagedPatientRecord,
    MasterPatientIndex,
    MergeAuditLedger
)
from app.schemas.patient import ReviewDecisionRequest, UnmergeRequest

router = APIRouter(prefix="/review", tags=["Review Queue & Safety Nets"])

@router.get("/queue")
def list_review_queue(status: Optional[str] = "PENDING", db: Session = Depends(get_db)):
    """
    Phase 6: Confidence-Based Review Queue.
    Returns side-by-side comparative views of candidate pairs with conflicting field highlighting.
    """
    query = db.query(ReviewQueueItem)
    if status:
        query = query.filter(ReviewQueueItem.status == status)
    items = query.order_by(ReviewQueueItem.created_at.desc()).all()

    response = []
    for item in items:
        rec_a = db.query(StagedPatientRecord).filter(StagedPatientRecord.record_id == item.record_a_id).first()
        rec_b = db.query(StagedPatientRecord).filter(StagedPatientRecord.record_id == item.record_b_id).first()

        if not rec_a or not rec_b:
            continue

        # Dynamic field conflict analysis for UI highlighting
        conflicts = []
        if rec_a.cleaned_name.lower() != rec_b.cleaned_name.lower():
            conflicts.append("name_mismatch")
        if rec_a.cleaned_dob != rec_b.cleaned_dob:
            conflicts.append("dob_mismatch")
        if rec_a.cleaned_phone != rec_b.cleaned_phone:
            conflicts.append("phone_mismatch")
        if rec_a.cleaned_pin != rec_b.cleaned_pin:
            conflicts.append("pin_mismatch")

        response.append({
            "pair_id": item.pair_id,
            "status": item.status,
            "hybrid_confidence_score": round(item.hybrid_confidence_score * 100, 2),
            "jaro_winkler_score": round(item.jaro_winkler_score * 100, 2),
            "levenshtein_score": round(item.levenshtein_score * 100, 2),
            "vector_cosine_score": round(item.vector_cosine_score * 100, 2),
            "shared_family_phone_flag": item.shared_family_phone_flag,
            "explanation": item.explanation,
            "match_source": item.match_source,
            "field_conflicts": conflicts,
            "profile_a": {
                "record_id": rec_a.record_id,
                "source_branch": rec_a.source_branch,
                "local_id": rec_a.local_id,
                "name": rec_a.cleaned_name,
                "raw_name": rec_a.raw_name,
                "phone": rec_a.cleaned_phone,
                "dob": rec_a.cleaned_dob,
                "pin": rec_a.cleaned_pin,
                "clinical_notes": rec_a.clinical_notes,
                "treatment_plan": rec_a.treatment_plan
            },
            "profile_b": {
                "record_id": rec_b.record_id,
                "source_branch": rec_b.source_branch,
                "local_id": rec_b.local_id,
                "name": rec_b.cleaned_name,
                "raw_name": rec_b.raw_name,
                "phone": rec_b.cleaned_phone,
                "dob": rec_b.cleaned_dob,
                "pin": rec_b.cleaned_pin,
                "clinical_notes": rec_b.clinical_notes,
                "treatment_plan": rec_b.treatment_plan
            }
        })

    return response

@router.post("/decision")
def submit_review_decision(req: ReviewDecisionRequest, db: Session = Depends(get_db)):
    """
    Submits administrative review action:
    - 'APPROVE_MERGE': Combines patient identities, consolidates timelines, writes audit ledger.
    - 'REJECT_MERGE': Confirms profiles are separate individuals; ensures independent Master IDs.
    """
    rec_a = db.query(StagedPatientRecord).filter(StagedPatientRecord.record_id == req.record_a_id).first()
    rec_b = db.query(StagedPatientRecord).filter(StagedPatientRecord.record_id == req.record_b_id).first()

    if not rec_a or not rec_b:
        raise HTTPException(status_code=404, detail="One or both patient records not found")

    # Update review queue item
    queue_item = db.query(ReviewQueueItem).filter(
        ((ReviewQueueItem.record_a_id == req.record_a_id) & (ReviewQueueItem.record_b_id == req.record_b_id)) |
        ((ReviewQueueItem.record_a_id == req.record_b_id) & (ReviewQueueItem.record_b_id == req.record_a_id))
    ).first()

    if queue_item:
        queue_item.status = req.decision
        queue_item.reviewer_notes = req.reviewer_notes
        queue_item.reviewed_at = datetime.utcnow()

    if req.decision == "APPROVE_MERGE":
        target_master_id = rec_a.master_patient_id or rec_b.master_patient_id

        if not target_master_id:
            target_master_id = f"MP_{uuid.uuid4().hex[:8].upper()}"
            master_obj = MasterPatientIndex(
                master_patient_id=target_master_id,
                primary_name=rec_a.cleaned_name,
                primary_phone=rec_a.cleaned_phone,
                primary_dob=rec_a.cleaned_dob,
                primary_pin=rec_a.cleaned_pin,
                status="active"
            )
            db.add(master_obj)

        # Snapshot before merge for one-click reversal (Phase 6)
        snapshot = [
            {
                "record_id": rec_a.record_id,
                "previous_master_id": rec_a.master_patient_id,
                "previous_status": rec_a.processing_status,
                "source_branch": rec_a.source_branch,
                "local_id": rec_a.local_id,
                "name": rec_a.cleaned_name
            },
            {
                "record_id": rec_b.record_id,
                "previous_master_id": rec_b.master_patient_id,
                "previous_status": rec_b.processing_status,
                "source_branch": rec_b.source_branch,
                "local_id": rec_b.local_id,
                "name": rec_b.cleaned_name
            }
        ]

        rec_a.master_patient_id = target_master_id
        rec_b.master_patient_id = target_master_id
        rec_a.processing_status = "manually_merged"
        rec_b.processing_status = "manually_merged"

        ledger_entry = MergeAuditLedger(
            transaction_id=f"TX_{uuid.uuid4().hex[:10].upper()}",
            master_patient_id=target_master_id,
            merged_record_ids_json=json.dumps([rec_a.record_id, rec_b.record_id]),
            snapshot_before_merge_json=json.dumps(snapshot),
            merge_type="MANUAL_REVIEW",
            status="ACTIVE"
        )
        db.add(ledger_entry)
        db.commit()

        return {
            "status": "MERGED",
            "master_patient_id": target_master_id,
            "transaction_id": ledger_entry.transaction_id,
            "message": "Patient identities successfully unified across branches."
        }

    elif req.decision == "REJECT_MERGE":
        # Keep identities isolated
        if not rec_a.master_patient_id:
            m_a = f"MP_{uuid.uuid4().hex[:8].upper()}"
            db.add(MasterPatientIndex(
                master_patient_id=m_a,
                primary_name=rec_a.cleaned_name,
                primary_phone=rec_a.cleaned_phone,
                primary_dob=rec_a.cleaned_dob,
                primary_pin=rec_a.cleaned_pin
            ))
            rec_a.master_patient_id = m_a
            rec_a.processing_status = "rejected"

        if not rec_b.master_patient_id:
            m_b = f"MP_{uuid.uuid4().hex[:8].upper()}"
            db.add(MasterPatientIndex(
                master_patient_id=m_b,
                primary_name=rec_b.cleaned_name,
                primary_phone=rec_b.cleaned_phone,
                primary_dob=rec_b.cleaned_dob,
                primary_pin=rec_b.cleaned_pin
            ))
            rec_b.master_patient_id = m_b
            rec_b.processing_status = "rejected"

        db.commit()
        return {
            "status": "REJECTED",
            "message": "Match rejected. Identities preserved as separate master patients."
        }
    else:
        raise HTTPException(status_code=400, detail="Invalid decision. Choose APPROVE_MERGE or REJECT_MERGE.")

@router.get("/patient/{master_patient_id}/timeline")
def get_unified_cross_branch_timeline(master_patient_id: str, db: Session = Depends(get_db)):
    """
    Phase 6: Unified Cross-Branch Timeline.
    Instantly consolidates diagnostic notes, Ayurvedic treatment plans, documented allergies,
    and branch-specific prescriptions across all decentralized clinic branches.
    """
    master = db.query(MasterPatientIndex).filter(MasterPatientIndex.master_patient_id == master_patient_id).first()
    if not master:
        raise HTTPException(status_code=404, detail="Master patient profile not found")

    records = db.query(StagedPatientRecord).filter(
        StagedPatientRecord.master_patient_id == master_patient_id
    ).order_by(StagedPatientRecord.created_at.asc()).all()

    timeline_events = []
    all_allergies = set()
    all_prescriptions = []

    for r in records:
        if r.allergies and r.allergies.lower() != "none documented":
            all_allergies.add(r.allergies)
        if r.prescriptions:
            all_prescriptions.append({
                "source_branch": r.source_branch,
                "prescription": r.prescriptions
            })

        timeline_events.append({
            "timestamp": r.created_at.isoformat() if r.created_at else "",
            "source_branch": r.source_branch,
            "local_patient_id": r.local_id,
            "recorded_name": r.cleaned_name,
            "phone": r.cleaned_phone,
            "dob": r.cleaned_dob,
            "pin": r.cleaned_pin,
            "diagnostic_notes": r.clinical_notes,
            "treatment_plan": r.treatment_plan,
            "allergies": r.allergies,
            "prescription": r.prescriptions,
            "status": r.processing_status
        })

    return {
        "master_patient_id": master.master_patient_id,
        "primary_demographics": {
            "name": master.primary_name,
            "phone": master.primary_phone,
            "dob": master.primary_dob,
            "pin": master.primary_pin
        },
        "consolidated_allergies": list(all_allergies) if all_allergies else ["None documented"],
        "consolidated_prescriptions": all_prescriptions,
        "total_branch_visits": len(timeline_events),
        "timeline": timeline_events
    }

@router.post("/unmerge")
def undo_merge_transaction(req: UnmergeRequest, db: Session = Depends(get_db)):
    """
    Phase 6: Audit-Trailed Unmerge Engine.
    Provides clinic administrators with a safe 'Undo Merge' capability,
    restoring original profiles and split histories instantly without loss of data integrity.
    """
    ledger = db.query(MergeAuditLedger).filter(
        MergeAuditLedger.transaction_id == req.merge_transaction_id,
        MergeAuditLedger.status == "ACTIVE"
    ).first()

    if not ledger:
        raise HTTPException(status_code=404, detail="Active merge transaction not found or already reversed")

    merged_record_ids = json.loads(ledger.merged_record_ids_json)
    snapshot = json.loads(ledger.snapshot_before_merge_json)

    # Restore each record to independent state
    for rid in merged_record_ids:
        rec = db.query(StagedPatientRecord).filter(StagedPatientRecord.record_id == rid).first()
        if rec:
            # Create a new fresh master patient ID for each split identity
            new_master_id = f"MP_{uuid.uuid4().hex[:8].upper()}"
            db.add(MasterPatientIndex(
                master_patient_id=new_master_id,
                primary_name=rec.cleaned_name,
                primary_phone=rec.cleaned_phone,
                primary_dob=rec.cleaned_dob,
                primary_pin=rec.cleaned_pin,
                status="active"
            ))
            rec.master_patient_id = new_master_id
            rec.processing_status = "unmerged_standalone"

    # Mark ledger entry reversed
    ledger.status = "REVERSED"
    ledger.unmerged_at = datetime.utcnow()
    ledger.unmerged_reason = req.reason or "Administrative reversal via staff safety net"
    db.commit()

    return {
        "status": "UNMERGED_SUCCESS",
        "transaction_id": ledger.transaction_id,
        "split_records_count": len(merged_record_ids),
        "message": "Profiles and histories successfully unmerged and restored to independent master records."
    }

@router.get("/ledger")
def get_audit_ledger(db: Session = Depends(get_db)):
    """Fetches append-only merge audit ledger entries."""
    entries = db.query(MergeAuditLedger).order_by(MergeAuditLedger.created_at.desc()).all()
    return [
        {
            "transaction_id": e.transaction_id,
            "master_patient_id": e.master_patient_id,
            "merge_type": e.merge_type,
            "status": e.status,
            "merged_record_ids": json.loads(e.merged_record_ids_json),
            "unmerged_reason": e.unmerged_reason,
            "created_at": e.created_at.isoformat() if e.created_at else None,
            "unmerged_at": e.unmerged_at.isoformat() if e.unmerged_at else None
        }
        for e in entries
    ]

