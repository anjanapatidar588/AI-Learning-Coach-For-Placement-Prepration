# System Architecture & Technical Proposal: AI Placement Coach

## 1. Requirements & Scope Analysis

### Core Principles & User Roles
The **AI Placement Coach** platform is designed strictly with **TWO user roles**:
1. **Student**: Learns, practices, takes mock tests/interviews, views personalized roadmap and analytics.
2. **Admin**: Manages curriculum, topics, questions, companies, platform analytics, student records, and AI prompts/configurations.

> [!IMPORTANT]
> **No Separate AI Teacher Roles or Portals**: AI Mentors (DSA Mentor, Aptitude Mentor, CS Core Mentor, Interview Coach, Career Coach) are contextual AI capabilities embedded directly inside the Student Experience. They do not have login credentials, admin panels, or separate role permissions.

### Core Student Modules (13 Pages/Modules)
1. **Student Dashboard**: Single unified overview (Roadmap preview, daily goals, streak, readiness score, recent activity).
2. **My AI Coach**: Centralized multi-turn conversational interface with subject persona switching.
3. **DSA Module**: Topic list, code editor (Monaco), problem statement, test cases, AI debugging assistant.
4. **Aptitude Module**: Topic wise quizzes, timed test environment, step-by-step AI solution explanation.
5. **CS Core Module**: DBMS, OS, Computer Networks, OOPs content, flashcards, conceptual quizzes.
6. **Practice Zone**: Filters by difficulty, company, tag; timed coding and MCQ challenges.
7. **Mock Interview**: Audio/Text conversational mock interviews with real-time feedback & rubric scoring.
8. **Company Preparation**: Company-specific tracks (TCS, Infosys, Amazon, Google, etc.), past questions, hiring patterns.
9. **Resume Analyzer**: ATS score breakdown, skill extraction, keyword gap identification via Gemini AI.
10. **My Progress**: Skill charts, topic mastery percentages, attempt breakdown over time.
11. **Weak Areas**: AI-detected weak topics, recommended remedial questions, concept refreshers.
12. **Achievements**: Badges, milestones, streaks, leaderboard position.
13. **Profile / Settings**: Target companies, target job roles, preferred languages, account management.

### Core Admin Modules (10 Pages/Modules)
1. **Admin Dashboard**: System health, active users, total submissions, overall readiness trends.
2. **Student Management**: View students, track individual performance, manage accounts.
3. **Question Management**: CRUD for DSA coding problems, MCQs, test cases, hints, difficulty.
4. **DSA Topic Management**: DSA modules, data structures, algorithm taxonomy, prerequisites.
5. **Aptitude Topic Management**: Quantitative, Logical, Verbal topic classification.
6. **CS Core Subject/Content Management**: Manage subjects, notes, syllabus, quiz banks.
7. **Company Management**: Company profiles, hiring criteria, test formats, pattern mapping.
8. **Resource Management**: External links, video references, cheatsheets, study materials.
9. **AI Configuration**: System prompts tuning, model temperature controls, token limits, fallback prompts.
10. **Platform Analytics**: Aggregate performance stats, most attempted questions, common error analytics.

---

## 2. Complete System Architecture

```
                                  +---------------------------------------+
                                  |            CLIENT LAYER               |
                                  | React + Vite + Tailwind CSS + Recharts|
                                  |         Monaco Code Editor            |
                                  +------------------+--------------------+
                                                     |
                                                     | HTTPS / REST / SSE
                                                     v
                                  +---------------------------------------+
                                  |            BACKEND LAYER              |
                                  |         Node.js + Express.js          |
                                  |   JWT Auth Middleware + RBAC Guard    |
                                  +---------+-----------------+-----------+
                                            |                 |
                   +------------------------+                 +------------------------+
                   |                                                                   |
                   v                                                                   v
     +---------------------------+                                       +---------------------------+
     |      DATABASE LAYER       |                                       |     EXTERNAL SERVICES     |
     | MongoDB + Mongoose ODM    |                                       |                           |
     | - Users & Profiles        |                                       | 1. Gemini API (Node SDK)  |
     | - Question Bank           |                                       |    - Personalization      |
     | - Attempt Records         |                                       |    - AI Mentors           |
     | - Performance Metrics     |                                       |    - Resume & Interview   |
     | - Personalised Roadmaps   |                                       | 2. External Code Sandbox  |
     +---------------------------+                                       |    - Code Execution API  |
                                                                         +---------------------------+
```

### Key Architectural Pillars
- **Single Page Application (SPA)** built with Vite + React.
- **RESTful API Backend** using Express.js.
- **Decoupled AI Layer**: Gemini API is strictly invoked server-side. Frontend makes secure API requests to Node.js backend endpoints, which construct secure system prompts and execute Gemini calls.
- **External Code Execution Engine**: Secure API proxy in Node backend connecting to an isolated sandbox (e.g. Judge0 / Piston execution engine API).

---

## 3. Proposed Frontend Folder Structure

```
client/
├── public/
│   └── favicon.ico
├── src/
│   │   │   ├── DSAModule.jsx
│   │   │   ├── AptitudeModule.jsx
│   │   │   ├── CSCoreModule.jsx
│   │   │   ├── PracticeZone.jsx
│   │   │   ├── ProblemDetail.jsx
│   │   │   ├── MockInterview.jsx
│   │   │   ├── CompanyPrep.jsx
│   │   │   ├── ResumeAnalyzer.jsx
│   │   │   ├── MyProgress.jsx
│   │   │   ├── WeakAreas.jsx
│   │   │   ├── Achievements.jsx
│   │   │   └── ProfileSettings.jsx
│   │   └── admin/
│   │       ├── AdminDashboard.jsx
│   │       ├── StudentManagement.jsx
│   │       ├── QuestionManagement.jsx
│   │       ├── DSATopicMgmt.jsx
│   │       ├── AptitudeTopicMgmt.jsx
│   │       ├── CSCoreContentMgmt.jsx
│   │       ├── CompanyManagement.jsx
│   │       ├── ResourceManagement.jsx
│   │       ├── AIConfiguration.jsx
│   │       └── PlatformAnalytics.jsx
│   ├── services/
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 4. Proposed Backend Folder Structure

```
server/
│   ├── models/
│   │   ├── User.js
│   │   ├── LearnerProfile.js
│   │   ├── Roadmap.js
│   │   ├── ResumeAnalysis.js
│   │   ├── Company.js
│   │   ├── Achievement.js
│   │   └── AIConfig.js
│   ├── routes/
├── package.json
└── server.js
```

---

## 5. Database Collections & Schema Relationships

```mermaid
erDiagram

#### 1. `users` Collection
- `_id`: ObjectId
- `name`: String

---

## 6. Proposed API Module Structure


---

## 8. Personalization Engine & Performance Data Flow

```

### Key Mathematical Metrics Managed by Personalization Engine:
1. **Topic Mastery Index ($TMI$)**:
   $$TMI = (0.6 \times \text{Accuracy}) + (0.25 \times \text{Speed Score}) + (0.15 \times \text{Consistency})$$
2. **Readiness Score ($RS$) for Target Company**:
   Weighted sum of Topic Mastery scores against the Target Company's specific syllabus pattern weightage.

---

