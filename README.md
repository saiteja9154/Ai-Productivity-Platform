# AI Productivity Platform ⚡

```text
    _    ___   ____  ____   ___  ____  _   _  ____ _____ _____     _____ _____ 
   / \  |_ _| |  _ \|  _ \ / _ \|  _ \| | | |/ ___|_   _|_   _|   |  ___|_   _|
  / _ \  | |  | |_) | |_) | | | | | | | | | | |     | |   | |_____| |_    | |  
 / ___ \ | |  |  __/|  _ <| |_| | |_| | |_| | |___  | |   | |_____|  _|   | |  
/_/   \_\___| |_|   |_| \_\\___/|____/ \___/ \____| |_|   |_|     |_|     |_|  
                                                                               
   Intelligent Task, Document & Automated Workflow Engineering Engine          
```

<div align="center">

[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT_Auth-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://jwt.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**A high-performance, full-stack productivity ecosystem uniting intelligent document authoring, sprint task pipelines, state-machine workflows, and enterprise-grade role-based authentication.**

[Live Diagnostics](#-system-diagnostics--health-hub) • [System Architecture](#-system-architecture--data-flow) • [API Reference](#-complete-api-reference) • [Quickstart](#-quickstart-installation--setup) • [Test Suite](#-automated-verification-suite)

</div>

---

## 📝 Overview

**AI Productivity Platform** is a modern, domain-driven productivity workspace engineered for agile developer teams and high-output builders. Built on a modular layered architecture with **React 19**, **Node.js/Express**, **MongoDB/Mongoose**, and **JSON Web Token (JWT)** security, the platform provides seamless orchestration across documents, tasks, and automated execution workflows.

Every component is designed with clean separation of concerns, defensive data validation, cryptographic hashing, and reactive client state management.

---

## 📸 Interface Preview & UX Design

```text
+---------------------------------------------------------------------------------------------+
|  [⚡ AI Productivity Platform]       Dashboard   Documents   Tasks   Workflows  | [👤 Steja (admin)] [🚪 Logout] |
+---------------------------------------------------------------------------------------------+
|                                                                                             |
|  🟢 Authentication Status: Logged In (JWT Active)                   [Phase 4 Operational]   |
|  Welcome back, Steja!                                                                       |
|  Secure workspace authenticated via HS256 Bearer Token                                     |
|                                                                                             |
|  +---------------------------+  +---------------------------+  +--------------------------+ |
|  | 👤 User Identity          |  | 🛡️ Role & Access Level     |  | 🔑 Cryptographic Guard   | |
|  | Name: Steja               |  | Assigned: ADMIN           |  | Token: Bearer JWT        | |
|  | Email: steja@example.com  |  | API: Protected Routes ✓   |  | Passwords: Bcrypt (10) ✓ | |
|  +---------------------------+  +---------------------------+  +--------------------------+ |
|                                                                                             |
|  PLATFORM APPLICATION MODULES                                                               |
|  +---------------------------+  +---------------------------+  +--------------------------+ |
|  | 📄 Documents Module       |  | 📋 Tasks & Sprints        |  | 🔀 Autonomous Workflows  | |
|  | Versioned docs & notes    |  | State-machine sprint board|  | Multi-step AI agent runs | |
|  | [ Open Documents -> ]     |  | [ Open Tasks -> ]         |  | [ Open Workflows -> ]    | |
|  +---------------------------+  +---------------------------+  +--------------------------+ |
+---------------------------------------------------------------------------------------------+
```

---

## ✨ Key Platform Features

### 🔐 1. Cryptographic Authentication & RBAC Foundation
- **Bcrypt Password Hashing**: Salt rounds: 10 with automatic pre-save hooks; plain-text passwords never touch database persistence.
- **Stateless JWT Tokens**: Signed using `HS256` with configurable expiration (`7d`).
- **Role-Based Access Control (RBAC)**: Support for `user`, `admin`, `manager`, and `member` authorization tiers.
- **Client Route Guards**: React `ProtectedRoute` components with automatic redirection and route memory.

### 🏛️ 2. Enterprise Layered Backend
- **Clean Architecture Pattern**: Strict decoupling across `Routes` ➔ `Validators` ➔ `Middleware` ➔ `Controllers` ➔ `Services` ➔ `Models` ➔ `MongoDB`.
- **Defensive Validation**: Comprehensive schema validation powered by `express-validator`.
- **System Audit Trails**: Automated tracking of every resource creation, update, profile change, and deletion in an immutable `AuditLog` collection.

### 🎨 3. Sleek Glassmorphic Frontend
- **Tailwind CSS & shadcn/ui Design**: Custom dark-mode theme tokens, radial gradient glows, and responsive cards.
- **React Context Hydration**: `AuthContext` provides instantaneous session state sync, live profile updates, and automatic token validation.
- **Unified Navigation & Diagnostics**: Embedded connectivity monitors for backend REST API and MongoDB connection health.

---

## 🏗️ System Architecture & Data Flow

```text
                               ┌───────────────────────────┐
                               │   React 19 Single Page    │
                               │   Vite + Tailwind UI      │
                               └─────────────┬─────────────┘
                                             │ HTTP Request
                                             │ Authorization: Bearer <JWT>
                                             ▼
                               ┌───────────────────────────┐
                               │   Express REST Gateway    │
                               │   (CORS, Body Parsers)    │
                               └─────────────┬─────────────┘
                                             │
                      ┌──────────────────────┴──────────────────────┐
                      ▼                                             ▼
        ┌───────────────────────────┐                 ┌───────────────────────────┐
        │  Public Authentication    │                 │   Protected Resource APIs │
        │  POST /api/auth/register  │                 │   GET/PUT /api/users/profile  │
        │  POST /api/auth/login     │                 │   /documents, /tasks, etc.    │
        └─────────────┬─────────────┘                 └─────────────┬─────────────┘
                      │                                             │
                      │                                             ▼
                      │                               ┌───────────────────────────┐
                      │                               │   authMiddleware.js       │
                      │                               │   (JWT verifyToken)       │
                      │                               └─────────────┬─────────────┘
                      │                                             │
                      │                                             ▼
                      │                               ┌───────────────────────────┐
                      │                               │   roleMiddleware.js       │
                      │                               │   (authorizeRoles)        │
                      │                               └─────────────┬─────────────┘
                      │                                             │
                      ▼                                             ▼
        ┌─────────────────────────────────────────────────────────────────────────┐
        │                          Service Logic Layer                            │
        │      (authService.js, userService.js, documentService.js, etc.)         │
        └────────────────────────────────────┬────────────────────────────────────┘
                                             │
                                             ▼
        ┌─────────────────────────────────────────────────────────────────────────┐
        │                       Mongoose ODM Data Layer                           │
        │   (User, Team, Document, Task, Workflow, WorkflowStep, AuditLog)        │
        └────────────────────────────────────┬────────────────────────────────────┘
                                             │
                                             ▼
                               ┌───────────────────────────┐
                               │      MongoDB Database     │
                               │   (Collections & Indexes) │
                               └───────────────────────────┘
```

---

## 📂 Complete Directory Structure

```text
AI-PRODUCTIVITY-PLATFORM/
├── frontend/                               # React 19 Client Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                         # shadcn/ui primitive components
│   │   │   │   ├── Badge.jsx               # Status indicators & pills
│   │   │   │   ├── Button.jsx              # Interactive button variants
│   │   │   │   └── Card.jsx                # Glassmorphic container cards
│   │   │   ├── Navbar.jsx                  # Header with user badge & logout
│   │   │   └── ProtectedRoute.jsx          # Auth guard component
│   │   ├── context/
│   │   │   └── AuthContext.jsx             # Global user session provider
│   │   ├── layouts/
│   │   │   └── RootLayout.jsx              # Shell layout with top navigation
│   │   ├── pages/
│   │   │   ├── HomePage.jsx                # Diagnostic connectivity hub
│   │   │   ├── Login.jsx                   # User authentication view
│   │   │   ├── Signup.jsx                  # Account registration view
│   │   │   ├── Dashboard.jsx               # Authenticated control panel
│   │   │   ├── Profile.jsx                 # Profile management & edit view
│   │   │   ├── Documents.jsx               # Documents module placeholder
│   │   │   ├── Tasks.jsx                   # Tasks module placeholder
│   │   │   └── Workflows.jsx               # Workflows module placeholder
│   │   ├── services/
│   │   │   ├── api.js                      # Diagnostic health endpoints
│   │   │   └── authService.js              # Token management & Auth HTTP client
│   │   ├── App.jsx                         # React Router route registry
│   │   ├── main.jsx                        # Application root render
│   │   └── index.css                       # Tailwind design tokens & base rules
│   ├── index.html                          # HTML template
│   ├── vite.config.js                      # Vite bundler configuration
│   ├── tailwind.config.js                  # Tailwind utility definitions
│   └── package.json                        # Frontend dependencies
│
├── backend/                                # Node.js + Express REST API
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                       # Mongoose MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.js           # Register & login handlers
│   │   │   ├── userController.js           # Profile & user CRUD handlers
│   │   │   ├── teamController.js           # Team management handlers
│   │   │   ├── documentController.js       # Document CRUD handlers
│   │   │   ├── taskController.js           # Task state machine handlers
│   │   │   ├── workflowController.js       # Workflow execution handlers
│   │   │   ├── auditController.js          # Audit log retrieval handlers
│   │   │   └── healthController.js         # Service & DB health probes
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js           # Bearer JWT verification & context
│   │   │   ├── roleMiddleware.js           # Role authorization guard (RBAC)
│   │   │   ├── validationMiddleware.js     # express-validator response wrapper
│   │   │   └── errorMiddleware.js          # Centralized error handler & 404
│   │   ├── models/
│   │   │   ├── User.js                     # Bcrypt hashed user model
│   │   │   ├── Team.js                     # Team organizational unit
│   │   │   ├── Document.js                 # Versioned document schema
│   │   │   ├── Task.js                     # State-driven task model
│   │   │   ├── Workflow.js                 # Automation workflow schema
│   │   │   ├── WorkflowStep.js             # Atomic workflow action step
│   │   │   └── AuditLog.js                 # Immutable activity ledger
│   │   ├── routes/
│   │   │   ├── authRoutes.js               # /api/auth routes
│   │   │   ├── userRoutes.js               # /api/users & /api/users/profile
│   │   │   ├── teamRoutes.js               # /api/teams routes
│   │   │   ├── documentRoutes.js           # /api/documents routes
│   │   │   ├── taskRoutes.js               # /api/tasks routes
│   │   │   ├── workflowRoutes.js           # /api/workflows routes
│   │   │   ├── auditRoutes.js              # /api/audit-logs routes
│   │   │   └── healthRoutes.js             # /api/health routes
│   │   ├── services/
│   │   │   ├── authService.js              # Auth business logic & JWT signing
│   │   │   ├── userService.js              # Profile operations & audit sync
│   │   │   ├── teamService.js              # Team CRUD logic
│   │   │   ├── documentService.js          # Document persistence logic
│   │   │   ├── taskService.js              # Task filtering & updates
│   │   │   ├── workflowService.js          # Workflow sequence manager
│   │   │   └── auditService.js             # Centralized audit logger
│   │   ├── utils/
│   │   │   └── jwt.js                      # JWT generation & validation
│   │   ├── validators/
│   │   │   ├── authValidator.js            # Auth & Profile validation rules
│   │   │   ├── userValidator.js            # User CRUD validators
│   │   │   ├── teamValidator.js            # Team validators
│   │   │   ├── documentValidator.js        # Document validators
│   │   │   ├── taskValidator.js            # Task status & priority validators
│   │   │   └── workflowValidator.js        # Workflow step validators
│   │   ├── app.js                          # Express application assembly
│   │   └── server.js                       # HTTP server entry point
│   ├── test/
│   │   ├── verify-phase3.js                # Phase 3 database regression suite
│   │   └── verify-phase4.js                # Phase 4 authentication suite
│   ├── Dockerfile                          # Production container specification
│   └── package.json                        # Backend dependencies & test scripts
│
├── PHASE_1_ARCHITECTURE.md                 # Master architecture blueprint
└── README.md                               # Project documentation
```

---

## 📡 Complete API Reference

### 🔐 Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Auth | Description | Request Body |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/api/auth/register` | ❌ | Register a new user | `{ "name": "...", "email": "...", "password": "..." }` |
| `POST` | `/api/auth/login` | ❌ | Authenticate & acquire JWT | `{ "email": "...", "password": "..." }` |

### 👤 User & Profile Endpoints (`/api/users`)

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :---: | :---: | :--- |
| `GET` | `/api/users/profile` | 🔒 Bearer | Any | Retrieve authenticated user profile |
| `PUT` | `/api/users/profile` | 🔒 Bearer | Any | Update profile details (e.g. `name`) |
| `GET` | `/api/users/admin/overview` | 🔒 Bearer | `admin` | Admin verification test route |
| `GET` | `/api/users` | ❌ | Any | List users (supports `?role=...&team=...`) |
| `GET` | `/api/users/:id` | ❌ | Any | Retrieve user by ID |
| `PUT` | `/api/users/:id` | ❌ | Any | Update user record |
| `DELETE` | `/api/users/:id` | ❌ | Any | Delete user record |

### 📁 Core Resource Endpoints

| Resource | Endpoints | Capabilities |
| :--- | :--- | :--- |
| **Teams** | `GET/POST /api/teams`, `GET/PUT/DELETE /api/teams/:id` | Org hierarchy & team assignments |
| **Documents** | `GET/POST /api/documents`, `GET/PUT/DELETE /api/documents/:id` | Markdown docs, tags & visibility flags |
| **Tasks** | `GET/POST /api/tasks`, `GET/PUT/DELETE /api/tasks/:id` | State-machine (`todo`, `in-progress`, `review`, `done`) |
| **Workflows** | `GET/POST /api/workflows`, `POST/GET/PUT /api/workflows/:id/steps` | Multi-step trigger & step ordering |
| **Audit Logs** | `GET /api/audit-logs`, `GET /api/audit-logs/:id` | Immutable chronological activity logs |
| **Health** | `GET /api/health`, `GET /api/health/db` | API and MongoDB live connectivity checks |

---

## 🚀 Quickstart: Installation & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local daemon running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI
- **npm** or **yarn**

---

### 1. Backend Server Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create .env configuration file
# Ensure MONGODB_URI and JWT_SECRET are defined
```

Example `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ai_productivity_platform
JWT_SECRET=dev_jwt_secret_key_productivity_2026
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

```bash
# 4. Start backend in development mode
npm run dev

# 5. Run the automated test suite
npm run test:phase4
```

---

### 2. Frontend Client Setup

```bash
# 1. Navigate to frontend directory in a new terminal
cd frontend

# 2. Install dependencies
npm install

# 3. Configure frontend .env
```

Example `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```

```bash
# 4. Start the Vite development server
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🧪 Automated Verification Suite

The repository includes standalone, zero-dependency in-memory test suites using `mongodb-memory-server` to validate backend logic without requiring a running local MongoDB instance.

```bash
# Run Phase 4 Authentication Suite (35 tests)
npm run test:phase4 --prefix backend

# Run Phase 3 Resource & Database Suite (29 tests)
npm run test:phase3 --prefix backend

# Build and typecheck Frontend
npm run build --prefix frontend
```

### ✅ Test Coverage Matrix

```text
======================================================
📊 TOTAL AUTOMATED TEST SUITE: 64 PASSED, 0 FAILED
======================================================
  ✓ User Registration with Password Hashing (201)
  ✓ Duplicate Email Prevention & Normalization (400)
  ✓ Input Field & Email Format Validation (400)
  ✓ User Login with Bcrypt Password Comparison (200)
  ✓ Invalid Password / Non-Existent User Rejection (401)
  ✓ Bearer JWT Verification & req.user Context Extraction
  ✓ Protected Profile Access (200) & Unauthorized Block (401)
  ✓ Malformed / Expired Token Rejection (401)
  ✓ Safe Profile Update & Privilege Escalation Prevention
  ✓ Role-Based Authorization Guards (403 Forbidden)
  ✓ Mongoose 7-Model Relations & Audit Log Recording
  ✓ Centralized Error Handling & CastError Formatters
```

---

## 💡 Engineering Trade-Offs & Decisions

| Decision | Pros | Cons | Alternative Considered |
| :--- | :--- | :--- | :--- |
| **MongoDB + Mongoose** | Flexible JSON-native document modeling, dynamic workflow step arrays, fast prototyping. | Requires application-level relational consistency checks. | PostgreSQL / Prisma |
| **Stateless JWT Tokens** | Zero database lookup overhead per authenticated API request; horizontal scalability. | Revocation before expiry requires token blacklisting or short expiration windows. | Stateful Redis Sessions |
| **Bcrypt Pre-Save Hook** | Guarantees all passwords created or modified are cryptographically hashed before persistence. | Slight compute cost during batch seeds; must guard against double-hashing on update. | Manual Controller Hashing |
| **Layered Service Pattern** | Clear separation of HTTP logic from database transactions; highly reusable across tests. | Slightly more boilerplate files per domain module. | Monolithic Controllers |

---

## 🗺️ Project Roadmap

- [x] **Phase 1 — Master Architecture & Schema Modeling**
- [x] **Phase 2 — UI Foundation & Health Handshake**
- [x] **Phase 3 — MongoDB Migration, Layered CRUD & Audit Logs**
- [x] **Phase 4 — Production Authentication & Role-Based Access Control (RBAC)**
- [ ] **Phase 5 — Core Product Modules** (Interactive Documents, Kanban Task Board, Autonomous Workflows)
- [ ] **Phase 6 — AI Service Integrations** (Summarizers, Priority Matrix, Smart Document Autocomplete)
- [ ] **Phase 7 — Real-Time Collaboration & Analytics** (WebSockets, Productivity Heatmaps)
- [ ] **Phase 8 — Production Deployment** (Docker, Render, Vercel & CI/CD Pipeline)

---

## 🤝 Contribution & License

Contributions are welcome! Please feel free to open an issue or submit a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

**License**: Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">
  <sub>Engineered with precision for the AI Productivity Platform © 2026</sub>
</div>
