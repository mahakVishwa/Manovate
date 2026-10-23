from datetime import datetime
import uuid
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class StagedPatientRecord(Base):
    """
    Phase 1 Master Dataset Staging:
    Consolidates raw identity vectors into an immutable staging repository.
    """
    __tablename__ = "staged_patient_records"

    id = Column(Integer, primary_key=True, index=True)
    record_id = Column(String(64), unique=True, index=True, default=generate_uuid)
    source_branch = Column(String(64), index=True, nullable=False)
    local_id = Column(String(64), index=True, nullable=False)
    
    # Original raw data
    raw_name = Column(String(256), nullable=True)
    raw_phone = Column(String(64), nullable=True)
    raw_dob = Column(String(64), nullable=True)
    raw_pin = Column(String(64), nullable=True)
    raw_data_json = Column(Text, nullable=True)

    # Normalized vectors
    cleaned_name = Column(String(256), index=True, nullable=False)
    cleaned_phone = Column(String(32), index=True, nullable=False)
    cleaned_dob = Column(String(32), index=True, nullable=False)
    cleaned_pin = Column(String(16), index=True, nullable=False)
    phonetic_soundex = Column(String(16), index=True, nullable=True)
    phonetic_metaphone = Column(String(32), index=True, nullable=True)
    shared_family_phone = Column(Boolean, default=False)

    # Clinical details for Unified Cross-Branch Timeline
    clinical_notes = Column(Text, nullable=True)
    treatment_plan = Column(Text, nullable=True)
    allergies = Column(Text, nullable=True)
    prescriptions = Column(Text, nullable=True)

    # Master index linkage
    master_patient_id = Column(String(64), ForeignKey("master_patient_indices.master_patient_id"), nullable=True, index=True)
    processing_status = Column(String(32), default="staged", index=True)  # staged, auto_merged, queued_for_review, manually_merged, new_patient

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    master = relationship("MasterPatientIndex", back_populates="records")

class MasterPatientIndex(Base):
    """
    Canonical Unified Master Patient Identity.
    """
    __tablename__ = "master_patient_indices"

    id = Column(Integer, primary_key=True, index=True)
    master_patient_id = Column(String(64), unique=True, index=True, default=generate_uuid)
    primary_name = Column(String(256), nullable=False)
    primary_phone = Column(String(32), nullable=False)
    primary_dob = Column(String(32), nullable=False)
    primary_pin = Column(String(16), nullable=False)
    status = Column(String(32), default="active")  # active, archived, unmerged
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    records = relationship("StagedPatientRecord", back_populates="master")

class ReviewQueueItem(Base):
    """
    Phase 6 Human-in-the-Loop Confidence-Based Review Queue:
    Dispatched when score is in the 75% - 94% bucket or safety trigger activates.
    """
    __tablename__ = "review_queue_items"

    id = Column(Integer, primary_key=True, index=True)
    pair_id = Column(String(64), unique=True, index=True, default=generate_uuid)
    record_a_id = Column(String(64), index=True, nullable=False)
    record_b_id = Column(String(64), index=True, nullable=False)
    match_source = Column(String(64), nullable=True)

    jaro_winkler_score = Column(Float, nullable=False)
    levenshtein_score = Column(Float, nullable=False)
    vector_cosine_score = Column(Float, nullable=False)
    hybrid_confidence_score = Column(Float, nullable=False)
    decision_bucket = Column(String(32), default="Possible Match")
    shared_family_phone_flag = Column(Boolean, default=False)
    explanation = Column(Text, nullable=True)

    # Resolution
    status = Column(String(32), default="PENDING", index=True)  # PENDING, APPROVED, REJECTED
    reviewer_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)

class MergeAuditLedger(Base):
    """
    Phase 6 Audit-Trailed Unmerge Engine:
    Append-only ledger storing immutable snapshots of original records prior to any merge action.
    Enables One-Click Reversal ('Undo Merge').
    """
    __tablename__ = "merge_audit_ledger"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String(64), unique=True, index=True, default=generate_uuid)
    master_patient_id = Column(String(64), index=True, nullable=False)
    merged_record_ids_json = Column(Text, nullable=False)      # JSON list of record_ids
    snapshot_before_merge_json = Column(Text, nullable=False)  # Immutable JSON serialized records
    merge_type = Column(String(32), default="AUTOMATIC")       # AUTOMATIC or MANUAL_REVIEW
    status = Column(String(32), default="ACTIVE")              # ACTIVE or REVERSED
    unmerged_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    unmerged_at = Column(DateTime, nullable=True)
