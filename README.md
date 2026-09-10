# AI Productivity Platform

A production-style full-stack productivity platform built with **React, Vite, Tailwind CSS, shadcn/ui, Node.js, Express.js, MongoDB + Mongoose, and JWT Authentication**.

---

## 📁 Project Structure

```text
AI-PRODUCTIVITY-PLATFORM/
├── frontend/                     # React 18 + Vite SPA with Tailwind & shadcn/ui
│   ├── src/
│   │   ├── components/ui/        # Reusable UI components (Button, Card, Badge)
│   │   ├── layouts/              # Layout wrappers (RootLayout)
│   │   ├── pages/                # Page views (HomePage / Diagnostics)
│   │   ├── services/             # API client & health check callers (api.js)
│   │   ├── lib/                  # Utilities (cn helper)
│   │   ├── App.jsx               # React Router config
│   │   ├── main.jsx              # Application entry
│   │   └── index.css             # Tailwind design tokens
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   ├── .env.example
│   └── .env
│
├── backend/                      # Node.js + Express + MongoDB REST API
│   ├── src/
│   │   ├── config/               # MongoDB Mongoose connection (db.js)
│   │   ├── controllers/          # Resource controllers (user, team, document, task, workflow, audit, health)
│   │   ├── models/               # Mongoose models (User, Team, Document, Task, Workflow, WorkflowStep, AuditLog)
│   │   ├── routes/               # Express REST routes
│   │   ├── services/             # Business logic & query services
│   │   ├── middleware/           # Auth, Validation & Centralized Error Handlers
│   │   ├── validators/           # express-validator schemas
│   │   ├── app.js                # Express app & CORS config
│   │   └── server.js             # Server entry listener
│   ├── package.json
│   ├── Dockerfile                # Production Docker container
│   ├── .env.example
│   └── .env
│
├── PHASE_1_ARCHITECTURE.md       # Complete system architecture specification
├── .gitignore                    # Git ignore for node_modules and .env files
├── .env.example                  # Root environment variables guide
└── README.md
```

---

## 🚀 Installation & Setup

### 1. Database Setup (MongoDB)

Ensure MongoDB is running locally (`mongodb://127.0.0.1:27017`) or configure a MongoDB Atlas connection string.

---

### 2. Backend Setup

1. Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Configure environment variables in `backend/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/ai_productivity_platform
   JWT_SECRET=dev_jwt_secret_key_productivity_2026
   NODE_ENV=development
   ```

3. Start the backend development server:
   ```bash
   npm run dev
   ```
   * The API server runs at `http://localhost:5000`
   * Health Check: `http://localhost:5000/api/health`
   * Database Health: `http://localhost:5000/api/health/db`
   * API Index: `http://localhost:5000/`

---

### 3. Frontend Setup

1. Navigate to the frontend directory and install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Configure environment variables in `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   * Open `http://localhost:5173` in your browser.

---

## 🧪 Testing & Diagnostics

1. **Frontend UI:** Open `http://localhost:5173` to view the live System Diagnostics and connectivity card.
2. **Backend API:** `GET http://localhost:5000/api/health` returns `{ "success": true, "message": "..." }`.
3. **MongoDB Connection:** `GET http://localhost:5000/api/health/db` tests the active Mongoose database connection.
4. **API Verification Suite:** Run `node test/verify-phase3.js` from `backend/` to test all CRUD modules, validation rules, error handling, and audit logging.

---

## 🗺️ Development Roadmap

- [x] **Phase 1 — Planning & Architecture:** System design, database normalization, API specifications in `PHASE_1_ARCHITECTURE.md`.
- [x] **Phase 2 — Project Setup & UI Foundation:** Express API, Vite/React/Tailwind/shadcn setup, and live health check handshake.
- [x] **Phase 3 — MongoDB + Mongoose Architecture Migration:** Full layered architecture (Routes -> Middleware -> Controllers -> Services -> Models -> MongoDB), 7 Mongoose models, validation, centralized error handling, and audit logs.
- [ ] **Phase 4 — Authentication Subsystem:** JWT token generation, bcrypt hashing, and auth middleware.
- [ ] **Phase 5 — Core Backend APIs:** Projects, Tasks (Kanban), Subtasks, Focus Logs, Analytics.
- [ ] **Phase 6 — AI Service Integration:** Task breakdown, daily priority planning, note summarizer.
- [ ] **Phase 7 — Frontend Application UI:** Dashboard, Kanban Board, Focus Timer, Analytics.
- [ ] **Phase 8 — End-to-End Integration & Deployment:** Vercel (Frontend) + Render (Backend).
