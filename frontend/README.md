# Frontend Web Client — AI Productivity Platform ⚡

Modern, reactive single-page client built with **React 19**, **Vite**, and **Tailwind CSS**.

---

## 🏗️ Architecture & Modules

The frontend follows a domain-driven, component-based layout:

```text
frontend/
├── public/                 # Static public assets
│   └── favicon.svg         # Application brand icon
├── src/
│   ├── components/         # Reusable presentation & layout components
│   │   ├── ui/             # Design-system primitives (Badge, Button, Card)
│   │   ├── Navbar.jsx      # Global navigation header & user status
│   │   └── ProtectedRoute.jsx # Route-guard requiring authentication
│   ├── context/            # React Context providers
│   │   └── AuthContext.jsx # Global JWT session & user state
│   ├── layouts/            # Application layout wrappers
│   │   └── RootLayout.jsx  # Main shell with navigation & notifications
│   ├── lib/                # Shared utilities
│   │   └── utils.js        # Class name merger (clsx + tailwind-merge)
│   ├── pages/              # Routed feature views
│   │   ├── HomePage.jsx    # Landing page & live diagnostics health hub
│   │   ├── Login.jsx       # User authentication & token storage
│   │   ├── Signup.jsx      # New account registration
│   │   ├── Dashboard.jsx   # Metrics, activity overview & quick navigation
│   │   ├── Documents.jsx   # Document editor, markdown viewer & attachments
│   │   ├── Tasks.jsx       # Sprint task management (Kanban & list views)
│   │   ├── Workflows.jsx   # Automation state machine workflow manager
│   │   ├── AIAssistant.jsx # AI assistant (chat, summarizer, task generator)
│   │   └── Profile.jsx     # User settings & session management
│   ├── services/           # Backend API integration layer
│   │   ├── api.js          # Unified Axios-like Fetch wrapper & endpoints
│   │   └── authService.js  # Token management & credential caching
│   ├── App.jsx             # Main router declaration
│   ├── index.css           # Tailwind design tokens & dark-theme base styles
│   └── main.jsx            # React root DOM mount
├── .env.example            # Environment configuration template
├── package.json            # Client dependencies & scripts
├── tailwind.config.js      # Tailwind CSS theme configuration
└── vite.config.js          # Vite build & proxy configuration
```

---

## 🚀 Getting Started

### 1. Configure Environment
Create a `.env` file from the example:
```bash
cp .env.example .env
```
Default content:
```env
VITE_API_URL=http://localhost:5000
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Launches development server on `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```

### 5. Linting
```bash
npm run lint
```
Runs high-performance Oxlint rules across the codebase.
