# AI Learning Coach for Placement Preparation — Full System Documentation

## 1. Project Overview & Problem Statement
College students preparing for technical placement drives often face fragmented study materials, lack of personalized guidance, and inability to identify specific knowledge gaps. Standard practice platforms provide problem lists but fail to recognize underlying pattern weaknesses or track genuine score improvements.

**The Solution:** The AI Learning Coach is a personalized, end-to-end technical placement preparation platform combining **authoritative, deterministic backend scoring** with **qualitative Gemini AI coaching**, dynamic adaptive roadmaps, pattern recognition, a mistake journal, a revision center, and a reassessment engine.

---

## 2. Canonical Product Flow
The application provides a seamless, continuous learning journey:

```
PUBLIC LANDING PAGE
       ↓
SIGN UP / LOGIN (JWT + RBAC)
       ↓
PROFILE / ONBOARDING (College, Target Roles, Target Date, Schedule)
       ↓
PUBLISHED ASSESSMENT (MCQ & Coding)
       ↓
OBJECTIVE EVALUATION (Deterministic Server Scoring)
       ↓
AI ASSESSMENT ANALYSIS (Strong & Weak Topics, Knowledge Gaps)
       ↓
PERSONALIZED ROADMAP & LEARNING MAP
       ↓
GUIDED TOPIC LEARNING (What/Why/Where/When, Visuals, Syntax/Formulas, Dry Runs)
       ↓
INTELLIGENT PRACTICE (Objective Attempts, Hints, Pattern Recognition, Same-Logic Practice, Similar Questions, Confidence Checks)
       ↓
MISTAKE JOURNAL (Category Classification & Learning Notes)
       ↓
REVISION CENTER (Notes, Marked Items, Important Topics, Saved Concepts, Flashcards Deck)
       ↓
REASSESSMENT ENGINE (Targeted Fresh Questions, Score Comparison, Roadmap Adaptation)
```

---

## 3. Technology Stack & Architecture

- **Backend:** Node.js, Express.js (ES Modules), MongoDB Atlas, Mongoose ODM.
- **Frontend:** React 18, Vite, TailwindCSS (Vanilla/Custom Glassmorphism), Lucide Icons, Recharts.
- **AI Integration:** Google Gemini API (`gemini-3.8-flash`) via server-side client with strict fallback handling.
- **Authentication & RBAC:** JWT Bearer tokens, bcrypt password hashing, student/admin role middleware.
- **Execution & Evaluation:** Server-side deterministic grading engine with safe sandbox code execution options.

---

## 4. Key Module Architecture

### A. Assessment Engine & Deterministic Scoring
- Admin blueprint creation, AI question generation, review/edit/approval, and snapshot publication (`PublishedAssessment`).
- Authoritative server-side evaluation (`AssessmentAttempt`) enforcing marks, negative marking, and timing.
- Answer keys (`isCorrect`), `solutionCode`, `solutionExplanation`, and hidden test cases are **strictly hidden** from student client payloads.

### B. Assessment Analysis & Knowledge Gaps
- Deterministic classification: Strong (≥80%), Developing (60–79%), Weak (40–59%), Critical (<40%).
- Rule-based knowledge gap detection: `CONCEPT_GAP`, `PATTERN_GAP`, `PRACTICE_GAP`, `DIFFICULTY_GAP`.
- Qualitative Gemini AI interpretation complements—but **never overrides**—objective scores.

### C. Adaptive Roadmap & Learning Map
- Dynamic priority scoring based on target date urgency, daily preparation time, weakness severity, and topic dependencies.
- Sequence stabilization: Completed nodes remain completed, and roadmap updates automatically upon topic completion or reassessment.

### D. Guided Learning Experience & Intelligent Practice (Step 4 & Step 5)
- Subject-customized learning tabs (DSA, Aptitude, DBMS, OOPS, OS, CN).
- Wrong answer handling: Contextual hint → Pattern explanation → Same-Logic practice → Similar question → Confidence check (1-5 rating).

### E. Mistake Journal & Revision Center (Step 6)
- **Mistake Journal:** Stores practice errors with 7 strict category tags (`CONCEPT_NOT_CLEAR`, `PATTERN_NOT_RECOGNIZED`, `LOGIC_MISTAKE`, `CODING_IMPLEMENTATION_MISTAKE`, `TIME_PRESSURE`, `CARELESS_MISTAKE`, `DID_NOT_UNDERSTAND_QUESTION`), notes, and resolution tracking.
- **Revision Center:** 5 locked tabs: Personal Notes, Marked for Revision, Important Topics, Saved Concepts, Revision Cards.
- **Spaced Interval Flashcard Schedule:** Deterministic intervals (+1 day, +3 days, +7 days, +14 days, +30 days).

### F. Reassessment Engine (Step 6)
- Generates fresh assessments targeting student weak areas.
- Evaluates submission, preserves historical baseline data, and computes exact improvement string (e.g. `"Improvement: +16 percentage points"`).

---

## 5. Security Model & Data Isolation
1. **Zero Client Secrets:** `GEMINI_API_KEY`, `JWT_SECRET`, and `MONGODB_URI` remain server-side.
2. **Identity Scoping:** All user endpoints derive identity solely from authenticated `req.user.userId`.
3. **Data Isolation:** Students cannot access another student's notes, mistakes, assessment attempts, or revision items.
4. **Answer Key Secrecy:** Assessment and practice APIs filter out answers and hidden test cases before returning payloads to students.

---

## 6. Testing & Quality Assurance
- **Automated Verification Suite:** 44 dedicated verification scripts in `server/scripts/`.
- **Regression Suite:** `node scripts/runAllTests.js` verifies 100% pass rate across all modules.
- **Production Build:** `npm run build` in `client/` builds cleanly without warnings or errors.
