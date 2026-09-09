# AI Productivity Platform

A production-style full-stack productivity platform built with **React, Vite, Tailwind CSS, shadcn/ui, Node.js, Express.js, MySQL, and JWT Authentication**.

---

## 📁 Project Structure

```text
AI-PRODUCTIVITY-PLATFORM/
├── frontend/                     # React 18 + Vite SPA with Tailwind & shadcn/ui
│   ├── src/
│   │   ├── components/ui/        # Reusable UI components (Button, Card, Badge)
│   │   ├── layouts/              # Layout wrappers (RootLayout)
│   │   ├── pages/                # Page views (HomePage / Diagnostics)
│   │   ├── services/             # API client & health check callers
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
├── backend/                      # Node.js + Express REST API
│   ├── src/
│   │   ├── config/               # MySQL connection pool (db.js)
│   │   ├── controllers/          # Route controllers (healthController.js)
│   │   ├── routes/               # Express routes (healthRoutes.js)
│   │   ├── middleware/           # Error & 404 handlers (errorMiddleware.js)
│   │   ├── app.js                # Express app & CORS config
│   │   └── server.js             # Server entry listener
│   ├── package.json
│   ├── .env.example
│   └── .env
│
├── database/                     # MySQL database scripts
│   └── schema.sql                # Table DDL & schema setup
│
├── PHASE_1_ARCHITECTURE.md       # Complete system architecture specification
├── .gitignore                    # Git ignore for node_modules and .env files
├── .env.example                  # Root environment variables guide
└── README.md
```

---

## 🚀 Installation & Setup

### 1. Database Setup (MySQL)

Ensure MySQL is running on your machine. Create the database and initial tables using MySQL CLI or MySQL Workbench:

```sql
CREATE DATABASE IF NOT EXISTS ai_productivity_platform;
USE ai_productivity_platform;

-- Execute the schema script:
-- (or run database/schema.sql)
```

Alternatively, run from terminal:
```bash
mysql -u root -p < database/schema.sql
```

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
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=YOUR_MYSQL_PASSWORD
   DB_NAME=ai_productivity_platform
   DB_PORT=3306
   ```

3. Start the backend development server:
   ```bash
   npm run dev
   ```
   * The API server runs at `http://localhost:5000`
   * Health Check: `http://localhost:5000/api/health`
   * Database Health: `http://localhost:5000/api/health/db`

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
2. **Backend API:** `GET http://localhost:5000/api/health` returns `{ "status": "success", "message": "..." }`.
3. **MySQL Connection:** `GET http://localhost:5000/api/health/db` tests the active `mysql2` connection pool.

---

## 🗺️ Development Roadmap

- [x] **Phase 1 — Planning & Architecture:** System design, database normalization, API specifications in `PHASE_1_ARCHITECTURE.md`.
- [x] **Phase 2 — Project Setup & UI Foundation:** Express API, MySQL connection pool, Vite/React/Tailwind/shadcn setup, and live health check handshake.
- [ ] **Phase 3 — Database & Models:** Normalized relational tables and migration scripts.
- [ ] **Phase 4 — Authentication Subsystem:** JWT token generation, bcrypt hashing, and auth middleware.
- [ ] **Phase 5 — Core Backend APIs:** Projects, Tasks (Kanban), Subtasks, Focus Logs, Analytics.
- [ ] **Phase 6 — AI Service Integration:** Task breakdown, daily priority planning, note summarizer.
- [ ] **Phase 7 — Frontend Application UI:** Dashboard, Kanban Board, Focus Timer, Analytics.
- [ ] **Phase 8 — End-to-End Integration & Deployment:** Vercel (Frontend) + Render (Backend).
