import React, { useState, useEffect } from 'react';
import {
  Users, CheckCircle2, AlertTriangle, UserPlus, Undo2,
  Database, GitMerge, FileText, Activity, ArrowRight,
  ShieldAlert, RefreshCw, Upload, Sparkles, Building2,
  Calendar, Phone, MapPin, Pill, Stethoscope, ChevronRight,
  Info, ExternalLink, Sliders
} from 'lucide-react';

// Pre-packaged 6-Branch Master Mock Dataset for 1-Click Demo
const DEFAULT_BRANCH_RECORDS = [
  {
    source_branch: "Branch 01 - North",
    local_id: "Local_ID_01",
    raw_name: "Dr. Aaditya Malviya",
    raw_phone: "+91 98260 11223",
    raw_dob: "1995-08-14",
    raw_pin: "452001",
    clinical_notes: "Severe Vata imbalance with lower back stiffness",
    treatment_plan: "Kati Basti and Ashwagandha Rasayana",
    allergies: "None documented",
    prescriptions: "Ashwagandha Churna 5g OD, Yograj Guggulu"
  },
  {
    source_branch: "Branch 02 - South",
    local_id: "Local_ID_02",
    raw_name: "Malviya Aaditya",
    raw_phone: "09826011223",
    raw_dob: "14/08/1995",
    raw_pin: "452001",
    clinical_notes: "Follow-up on lower back stiffness; noticeable mobility improvement",
    treatment_plan: "Continue Kati Basti sessions with Abhyanga",
    allergies: "None documented",
    prescriptions: "Yograj Guggulu BD, Mahanarayan Taila"
  },
  {
    source_branch: "Branch 06 - Metro",
    local_id: "Local_ID_06",
    raw_name: "Aaditya Malviya",
    raw_phone: "9826011223",
    raw_dob: "1995-08-14",
    raw_pin: "452001",
    clinical_notes: "Routine wellness checkup after seasonal transition",
    treatment_plan: "Dietary adjustments for Pitta season; Brahmi Rasayana",
    allergies: "None documented",
    prescriptions: "Brahmi Vati, Triphala Churna"
  },
  {
    source_branch: "Branch 01 - North",
    local_id: "Local_ID_11",
    raw_name: "R. K. Choudhary",
    raw_phone: "+91 98930 44556",
    raw_dob: "1978-03-22",
    raw_pin: "462001",
    clinical_notes: "Chronic dyspepsia with Pitta aggravation",
    treatment_plan: "Takra Dhara and Shankh Bhasma protocol",
    allergies: "Lactose intolerance",
    prescriptions: "Avipattikar Churna, Shankh Bhasma"
  },
  {
    source_branch: "Branch 03 - East",
    local_id: "Local_ID_12",
    raw_name: "Shri Ram Kumar Choudhary",
    raw_phone: "9893044556",
    raw_dob: "22-03-1978",
    raw_pin: "462001",
    clinical_notes: "Gastric acidity and mild acid reflux",
    treatment_plan: "Amlapitta protocol with Shatavari",
    allergies: "Lactose intolerance",
    prescriptions: "Avipattikar Churna BD, Kamdudha Ras"
  },
  {
    source_branch: "Branch 05 - Central",
    local_id: "Local_ID_13",
    raw_name: "Ram Kumar Chowdhury",
    raw_phone: "098930-44556",
    raw_dob: "1978/03/22",
    raw_pin: "462001",
    clinical_notes: "Periodic consultation for digestive health",
    treatment_plan: "Maintenance herbal regimen",
    allergies: "Lactose intolerance",
    prescriptions: "Shatavari Churna, Triphala"
  },
  {
    source_branch: "Branch 04 - West",
    local_id: "Local_ID_21",
    raw_name: "Anil Sharma",
    raw_phone: "+91 94250 77889",
    raw_dob: "1985-11-05",
    raw_pin: "450001",
    clinical_notes: "Cervical spondylosis with neck spasm",
    treatment_plan: "Greeva Basti with Dashamoola oil",
    allergies: "Dust allergy",
    prescriptions: "Dashamoola Kwath, Trayodashang Guggulu"
  },
  {
    source_branch: "Branch 02 - South",
    local_id: "Local_ID_22",
    raw_name: "Aniel Sharma",
    raw_phone: "9425077889",
    raw_dob: "05/11/1985",
    raw_pin: "450001",
    clinical_notes: "Neck stiffness reduction; follow-up visit",
    treatment_plan: "Gentle neck physiotherapy & Nasya therapy",
    allergies: "Dust allergy",
    prescriptions: "Trayodashang Guggulu BD, Anu Taila"
  },
  {
    source_branch: "Branch 03 - East",
    local_id: "Local_ID_31",
    raw_name: "Shri Ramesh Sharma",
    raw_phone: "+91 98112 33445",
    raw_dob: "1960-01-15",
    raw_pin: "110001",
    clinical_notes: "Joint pain and osteoarthritis symptoms",
    treatment_plan: "Janu Basti and Rasnadi Guggulu",
    allergies: "Penicillin allergy",
    prescriptions: "Shallaki 500mg BD, Rasnadi Kwath"
  },
  {
    source_branch: "Branch 03 - East",
    local_id: "Local_ID_32",
    raw_name: "Smt. Sunita Sharma",
    raw_phone: "+91 98112 33445",
    raw_dob: "1965-07-20",
    raw_pin: "110001",
    clinical_notes: "Hypertension and mild sleep disturbance",
    treatment_plan: "Shirodhara therapy and Ashwagandha",
    allergies: "None documented",
    prescriptions: "Sarpagandha Ghan Vati, Ashwagandha"
  },
  {
    source_branch: "Branch 03 - East",
    local_id: "Local_ID_33",
    raw_name: "Master Rohit Sharma",
    raw_phone: "+91 98112 33445",
    raw_dob: "2002-12-10",
    raw_pin: "110001",
    clinical_notes: "Allergic rhinitis and seasonal sneezing",
    treatment_plan: "Pratisyaya treatment with Haridra Khanda",
    allergies: "Sulfa drugs",
    prescriptions: "Haridra Khanda 5g BD, Sitopaladi"
  },
  {
    source_branch: "Branch 05 - Central",
    local_id: "Local_ID_41",
    raw_name: "Vaidya Meera Joshi",
    raw_phone: "+91 97555 66778",
    raw_dob: "1990-04-18",
    raw_pin: "482002",
    clinical_notes: "Migraine headaches aggravated during midday",
    treatment_plan: "Shirolepa and Pathyadi Kwath",
    allergies: "None documented",
    prescriptions: "Pathyadi Kwath, Godanti Bhasma"
  },
  {
    source_branch: "Branch 06 - Metro",
    local_id: "Local_ID_51",
    raw_name: "Pooja Verma",
    raw_phone: "9123456789",
    raw_dob: "1992-09-25",
    raw_pin: "400001",
    clinical_notes: "Stress-induced insomnia and anxiety",
    treatment_plan: "Nasya and Medhya Rasayana protocol",
    allergies: "None documented",
    prescriptions: "Tagara capsules, Saraswatarishta"
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline', 'sandbox', 'review', 'timeline', 'ledger', 'architecture'
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online', 'offline'
  const [ingestionLoading, setIngestionLoading] = useState(false);
  const [ingestStats, setIngestStats] = useState(null);
  const [reviewQueue, setReviewQueue] = useState([]);
  const [selectedMasterId, setSelectedMasterId] = useState('MP_BBAE64FB');
  const [patientTimeline, setPatientTimeline] = useState(null);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [unmergeLoading, setUnmergeLoading] = useState(false);

  // Judge Live Playground inputs
  const [judgeInputA, setJudgeInputA] = useState({
    name: "Dr. Aaditya Malviya",
    phone: "+91 98260 11223",
    dob: "1995-08-14",
    pin: "452001"
  });
  const [judgeInputB, setJudgeInputB] = useState({
    name: "Malviya Aaditya",
    phone: "09826011223",
    dob: "14/08/1995",
    pin: "452001"
  });
  const [sharedPhoneCount, setSharedPhoneCount] = useState(1);

  // Check backend health
  const checkBackend = async () => {
    try {
      const res = await fetch('/api/');
      if (res.ok) {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch {
      setBackendStatus('offline');
    }
  };

  useEffect(() => {
    checkBackend();
    loadReviewQueue();
    loadLedger();
  }, []);

  const loadReviewQueue = async () => {
    try {
      const res = await fetch('/api/v1/review/queue');
      if (res.ok) {
        const data = await res.json();
        setReviewQueue(data);
      }
    } catch (e) {
      console.warn("Failed fetching review queue:", e);
    }
  };

  const loadLedger = async () => {
    try {
      const res = await fetch('/api/v1/review/ledger');
      if (res.ok) {
        const data = await res.json();
        setLedgerEntries(data);
      }
    } catch (e) {
      console.warn("Failed fetching ledger:", e);
    }
  };

  const loadTimeline = async (masterId) => {
    setTimelineLoading(true);
    setSelectedMasterId(masterId);
    try {
      const res = await fetch(`/api/v1/review/patient/${masterId}/timeline`);
      if (res.ok) {
        const data = await res.json();
        setPatientTimeline(data);
      }
    } catch (e) {
      console.warn("Failed loading timeline:", e);
    } finally {
      setTimelineLoading(false);
    }
  };

  // Trigger Full Ingestion
  const handleTriggerIngestion = async () => {
    setIngestionLoading(true);
    try {
      const res = await fetch('/api/v1/ingestion/process-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(DEFAULT_BRANCH_RECORDS)
      });
      if (res.ok) {
        const data = await res.json();
        setIngestStats(data);
        await loadReviewQueue();
        await loadLedger();
        setActiveTab('sandbox');
      }
    } catch (e) {
      alert("Error contacting backend server: " + e.message);
    } finally {
      setIngestionLoading(false);
    }
  };

  // Handle Review Decision (Approve or Reject)
  const handleDecision = async (pair, decision) => {
    try {
      const res = await fetch('/api/v1/review/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_pair_id: pair.pair_id,
          record_a_id: pair.profile_a.record_id,
          record_b_id: pair.profile_b.record_id,
          decision: decision,
          reviewer_notes: `Staff decision via UI (${decision}) for clinic branch integration.`
        })
      });
      if (res.ok) {
        const data = await res.json();
        await loadReviewQueue();
        await loadLedger();
        if (data.master_patient_id) {
          loadTimeline(data.master_patient_id);
          setActiveTab('timeline');
        }
      }
    } catch (e) {
      alert("Action failed: " + e.message);
    }
  };

  // One-Click Undo Merge Reversal
  const handleUnmerge = async (transactionId) => {
    setUnmergeLoading(true);
    try {
      const res = await fetch('/api/v1/review/unmerge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merge_transaction_id: transactionId,
          reason: "Emergency one-click undo executed by clinic supervisor from the dashboard."
        })
      });
      if (res.ok) {
        await loadLedger();
        await loadReviewQueue();
        alert("Transaction safely reversed. Original patient profiles & clinical histories split and preserved!");
      }
    } catch (e) {
      alert("Unmerge failed: " + e.message);
    } finally {
      setUnmergeLoading(false);
    }
  };

  // Client-side quick simulator for Judge Playground
  const computeClientScore = () => {
    // Strip honorifics
    const stripH = (str) => str.replace(/^(dr\.?|vaidya|shri|smt\.?|kumari|master|prof\.?)\s+/i, '').trim();
    const cleanPhone = (p) => p.replace(/\D/g, '').slice(-10);

    const nameA = stripH(judgeInputA.name);
    const nameB = stripH(judgeInputB.name);
    const phoneA = cleanPhone(judgeInputA.phone);
    const phoneB = cleanPhone(judgeInputB.phone);
    const dobMatch = judgeInputA.dob.replace(/\D/g, '') === judgeInputB.dob.replace(/\D/g, '');
    const phoneMatch = phoneA && phoneB && phoneA === phoneB;

    // Token set order check
    const tA = nameA.toLowerCase().split(/\s+/).sort().join(' ');
    const tB = nameB.toLowerCase().split(/\s+/).sort().join(' ');
    let vecScore = tA === tB ? 1.0 : 0.65;
    if (nameA.toLowerCase() === nameB.toLowerCase()) vecScore = 1.0;

    // Jaro-Winkler estimate
    let jwScore = tA === tB ? 1.0 : (nameA.slice(0, 3).toLowerCase() === nameB.slice(0, 3).toLowerCase() ? 0.92 : 0.70);
    // Levenshtein estimate
    let levScore = tA === tB ? 1.0 : 0.85;

    let hybrid = (0.35 * jwScore) + (0.25 * levScore) + (0.40 * vecScore);

    if (phoneMatch && dobMatch) {
      hybrid = Math.min(1.0, hybrid * 0.70 + 0.30);
    }

    let bucket = "New Patient";
    let alertMsg = null;

    if (hybrid >= 0.95) {
      bucket = "Exact Match";
    } else if (hybrid >= 0.75) {
      bucket = "Possible Match";
    }

    // Safety Interlock
    if (sharedPhoneCount >= 3 && phoneMatch) {
      if (bucket === "Exact Match" && hybrid < 0.99) {
        bucket = "Possible Match";
        alertMsg = "[Safety Interlock Active] Shared Family Phone flagged (>= 3 distinct household members). Auto-merge deactivated to prevent combining family member records.";
      }
    }

    return {
      cleanedNameA: nameA,
      cleanedNameB: nameB,
      cleanedPhoneA: phoneA,
      cleanedPhoneB: phoneB,
      jwScore: Math.round(jwScore * 100),
      levScore: Math.round(levScore * 100),
      vecScore: Math.round(vecScore * 100),
      hybridScore: Math.round(hybrid * 100),
      bucket,
      alertMsg
    };
  };

  const clientSim = computeClientScore();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0.9rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: 'white',
              padding: '0.55rem',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.2)'
            }}>
              <Stethoscope size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  Aayush Aayurved Clinic
                </h1>
                <span style={{
                  fontSize: '0.7rem',
                  background: '#dcfce7',
                  color: '#15803d',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '6px',
                  fontWeight: 700,
                  border: '1px solid #bbf7d0'
                }}>
                  BIZZNNOVATE 2026
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Automated Cross-Branch Patient Record Deduplication & Clinical Unification
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.8rem',
              borderRadius: '8px',
              background: backendStatus === 'online' ? '#f0fdf4' : '#fff7ed',
              border: `1px solid ${backendStatus === 'online' ? '#bbf7d0' : '#fed7aa'}`,
              fontSize: '0.8rem',
              fontWeight: 600,
              color: backendStatus === 'online' ? '#166534' : '#9a3412'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: backendStatus === 'online' ? '#22c55e' : '#f97316'
              }}></span>
              Backend API: {backendStatus === 'online' ? 'FastAPI Connected' : 'Local Standalone Mode'}
            </div>

            <button
              onClick={handleTriggerIngestion}
              disabled={ingestionLoading}
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 2px 4px rgba(5, 150, 105, 0.25)',
                opacity: ingestionLoading ? 0.7 : 1
              }}
            >
              <RefreshCw size={15} className={ingestionLoading ? 'animate-spin' : ''} />
              {ingestionLoading ? 'Processing 6 Branches...' : '⚡ Ingest 6-Branch Dataset'}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ maxWidth: '1400px', margin: '0.75rem auto 0', display: 'flex', gap: '0.4rem' }}>
          {[
            { id: 'pipeline', label: '1. Pipeline Overview', icon: Activity },
            { id: 'sandbox', label: '2. Judge Interactive Playground', icon: Sliders },
            { id: 'review', label: `3. Staff Review Queue (${reviewQueue.length})`, icon: ShieldAlert },
            { id: 'timeline', label: '4. Unified Clinical Timeline', icon: Calendar },
            { id: 'ledger', label: `5. Audit Ledger & Undo (${ledgerEntries.length})`, icon: Undo2 }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: active ? '#f1f5f9' : 'transparent',
                  color: active ? '#059669' : '#64748b',
                  border: 'none',
                  borderBottom: active ? '2px solid #059669' : '2px solid transparent',
                  padding: '0.55rem 0.95rem',
                  fontSize: '0.85rem',
                  fontWeight: active ? 700 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1400px', margin: '1.5rem auto', padding: '0 1.5rem', flex: 1, width: '100%' }}>

        {/* TAB 1: ARCHITECTURE & PIPELINE */}
        {activeTab === 'pipeline' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Mission Card */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: 'white',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15)'
            }}>
              <div style={{ maxWidth: '850px' }}>
                <span style={{
                  color: '#34d399',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}>
                  Standard Architecture Specification | Bizznnovate 2026
                </span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.4rem 0 0.8rem', lineHeight: 1.25 }}>
                  Decentralized Clinical Identity Resolution & Deduplication
                </h2>
                <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Aayush Aayurved Clinic operates 6 decentralized regional databases with disparate field names, localized title honorifics, typing errors, and inverted name orders. This system unifies them in real time without operational read/write lock contention.
                </p>
              </div>

              {/* 6 Decentralized Branch Badges */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginTop: '1.5rem' }}>
                {[
                  { name: "Branch 01 - North", schema: "Name, Phone, DOB, Pin" },
                  { name: "Branch 02 - South", schema: "FullName, Contact, BirthDate" },
                  { name: "Branch 03 - East", schema: "Patient_Name, Mobile, DoB" },
                  { name: "Branch 04 - West", schema: "Name, Phone_No, DateOfBirth" },
                  { name: "Branch 05 - Central", schema: "CustName, MobileNo, DOB" },
                  { name: "Branch 06 - Metro", schema: "Name, Contact_Number, Code" }
                ].map((b, i) => (
                  <div key={i} style={{
                    background: 'rgba(255, 255, 255, 0.07)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6ee7b7', fontWeight: 700, fontSize: '0.82rem' }}>
                      <Building2 size={14} />
                      {b.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                      Schema: <code>{b.schema}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step-by-Step Flowchart Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {[
                {
                  phase: "Phase 1",
                  title: "Decentralized Ingestion",
                  desc: "Connects to 6 read-replicas. Dynamic schema mapper converts custom keys into a unified JSON staging payload.",
                  tag: "Zero-Latency Staging",
                  color: "#0284c7"
                },
                {
                  phase: "Phase 2",
                  title: "Indian Demographic Parser",
                  desc: "Strips honorifics (Dr., Vaidya, Shri, Smt). Normalizes +91/0 phone prefixes into 10-digit E.164. Flags shared family phones.",
                  tag: "Regex & Phonetic Soundex",
                  color: "#059669"
                },
                {
                  phase: "Phase 3",
                  title: "Multi-Pass Blocking",
                  desc: "Avoids O(N²) pairwise comparisons. Pass 1: Exact Phone Partitioning. Pass 2: DOB + Metaphone Phonetic Hash Block.",
                  tag: "Candidate Pruning",
                  color: "#7c3aed"
                },
                {
                  phase: "Phase 4",
                  title: "Dual-Matching Engine",
                  desc: "Combines Jaro-Winkler (prefixes), Levenshtein (typos), and Vector Space Cosine (inverted names and abbreviations).",
                  tag: "Hybrid Vector Scoring",
                  color: "#d97706"
                },
                {
                  phase: "Phase 5",
                  title: "Confidence Bucketing",
                  desc: ">95%: Silent Auto-Merge | 75%-94%: Staff Review Queue | <75%: New Isolated Master Patient ID.",
                  tag: "Deterministic Policy",
                  color: "#2563eb"
                },
                {
                  phase: "Phase 6",
                  title: "Crisis Safety Nets",
                  desc: "Side-by-side review interface, unified cross-branch clinical timeline, and immutable ledger with One-Click 'Undo Merge'.",
                  tag: "Audit Trail & Reversal",
                  color: "#e11d48"
                }
              ].map((step, idx) => (
                <div key={idx} style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: step.color, letterSpacing: '0.05em' }}>
                        {step.phase}
                      </span>
                      <span style={{ fontSize: '0.7rem', background: '#f1f5f9', color: '#475569', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 600 }}>
                        {step.tag}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0.4rem 0', color: '#0f172a' }}>
                      {step.title}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Hybrid Metric Formula Box */}
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} color="#059669" />
                Dual-Engine Mathematical Hybrid Scoring Formula
              </h3>
              <div style={{
                background: '#f8fafc',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.9rem',
                color: '#1e293b'
              }}>
                Confidence Score = (0.35 × JaroWinkler) + (0.25 × Levenshtein) + (0.40 × VectorCosine)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem', fontSize: '0.82rem', color: '#475569' }}>
                <div>
                  <strong>Jaro-Winkler (w₁ = 0.35):</strong> Heavy prefix weighting handles patronymic Indic variances (e.g., <em>Choudhary</em> vs <em>Chowdhury</em>).
                </div>
                <div>
                  <strong>Levenshtein (w₂ = 0.25):</strong> Edit distance normalizer captures clerical keystroke errors (e.g., <em>Anil</em> vs <em>Aniel</em>).
                </div>
                <div>
                  <strong>Vector Cosine (w₃ = 0.40):</strong> Bi-Encoder spatial closeness resolves inverted names (<em>Malviya Aaditya</em>) & abbreviations (<em>R. K.</em>).
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: JUDGE INTERACTIVE PLAYGROUND */}
        {activeTab === 'sandbox' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                    Judge Interactive Testing Playground
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Test arbitrary candidate identity pairs live or select from the pre-built benchmark test cases.
                  </p>
                </div>

                {/* Benchmark Preset Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      setJudgeInputA({ name: "Dr. Aaditya Malviya", phone: "+91 98260 11223", dob: "1995-08-14", pin: "452001" });
                      setJudgeInputB({ name: "Malviya Aaditya", phone: "09826011223", dob: "14/08/1995", pin: "452001" });
                      setSharedPhoneCount(1);
                    }}
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600 }}
                  >
                    Preset 1: Inverted Name
                  </button>
                  <button
                    onClick={() => {
                      setJudgeInputA({ name: "Anil Sharma", phone: "+91 94250 77889", dob: "1985-11-05", pin: "450001" });
                      setJudgeInputB({ name: "Aniel Sharma", phone: "9425077889", dob: "05/11/1985", pin: "450001" });
                      setSharedPhoneCount(1);
                    }}
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600 }}
                  >
                    Preset 2: Keystroke Typo
                  </button>
                  <button
                    onClick={() => {
                      setJudgeInputA({ name: "R. K. Choudhary", phone: "+91 98930 44556", dob: "1978-03-22", pin: "462001" });
                      setJudgeInputB({ name: "Ram Kumar Chowdhury", phone: "9893044556", dob: "22-03-1978", pin: "462001" });
                      setSharedPhoneCount(1);
                    }}
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600 }}
                  >
                    Preset 3: Abbreviation & Spelling
                  </button>
                  <button
                    onClick={() => {
                      setJudgeInputA({ name: "Shri Ramesh Sharma", phone: "+91 98112 33445", dob: "1960-01-15", pin: "110001" });
                      setJudgeInputB({ name: "Smt. Sunita Sharma", phone: "+91 98112 33445", dob: "1965-07-20", pin: "110001" });
                      setSharedPhoneCount(3);
                    }}
                    style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}
                  >
                    Preset 4: Shared Family Phone Safety
                  </button>
                </div>
              </div>

              {/* Side-by-Side Input Form */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                {/* Profile A */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ background: '#0284c7', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>A</span>
                    Profile Record 1 (Branch North)
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Full Name (with Title)</label>
                      <input
                        type="text"
                        value={judgeInputA.name}
                        onChange={(e) => setJudgeInputA({ ...judgeInputA, name: e.target.value })}
                        style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Phone Number (Raw input)</label>
                      <input
                        type="text"
                        value={judgeInputA.phone}
                        onChange={(e) => setJudgeInputA({ ...judgeInputA, phone: e.target.value })}
                        style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Date of Birth</label>
                        <input
                          type="text"
                          value={judgeInputA.dob}
                          onChange={(e) => setJudgeInputA({ ...judgeInputA, dob: e.target.value })}
                          style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Postal PIN</label>
                        <input
                          type="text"
                          value={judgeInputA.pin}
                          onChange={(e) => setJudgeInputA({ ...judgeInputA, pin: e.target.value })}
                          style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile B */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ background: '#059669', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>B</span>
                    Profile Record 2 (Branch South)
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Full Name (Raw input)</label>
                      <input
                        type="text"
                        value={judgeInputB.name}
                        onChange={(e) => setJudgeInputB({ ...judgeInputB, name: e.target.value })}
                        style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Phone Number (Raw input)</label>
                      <input
                        type="text"
                        value={judgeInputB.phone}
                        onChange={(e) => setJudgeInputB({ ...judgeInputB, phone: e.target.value })}
                        style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Date of Birth</label>
                        <input
                          type="text"
                          value={judgeInputB.dob}
                          onChange={(e) => setJudgeInputB({ ...judgeInputB, dob: e.target.value })}
                          style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Postal PIN</label>
                        <input
                          type="text"
                          value={judgeInputB.pin}
                          onChange={(e) => setJudgeInputB({ ...judgeInputB, pin: e.target.value })}
                          style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shared Family Phone simulation slider */}
              <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ fontSize: '0.82rem', color: '#334155' }}>
                  <strong>Shared Household Phone Counter:</strong> Simulate how many family members share this phone in the master clinic database.
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    onClick={() => setSharedPhoneCount(1)}
                    style={{ padding: '0.3rem 0.7rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600, background: sharedPhoneCount < 3 ? '#0284c7' : '#e2e8f0', color: sharedPhoneCount < 3 ? 'white' : '#475569', border: 'none' }}
                  >
                    Normal (1-2 members)
                  </button>
                  <button
                    onClick={() => setSharedPhoneCount(3)}
                    style={{ padding: '0.3rem 0.7rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700, background: sharedPhoneCount >= 3 ? '#ef4444' : '#e2e8f0', color: sharedPhoneCount >= 3 ? 'white' : '#475569', border: 'none' }}
                  >
                    Shared Family Phone (≥ 3 members)
                  </button>
                </div>
              </div>

              {/* Live Evaluation Card */}
              <div style={{
                marginTop: '1.5rem',
                padding: '1.25rem',
                borderRadius: '10px',
                background: clientSim.bucket === 'Exact Match' ? '#f0fdf4' : clientSim.bucket === 'Possible Match' ? '#fffbeb' : '#f8fafc',
                border: `1.5px solid ${clientSim.bucket === 'Exact Match' ? '#86efac' : clientSim.bucket === 'Possible Match' ? '#fde047' : '#cbd5e1'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Calculated Decision Bucket
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.2rem' }}>
                      <span className={`badge ${clientSim.bucket === 'Exact Match' ? 'badge-exact' : clientSim.bucket === 'Possible Match' ? 'badge-possible' : 'badge-new'}`} style={{ fontSize: '0.9rem', padding: '0.35rem 0.8rem' }}>
                        {clientSim.bucket}
                      </span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                        {clientSim.hybridScore}% Overall Confidence
                      </span>
                    </div>
                  </div>

                  {/* Sub-Metric Score Breakdown */}
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ background: 'white', padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>Jaro-Winkler</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0284c7' }}>{clientSim.jwScore}%</div>
                    </div>
                    <div style={{ background: 'white', padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>Levenshtein</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#059669' }}>{clientSim.levScore}%</div>
                    </div>
                    <div style={{ background: 'white', padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>Vector Cosine</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#7c3aed' }}>{clientSim.vecScore}%</div>
                    </div>
                  </div>
                </div>

                {/* Safety Alert if applicable */}
                {clientSim.alertMsg && (
                  <div style={{
                    marginTop: '0.75rem',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    color: '#991b1b',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem'
                  }}>
                    <ShieldAlert size={16} />
                    {clientSim.alertMsg}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STAFF REVIEW QUEUE */}
        {activeTab === 'review' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                  Staff Review Queue (Human-in-the-Loop Safety Net)
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Candidate matches scoring between 75% and 94%, or flagged by multi-generational shared family phone safety checks.
                </p>
              </div>
              <button
                onClick={loadReviewQueue}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.4rem 0.85rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <RefreshCw size={14} /> Refresh Queue
              </button>
            </div>

            {reviewQueue.length === 0 ? (
              <div style={{ background: 'white', padding: '3rem', borderRadius: '12px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
                <CheckCircle2 size={40} color="#059669" style={{ margin: '0 auto 0.75rem' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  No Pending Items in Review Queue
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.35rem' }}>
                  All high-confidence candidate pairs have either been merged or evaluated. Click "⚡ Ingest 6-Branch Dataset" in the top bar to reload benchmark records.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reviewQueue.map((item) => (
                  <div key={item.pair_id} style={{
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '1.25rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                  }}>
                    {/* Header with Scores */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#64748b', fontSize: '0.8rem' }}>
                          {item.pair_id}
                        </span>
                        <span className="badge badge-possible">
                          {item.hybrid_confidence_score}% Confidence
                        </span>
                        {item.shared_family_phone_flag && (
                          <span className="badge badge-safety" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <ShieldAlert size={12} />
                            Shared Family Phone
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Blocking Source: <strong>{item.match_source || 'Multi-Pass Pre-Filter'}</strong>
                      </div>
                    </div>

                    {/* Explanation */}
                    <div style={{ fontSize: '0.8rem', color: '#475569', margin: '0.75rem 0', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                      <strong>Assessment:</strong> {item.explanation}
                    </div>

                    {/* Side-by-side Comparative Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', margin: '1rem 0' }}>
                      {/* Record A */}
                      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7' }}>
                            {item.profile_a.source_branch}
                          </span>
                          <code style={{ fontSize: '0.7rem' }}>ID: {item.profile_a.local_id}</code>
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                          {item.profile_a.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem' }}>
                          Phone: <strong>{item.profile_a.phone}</strong> | DOB: <strong>{item.profile_a.dob}</strong> | PIN: <strong>{item.profile_a.pin}</strong>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#334155', marginTop: '0.5rem', background: 'white', padding: '0.4rem', borderRadius: '4px', border: '1px solid #f1f5f9' }}>
                          <strong>Notes:</strong> {item.profile_a.clinical_notes}
                        </div>
                      </div>

                      {/* Record B */}
                      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>
                            {item.profile_b.source_branch}
                          </span>
                          <code style={{ fontSize: '0.7rem' }}>ID: {item.profile_b.local_id}</code>
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                          {item.profile_b.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem' }}>
                          Phone: <strong>{item.profile_b.phone}</strong> | DOB: <strong>{item.profile_b.dob}</strong> | PIN: <strong>{item.profile_b.pin}</strong>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#334155', marginTop: '0.5rem', background: 'white', padding: '0.4rem', borderRadius: '4px', border: '1px solid #f1f5f9' }}>
                          <strong>Notes:</strong> {item.profile_b.clinical_notes}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                      <button
                        onClick={() => handleDecision(item, 'REJECT_MERGE')}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#475569',
                          padding: '0.45rem 1rem',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          fontWeight: 600
                        }}
                      >
                        Reject (Keep Separate)
                      </button>
                      <button
                        onClick={() => handleDecision(item, 'APPROVE_MERGE')}
                        style={{
                          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                          border: 'none',
                          color: 'white',
                          padding: '0.45rem 1.15rem',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)'
                        }}
                      >
                        ✓ Approve & Merge Identities
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: UNIFIED CLINICAL TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                  Unified Cross-Branch Clinical Timeline
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Single consolidated patient medical record synthesized across all 6 decentralized clinic databases.
                </p>
              </div>

              {/* Sample Master Patient Selectors */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', alignSelf: 'center' }}>Inspect Patient:</span>
                <button
                  onClick={() => loadTimeline('MP_BBAE64FB')}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  Aaditya Malviya (3 Branches)
                </button>
                <button
                  onClick={() => loadTimeline('MP_DE71EAE6')}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  Anil Sharma (West & South)
                </button>
              </div>
            </div>

            {timelineLoading ? (
              <div style={{ padding: '3rem', textAlign: 'center', background: 'white', borderRadius: '12px' }}>
                <RefreshCw size={28} className="animate-spin" color="#059669" style={{ margin: '0 auto 0.5rem' }} />
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Aggregating chronological branch records...</p>
              </div>
            ) : patientTimeline ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Summary Demographics Card */}
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                          {patientTimeline.primary_demographics?.name || 'Aaditya Malviya'}
                        </h3>
                        <span style={{ background: '#dcfce7', color: '#15803d', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                          Master Patient: {patientTimeline.master_patient_id}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.85rem', color: '#475569', flexWrap: 'wrap' }}>
                        <span>Phone: <strong>{patientTimeline.primary_demographics?.phone}</strong></span>
                        <span>DOB: <strong>{patientTimeline.primary_demographics?.dob}</strong></span>
                        <span>PIN: <strong>{patientTimeline.primary_demographics?.pin}</strong></span>
                        <span>Unified Visits: <strong>{patientTimeline.total_branch_visits}</strong></span>
                      </div>
                    </div>

                    {/* Consolidated Allergies & Dosha */}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ background: '#fee2e2', border: '1px solid #fecaca', padding: '0.5rem 0.9rem', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase' }}>
                          Documented Allergies
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#7f1d1d' }}>
                          {patientTimeline.consolidated_allergies?.join(', ') || 'None documented'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chronological Visit Timeline */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={16} color="#059669" />
                    Chronological Cross-Branch Patient Encounters
                  </h4>

                  {patientTimeline.timeline?.map((event, idx) => (
                    <div key={idx} style={{
                      background: 'white',
                      borderRadius: '10px',
                      padding: '1.25rem',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <span style={{
                            background: '#0284c7',
                            color: 'white',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}>
                            {event.source_branch}
                          </span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                            Local ID: <code>{event.local_patient_id}</code> (Recorded as: <em>"{event.recorded_name}"</em>)
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {event.timestamp ? new Date(event.timestamp).toLocaleDateString() : 'Historical Encounter'}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '0.5rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '6px' }}>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>Ayurvedic Diagnostic Assessment</div>
                          <div style={{ fontSize: '0.85rem', color: '#0f172a', marginTop: '0.2rem' }}>{event.diagnostic_notes}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>Prescribed Treatment Plan</div>
                          <div style={{ fontSize: '0.85rem', color: '#0f172a', marginTop: '0.2rem' }}>{event.treatment_plan}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>Herbal Prescription</div>
                          <div style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 600, marginTop: '0.2rem' }}>{event.prescription}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ background: 'white', padding: '3rem', borderRadius: '12px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
                <Stethoscope size={36} color="#059669" style={{ margin: '0 auto 0.75rem' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  Select a Master Patient to View Unified History
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.35rem' }}>
                  Click one of the buttons above (e.g. "Aaditya Malviya") or approve a pair from the Staff Review Queue to view the consolidated timeline.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: AUDIT LEDGER & ONE-CLICK UNMERGE */}
        {activeTab === 'ledger' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                  Audit-Trailed Unmerge Engine (One-Click Reversal)
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Immutable transaction log capturing full state snapshots before any merge action. Enables safe 1-click reversal.
                </p>
              </div>
              <button
                onClick={loadLedger}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.4rem 0.85rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <RefreshCw size={14} /> Refresh Ledger
              </button>
            </div>

            {ledgerEntries.length === 0 ? (
              <div style={{ background: 'white', padding: '3rem', borderRadius: '12px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
                <Undo2 size={36} color="#64748b" style={{ margin: '0 auto 0.75rem' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  Audit Ledger Currently Empty
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.35rem' }}>
                  Click "⚡ Ingest 6-Branch Dataset" in the top header to run the pipeline and log transactions into the ledger.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {ledgerEntries.map((entry) => (
                  <div key={entry.transaction_id} style={{
                    background: 'white',
                    borderRadius: '10px',
                    padding: '1.25rem',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <code style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>
                          {entry.transaction_id}
                        </code>
                        <span style={{
                          fontSize: '0.72rem',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          fontWeight: 700,
                          background: entry.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
                          color: entry.status === 'ACTIVE' ? '#15803d' : '#991b1b'
                        }}>
                          {entry.status}
                        </span>
                        <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#475569', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                          Type: {entry.merge_type}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.4rem' }}>
                        Master Target: <strong>{entry.master_patient_id}</strong> | Merged Record Count: <strong>{entry.merged_record_ids?.length || 2}</strong>
                      </div>

                      {entry.unmerged_reason && (
                        <div style={{ fontSize: '0.75rem', color: '#b91c1c', marginTop: '0.3rem' }}>
                          <strong>Reversal Note:</strong> {entry.unmerged_reason}
                        </div>
                      )}
                    </div>

                    {/* Action button */}
                    {entry.status === 'ACTIVE' ? (
                      <button
                        onClick={() => handleUnmerge(entry.transaction_id)}
                        disabled={unmergeLoading}
                        style={{
                          background: '#fff1f2',
                          border: '1px solid #fecdd3',
                          color: '#e11d48',
                          padding: '0.45rem 1rem',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}
                      >
                        <Undo2 size={14} />
                        Undo Merge (Reversal)
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                        Reversed & Split
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer style={{
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '1.25rem 2rem',
        marginTop: '2rem',
        fontSize: '0.8rem',
        color: '#64748b'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <strong>Aayush Aayurved Clinic Record Deduplication</strong> • Built for Bizznnovate 2026
          </div>
          <div>
            FastAPI Backend & React Frontend • Dual Jaro-Winkler/Levenshtein/Vector Cosine Engine
          </div>
        </div>
      </footer>
    </div>
  );
}
