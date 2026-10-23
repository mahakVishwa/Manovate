# 🌿 Aayush Aayurved Clinic — Smart Patient Record Linkage
**Automated Cross-Branch Patient Identity Matching & Clinical Unification**  
*Project Standard: Bizznnovate 2026*

---

## 💡 What is This Project? (In Plain English)

Imagine a patient visits **Aayush Aayurved Clinic** in the North branch, where the receptionist enters his name as **"Dr. Aaditya Malviya"** with phone number **`+91 98260 11223`**. 

Six months later, he visits the South branch. The receptionist there writes his name as **"Malviya Aaditya"** (surname first) and records his phone number as **`09826011223`**.

In traditional clinic software, these become **two completely separate duplicate files**:
- The doctor in the South branch cannot see that the patient already had *Kati Basti* treatment or took *Ashwagandha* at the North branch.
- Documented allergies or medical notes from one clinic are lost to doctors at another clinic.

**This project solves that problem.**  
It automatically connects the databases of all **6 decentralized regional clinic branches**, finds duplicate patient files even with typos, name order swaps, or different titles, and combines them into **one unified medical history**.

---

## 🔍 How It Works (Without the Technical Jargon)

### 1. Cleaning Up Regional Data
In India, demographic details are entered in many different ways:
- **Titles & Honorifics**: People write *"Dr."*, *"Vaidya"*, *"Shri"*, *"Smt."*, *"Kumari"*, or *"Master"*. The system automatically removes these so names can be compared cleanly.
- **Phone Numbers**: Normalizes `+91`, leading zeros, dashes, and spaces into a clean 10-digit mobile number.
- **Dates of Birth**: Converts different formats (`14/08/1995` vs `1995-08-14`) into a standard date.

---

### 2. Smart Name Comparison (Beyond Exact Matching)
Simple computer searches fail when words aren't identical. Our engine checks three common real-life patterns:
1. **Name Order Inversion**: Understands that *"Malviya Aaditya"* and *"Aaditya Malviya"* are the exact same person.
2. **Spelling Differences**: Understands common regional variations like *"Choudhary"* vs *"Chowdhury"*.
3. **Keyboard Typos**: Catches clerical mistakes like *"Anil Sharma"* vs *"Aniel Sharma"*.

---

### 3. The "Family Phone" Protection (Indian Household Safety Net)
In multi-generational Indian families, grandparents, parents, and children often share a single mobile number.
- If a computer matches records *only* by phone number, it might accidentally merge a grandmother's records with her grandson's!
- **Our Safety Rule**: If 3 or more family members share the same phone number, the system **never auto-merges them**. It flags them as a family household and holds them for human review.

---

### 4. Three Clear Decision Buckets
Every comparison is given a confidence score from **0% to 100%**:

| Score | Decision | What Happens? |
| :--- | :--- | :--- |
| **Above 95%** | **Exact Match** | System automatically merges the records. Doctors immediately see the full history. |
| **75% to 94%** | **Possible Match** | Sent to the **Staff Review Queue**. A clinic receptionist sees both records side-by-side with differences highlighted to make the final call. |
| **Below 75%** | **New Patient** | Identity is confirmed distinct. A fresh, separate patient ID is created. |

*If inputs are blank or completely unrelated (like "Apple" vs "Zebra"), the score drops strictly to **0%**.*

---

### 5. Unified Medical Timeline & "Undo" Safety Button
- **Consolidated Clinical History**: Doctors at any branch can see all previous diagnostic notes, Ayurvedic treatment plans (*Kati Basti, Panchakarma*), documented allergies, and herbal prescriptions from all branches in one place.
- **1-Click "Undo Merge"**: If a staff member accidentally approves a merge they shouldn't have, clinic administrators can click one button to instantly split the profiles back to their original states without losing any medical data.

---

## 🚀 How to Run and Test It (Takes 5 Seconds)

### Fast Startup:
Double-click the file named:
👉 **`run_app.bat`** *(located inside the `aayush_deduplication_project` folder)*

Then open your browser to:
👉 **[http://localhost:8000/](http://localhost:8000/)**

---

## 🎯 What to Click on the Dashboard (Judge Walkthrough)

When you open the web page, you will see a clean, easy-to-use clinic dashboard with 5 tabs:

1. **Tab 1: Architecture Pipeline**
   - See an executive summary of how data flows from 6 clinic branches into a single unified record.

2. **Tab 2: Judge Interactive Playground**
   - Click the preset buttons to test real scenarios live:
     - **Preset 1 (Inverted Name)**: See how *"Dr. Aaditya Malviya"* and *"Malviya Aaditya"* match at **100%**.
     - **Preset 2 (Typo)**: See how *"Anil Sharma"* and *"Aniel Sharma"* match with high confidence.
     - **Preset 3 (Spelling & Abbreviation)**: See how *"R. K. Choudhary"* matches *"Ram Kumar Chowdhury"*.
     - **Preset 4 (Family Phone Safety)**: See the red safety alert activate when family members share a phone.
   - **Try typing anything yourself**: If you clear the names or type completely different words, watch the score drop to **0%**.

3. **Tab 3: Staff Review Queue**
   - Look at candidate matches that need human attention.
   - See conflicting fields highlighted clearly.
   - Click **"✓ Approve & Merge Identities"** or **"Reject"** to test staff decision-making.

4. **Tab 4: Unified Clinical Timeline**
   - Click on **"Aaditya Malviya (3 Branches)"**.
   - See how 3 separate visits from Branch 01 (North), Branch 02 (South), and Branch 06 (Metro) are organized into a single chronological patient medical card.

5. **Tab 5: Audit Ledger & Undo Button**
   - View the immutable transaction history.
   - Click **"Undo Merge (Reversal)"** to test how easily an accidental merge can be rolled back.

---

## 🏥 Why This Matters for Healthcare Clinics

- **Patient Safety**: Prevents prescribing conflicting medicines or repeating dangerous allergen exposures.
- **Continuity of Care**: Ayurvedic practitioners can track chronic illnesses (like arthritis or spondylosis) across years and across cities.
- **Saves Staff Time**: Eliminates manual searching through duplicate files across branch systems.
- **Built for India**: Specifically designed for Indian names, phone habits, and multi-generational families.
