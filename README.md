# AI Placement Coach

A full-stack AI-powered placement preparation platform designed to help students master DSA, Aptitude, CS Core concepts, Mock Interviews, and Resume Optimization through personalized AI coaching.

---

## 🏗️ Project Structure

```
ai-placement-coach/
├── client/              # React + Vite + Tailwind CSS frontend
│   ├── src/
│   │   ├── components/  # Reusable UI & status components
│   │   ├── context/     # Auth & Theme context providers
│   │   ├── layouts/     # Student, Admin & Auth layout wrappers
│   │   ├── modules/     # Student, Admin & Auth page views
│   │   ├── services/    # Axios API client & service layers
│   │   ├── utils/       # Utility functions & constants
│   │   ├── App.jsx      # React Router configuration
│   │   └── main.jsx     # Frontend entry point
│   └── package.json
├── server/              # Node.js + Express + Mongoose backend
│   ├── src/
│   │   ├── config/      # DB, JWT, Gemini & env configs
│   │   ├── controllers/ # Request controllers (placeholders & handlers)
│   │   ├── middlewares/ # Auth, Role, Error & Rate Limiting middlewares
│   │   ├── models/      # Mongoose schema models
│   │   ├── routes/      # Aggregated API router (/api/v1)
│   │   ├── services/    # Business & AI services
│   │   └── utils/       # ApiError, ApiResponse & Logger utilities
│   ├── server.js        # Backend entry point
│   └── package.json
├── .gitignore
├── README.md
└── package.json         # Root package manager
```

---

## ⚙️ Environment Configuration

Copy `server/.env.example` to `server/.env` before starting the backend:

```bash
cp server/.env.example server/.env
```

Ensure the following placeholders are defined in `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ai_placement_coach
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
CLIENT_URL=http://localhost:5173
```

---

## 🚀 Getting Started

### 1. Install Dependencies

Install root dependencies (optional, for concurrent runner):
```bash
npm install
```

Install backend dependencies:
```bash
cd server
npm install
```

Install frontend dependencies:
```bash
cd client
npm install
```

### 2. Running the Application

**Run Frontend and Backend Concurrently (from root):**
```bash
npm run dev
```

**Or Run Separately:**

Backend (`server/`):
```bash
npm run dev
# Running on http://localhost:5000
```

Frontend (`client/`):
```bash
npm run dev
# Running on http://localhost:5173
```

---

## 🔍 API Foundation & Health Check

- **GET** `/api/v1/health`
  - Returns backend status and MongoDB database connectivity details.
