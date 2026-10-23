from datetime import date, datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class BranchPatientRawPayload(BaseModel):
    """Raw payload from any branch database ETL connector."""
    source_branch: str = Field(..., description="Branch identifier e.g., 'Branch 01 - North'")
    local_id: str = Field(..., description="Local ID in source branch database")
    raw_data: Dict[str, Any] = Field(..., description="Original raw dictionary from branch schema")
    clinical_notes: Optional[str] = None
    treatment_plan: Optional[str] = None
    allergies: Optional[str] = None
    prescriptions: Optional[str] = None

class NormalizedPatientRecord(BaseModel):
    """Normalized patient identity vector."""
    source_branch: str
    local_id: str
    raw_name: str
    cleaned_name: str
    raw_phone: str
    cleaned_phone: str  # 10 digits
    raw_dob: str
    cleaned_dob: str    # YYYY-MM-DD
    raw_pin: str
    cleaned_pin: str    # 6 digits
    phonetic_soundex: str
    phonetic_metaphone: str
    shared_family_phone: bool = False
    clinical_notes: Optional[str] = None
    treatment_plan: Optional[str] = None
    allergies: Optional[str] = None
    prescriptions: Optional[str] = None

class CandidatePair(BaseModel):
    record_a_id: str
    record_b_id: str
    match_source: str  # 'exact_phone', 'dob_phonetic', etc.

class MatchScoreBreakdown(BaseModel):
    record_a_id: str
    record_b_id: str
    jaro_winkler_score: float
    levenshtein_score: float
    vector_cosine_score: float
    hybrid_confidence_score: float
    decision_bucket: str  # 'Exact Match', 'Possible Match', 'New Patient'
    shared_family_phone_flag: bool
    explanation: str

class ReviewDecisionRequest(BaseModel):
    candidate_pair_id: Optional[str] = None
    record_a_id: str
    record_b_id: str
    decision: str = Field(..., description="'APPROVE_MERGE' or 'REJECT_MERGE'")
    reviewer_notes: Optional[str] = None

class UnmergeRequest(BaseModel):
    merge_transaction_id: str
    reason: Optional[str] = None

class ClinicalTimelineEvent(BaseModel):
    event_date: str
    source_branch: str
    local_patient_id: str
    clinical_notes: Optional[str] = None
    treatment_plan: Optional[str] = None
    allergies: Optional[str] = None
    prescriptions: Optional[str] = None

class MasterPatientDetail(BaseModel):
    master_patient_id: str
    primary_name: str
    primary_phone: str
    primary_dob: str
    primary_pin: str
    merged_records_count: int
    created_at: datetime
    updated_at: datetime
    timeline: List[ClinicalTimelineEvent] = []

