# PHASE 1 — PLANNING & ARCHITECTURE DOCUMENT
**Project Name:** AI Productivity Platform (SmartTask AI / FocusFlow)  
**Author:** Lead Software Architect  
**Status:** Completed & Approved for Implementation  
**Target Stack:** React (Vite, Tailwind CSS, shadcn/ui) | Node.js + Express.js | MySQL | JWT Authentication  

---

## 1. PROBLEM STATEMENT

### 1.1 Real-World Problem
In today's high-velocity digital work environment, knowledge workers, developers, students, and freelancers suffer from **cognitive overload and task fragmentation**. Individuals routinely capture large, vague tasks (e.g., "Build user authentication" or "Write research paper"), which causes decision paralysis, procrastination, and inaccurate time estimation.

Furthermore, people juggle separate disjointed tools:
- One app for simple to-do lists (static, dumb checklists).
- Another app for timers / Pomodoro tracking.
- Another app for notes and meeting summaries.
- Spreadsheets or clunky enterprise trackers (Jira/Asana) that create high administrative overhead.

### 1.2 Who Faces This Problem?
1. **Software Developers & Tech Professionals:** Need to break down technical requirements into actionable coding subtasks, track focus hours, and manage daily sprints without bureaucratic bloat.
2. **Students & Researchers:** Need assistance prioritizing assignments, summarizing lecture notes into actionable revision tasks, and scheduling study blocks.
3. **Freelancers & Solo Entrepreneurs:** Need an all-in-one hub to manage multiple client projects, prioritize today's critical actions, and track productivity without paying enterprise SaaS subscriptions.
4. **Small Agile Teams:** Need lightweight project collaboration with clear task ownership, deadlines, and smart priority management.

### 1.3 Why the Existing Approach is Inefficient
- **Manual Task Breakdown Overhead:** Breaking down complex projects takes time and mental energy; users often skip it and end up with vague, overwhelming to-do lists.
- **Static Prioritization:** Traditional to-do apps do not adapt to deadlines, workload intensity, or estimated effort.
- **Fragmented Context:** Switching between note-taking apps, task boards, and focus timers wastes up to 20–30 minutes daily in context switching.
- **Over-Engineered Solutions:** Enterprise platforms (Jira, ClickUp) are too complex for individuals and small teams, requiring extensive configuration.

### 1.4 Our Proposed Solution: AI Productivity Platform
A fast, lightweight, and modern full-stack web application combining:
1. **Intelligent Task & Project Hub:** Interactive Kanban and List views to organize work across customizable projects and priority levels.
2. **AI-Assisted Task Breakdown & Planning:** An integrated AI helper that transforms vague, high-level tasks into structured subtasks with estimated time durations, and auto-generates daily priority schedules.
3. **Smart Note & Meeting Summarizer:** Converts unstructured notes into structured tasks and action items with one click.
4. **Focus Timer & Productivity Tracking:** Built-in Pomodoro/Focus session logger tied directly to specific tasks.
5. **Actionable Analytics Dashboard:** Visual metrics tracking completed tasks, focus hours, completion rates, and weekly productivity streaks.

---

## 2. TARGET USERS

| User Type | Profile & Goals | Key Capabilities |
| :--- | :--- | :--- |
| **Individual Professional / Student** | Manages personal daily tasks, study sessions, or freelance projects. Wants fast capture and AI assistance. | • Create and manage personal projects and tasks.<br>• Use AI to break down tasks and summarize notes.<br>• Log focus sessions via Pomodoro timer.<br>• View personal productivity metrics and streaks. |
| **Project Lead / Team Member** | Collaborates on shared project boards with teammates or classmates. | • Create shared projects and invite members.<br>• Assign tasks to team members with due dates and priorities.<br>• Comment on tasks and monitor project completion progress. |
| **System Administrator** | Platform operator overseeing system health, user accounts, and AI quota utilization. | • View global system metrics (total users, active tasks, AI requests).<br>• Manage user statuses (active, suspended).<br>• Monitor system logs and database health. |

---

## 3. USER ROLES & PERMISSIONS

### 3.1 Global System Roles

| Role | Permissions | Main Responsibilities |
| :--- | :--- | :--- |
| `admin` | • View admin analytics & system health.<br>• View all registered users and toggle account status.<br>• View AI usage logs and system metrics.<br>• Perform all standard `user` operations. | Maintain system integrity, monitor API/AI usage limits, and moderate users. |
| `user` | • Register, login, manage personal profile.<br>• Full CRUD on personal projects, tasks, subtasks, tags, focus sessions.<br>• Trigger AI features within standard quota.<br>• Join and collaborate on shared projects where invited. | Standard user organizing their workflow and utilizing productivity tools. |

### 3.2 Project-Level Roles (Scoped Access Control)

| Project Role | Permissions |
| :--- | :--- |
| **Project Owner / Admin** | Full control over project: update project details, delete project, manage members, create/edit/delete any task in the project. |
| **Project Member** | Create tasks, edit assigned tasks, update task status, add subtasks, log focus time on tasks. |
| **Project Viewer** | Read-only access to view project boards, tasks, and progress. |

---

## 4. COMPLETE FEATURE LIST

### 4.1 Authentication & Profile
- **User Registration:** Email, full name, and secure password registration with validation.
- **User Login:** Authenticate using email and password, issuing a signed JSON Web Token (JWT).
- **Session Persistence:** Auto-login verification on client initialization via JWT validation endpoint.
- **User Profile Management:** Update name, avatar URL, bio, and daily productivity goal (hours/tasks).
- **Password Management:** Update existing password with current password verification.
- **Logout:** Secure client-side token invalidation and state reset.

### 4.2 Core Application Features
- **Projects & Workspaces:**
  - Create, view, update, archive, and delete projects.
  - Custom project color codes and descriptions.
  - Project member invitation via email with role assignment (`admin`, `member`, `viewer`).
- **Task Management (CRUD):**
  - Create tasks with title, description, priority (`low`, `medium`, `high`, `urgent`), status (`todo`, `in_progress`, `review`, `completed`), due date, and estimated duration in minutes.
  - Drag-and-drop or click-to-move status updates (Kanban and List views).
  - Assign tasks to self or project members.
  - Delete and soft-archive tasks.
- **Subtasks & Checklists:**
  - Add, toggle completion, and delete granular checklist subtasks under any parent task.
  - Progress indicator displaying completion percentage (e.g., `3/5 subtasks completed - 60%`).
- **Tags & Categories:**
  - Create color-coded tags (e.g., `#Frontend`, `#Bug`, `#Research`, `#Urgent`).
  - Multi-tag assignment per task.
- **Focus Timer (Integrated Pomodoro / Work Session):**
  - Start, pause, reset focus timer (25 min standard / custom intervals).
  - Associate focus session with a specific task.
  - Automatically log completed focus minutes to the database upon completion.

### 4.3 AI Productivity Features
- **AI Task Breakdown:**
  - Input: High-level task title and description.
  - Output: 3–7 actionable subtasks with individual estimated completion times and a recommended execution sequence.
  - User can click "Add All to Task Checklist" to automatically populate the task's subtasks in MySQL.
- **AI Daily Focus Planner:**
  - Analyzes current pending tasks, deadlines, and user's daily goal.
  - Generates a recommended "Today's Top 3 Priority Plan" with time blocks.
- **AI Notes to Action Items Summarizer:**
  - Input: Raw meeting or brainstorm notes.
  - Output: Clean executive summary + structured list of action items with suggested deadlines and priorities.

### 4.4 Dashboard & Analytics Features
- **Quick Metric Cards:**
  - Tasks Completed Today / This Week.
  - Total Focus Minutes Logged Today.
  - Active Projects Overview.
  - Current Daily Goal Progress Bar.
- **Visual Analytics:**
  - 7-day productivity completion chart (tasks done per day).
  - Task distribution by priority and status (pie/bar breakdown).
  - Productivity streak counter (consecutive active days).
- **Upcoming & Overdue Widget:**
  - Filtered quick-access list of overdue tasks and tasks due in the next 24 hours.

### 4.5 Search, Filter, and Sort Features
- **Global Search:** Keyword search across task titles, descriptions, and project names.
- **Multi-Criteria Filtering:**
  - Filter by Project, Status, Priority, Due Date range (Overdue, Today, This Week, Later), Assigned User, and Tags.
- **Flexible Sorting:** Sort by Due Date (ascending/descending), Priority (urgent to low), Creation Date, or Alphabetical.

### 4.6 Notifications Features
- **In-App Notification Center:**
  - Notifications for overdue tasks, task assignment, project invitation, and daily goal achievement.
  - Mark notification as read / mark all as read.

### 4.7 Admin Features
- **System Overview Dashboard:** Total user count, total tasks created, total focus hours logged, total AI queries executed.
- **User Management Table:** List users, search users by email/name, toggle user active/suspended status.
- **Activity & System Health Log:** Recent system actions and API health status.

---

## 5. APPLICATION FLOW

```
[ Visitor / User ]
       │
       ▼
1. Landing Page (Features Overview, Live Demo Preview, Value Proposition)
       │
       ├──► Not Logged In ──► [ Register / Login Page ]
       │                               │
       │                               ▼
       │                    [ POST /api/auth/login ]
       │                               │
       │                   (Validate Credentials + Sign JWT)
       │                               │
       ▼                               ▼
2. Authenticated Session ◄─────────────┘
       │
       ▼
3. App Dashboard (`/dashboard`)
       ├── Metric Cards (Today's Tasks, Focus Hours, Streak)
       ├── AI Daily Plan Widget
       ├── Upcoming / Overdue Tasks List
       └── Quick Actions (+ New Task, + Start Focus Session, + Ask AI)
       │
       ├──► [ Projects View (`/projects`) ]
       │        └── Create Project ──► View Project Board (Kanban / List)
       │                 └── Create / Edit / Move Tasks
       │                 └── Assign Subtasks / Checklists
       │
       ├──► [ AI Assistant Hub (`/ai-assistant`) ]
       │        ├── Break Down Complex Task ──► Save Subtasks to Task
       │        ├── Generate Daily Focus Plan
       │        └── Summarize Notes into Action Items
       │
       ├──► [ Focus Timer (`/focus`) ]
       │        └── Select Task ──► Run Pomodoro ──► Log Session to DB
       │
       ├──► [ Analytics (`/analytics`) ]
       │        └── Weekly charts, completion trends, project velocity
       │
       ├──► [ Profile & Settings (`/settings`) ]
       │        └── Edit profile, update daily goal, change password
       │
       └──► [ Admin Portal (`/admin`) ] *(Admin role only)*
                └── User management, platform metrics, system logs
       │
       ▼
4. User Logout ──► Clear JWT Token ──► Redirect to Login Page
```

---

## 6. FRONTEND ARCHITECTURE

### 6.1 Framework & Core Tooling
- **Framework:** React 18+ with Vite for ultra-fast development and optimized production bundling.
- **Language:** JavaScript (ES6+) with clean component modularity.
- **Styling:** Tailwind CSS for responsive utility styling paired with CSS custom variables for dark/light themes.
- **UI Component Primitives:** shadcn/ui (Radix UI primitives styled with Tailwind) for accessible, production-grade modals, dropdowns, buttons, inputs, tabs, and tables.
- **Icons:** `lucide-react` for clean, consistent iconography.
- **Routing:** `react-router-dom` (v6+) with structured layout wrappers and route guards.

### 6.2 Main Pages & View Hierarchy
1. `LandingPage.jsx` (`/`): Public showcase, features breakdown, interactive CTA.
2. `LoginPage.jsx` (`/login`): Clean authentication form with validation and demo login credentials helper.
3. `RegisterPage.jsx` (`/register`): User onboarding form.
4. `DashboardPage.jsx` (`/dashboard`): Primary user hub with summary metrics, AI recommendations, and quick tasks.
5. `ProjectsPage.jsx` (`/projects`): Grid of all user projects with progress bars, filters, and creation modal.
6. `ProjectDetailPage.jsx` (`/projects/:id`): Kanban Board & List view toggle for tasks within a specific project.
7. `TasksPage.jsx` (`/tasks`): Global task manager with comprehensive filters (due date, priority, project, tags).
8. `AiAssistantPage.jsx` (`/ai-assistant`): Dedicated workspace for AI task breakdown, daily planning, and note summarization.
9. `FocusTimerPage.jsx` (`/focus`): Interactive visual Pomodoro timer with task selector and session history.
10. `AnalyticsPage.jsx` (`/analytics`): Charts and productivity streak metrics.
11. `ProfilePage.jsx` (`/settings`): Profile customization, daily goals, security/password update.
12. `AdminDashboardPage.jsx` (`/admin`): Restricted admin metrics and user management table.
13. `NotFoundPage.jsx` (`*`): Friendly 404 error page with redirect to dashboard.

### 6.3 Reusable Component Library
- **Layout Components:**
  - `AppLayout`: Main authenticated wrapper containing Sidebar, Header/Navbar, and breadcrumbs.
  - `Sidebar`: Collapsible navigation with active route highlights, project shortcuts, and user profile snippet.
  - `Navbar`: Search bar, notification bell with unread badge, theme toggle, and user avatar dropdown.
  - `AdminLayout`: Specialized layout for platform administrators.
- **UI Primitives (shadcn/ui style):**
  - `Button`, `Input`, `Textarea`, `Select`, `Dialog`/`Modal`, `DropdownMenu`, `Card`, `Badge`, `Tabs`, `Progress`, `Skeleton`, `Toast`.
- **Domain-Specific Components:**
  - `TaskCard`: Interactive Kanban card with priority badge, due date, subtask progress, and quick action menu.
  - `TaskDetailModal`: Modal for editing full task details, managing subtasks, assigning tags, and triggering AI breakdown.
  - `TaskTable`: Sortable and filterable data table for List view.
  - `PriorityBadge`: Visual color-coded badge (`Urgent` = Red, `High` = Orange, `Medium` = Yellow, `Low` = Blue/Gray).
  - `StatusPill`: Visual indicator for task lifecycle (`Todo`, `In Progress`, `Review`, `Completed`).
  - `AiBreakdownWidget`: Modal / inline panel displaying generated subtasks with "Add to Checklist" button.
  - `PomodoroWidget`: Circular progress timer with Start/Pause/Reset controls and audio chime.
  - `MetricCard`: KPI card displaying icon, value, change indicator, and label.

### 6.4 Routing & Route Protection Strategy
- **Public Routes:** Accessible by anyone (e.g., `/`, `/login`, `/register`). If already authenticated, automatically redirects to `/dashboard`.
- **Protected Routes:** Requires valid JWT. Wrapped in `<ProtectedRoute>` component; redirects unauthenticated visitors to `/login`.
- **Admin Routes:** Requires valid JWT and `role === 'admin'`. Wrapped in `<AdminRoute>` component; redirects non-admin users to `/dashboard` with an access alert.

### 6.5 State Management & API Layer
- **Auth State:** React Context (`AuthContext`) providing `user`, `token`, `login()`, `logout()`, `updateUser()`, and `isAuthenticated`.
- **UI State:** React Context (`ThemeContext`, `NotificationContext`) for dark/light mode and toast notifications.
- **Server State & Data Fetching:** Centralized Axios instance with reusable custom hooks (e.g., `useTasks`, `useProjects`, `useAnalytics`) ensuring easy caching, loading states, and error handling.
- **API Client Architecture:**
  - Base URL configured from `import.meta.env.VITE_API_BASE_URL`.
  - Request Interceptor: Automatically attaches `Authorization: Bearer <token>` from storage.
  - Response Interceptor: Catches `401 Unauthorized` responses, clears invalid tokens, and cleanly redirects to `/login`.

---

## 7. BACKEND ARCHITECTURE

### 7.1 Server Architecture Overview
The backend follows a **Modular Layered Architecture** built on Express.js and Node.js. It enforces a strict separation of concerns between HTTP handling, business logic, validation, and database operations.

```
Incoming Request
       │
       ▼
1. Global Middleware (CORS, Helmet, Rate Limiter, Express JSON Body Parser)
       │
       ▼
2. Route Layer (`routes/*.js`) ──► Validates route paths & mounts middleware
       │
       ▼
3. Validation & Auth Middleware (`middleware/auth.js`, `middleware/validate.js`)
       │
       ▼
4. Controller Layer (`controllers/*.js`) ──► Parses request, validates input, sets HTTP status
       │
       ▼
5. Service Layer (`services/*.js`) ──► Core business logic & external AI APIs
       │
       ▼
6. Database Layer (`config/db.js` + MySQL Connection Pool) ──► Parameterized SQL execution
       │
       ▼
HTTP Response (Standard JSON Format)
```

### 7.2 Layer Responsibilities

1. **Config Layer (`src/config/`):**
   - `db.js`: Initializes MySQL connection pool using `mysql2/promise` with environment variables.
   - `env.js`: Validates and exports all required environment variables.
2. **Routes Layer (`src/routes/`):**
   - Maps HTTP endpoints to specific controller methods.
   - Attaches relevant middleware (e.g., `verifyToken`, `requireAdmin`, `validateTaskInput`).
3. **Middleware Layer (`src/middleware/`):**
   - `authMiddleware.js`: Decodes and verifies incoming JWT bearer tokens; attaches `req.user`.
   - `roleMiddleware.js`: Enforces role-based permissions (`admin`, project owner).
   - `validateMiddleware.js`: Validates request bodies, parameters, and query strings.
   - `errorMiddleware.js`: Central error interceptor that converts uncaught exceptions into clean JSON responses.
   - `rateLimiter.js`: Protects authentication and AI routes against abuse.
4. **Controllers Layer (`src/controllers/`):**
   - Extracts data from `req.body`, `req.params`, and `req.query`.
   - Calls the corresponding Service functions.
   - Returns structured HTTP responses (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`).
5. **Services Layer (`src/services/`):**
   - Implements business logic (e.g., calculating productivity score, assembling complex project data, formatting AI prompt templates, making external AI API calls).
6. **Database Connection Layer (`src/config/db.js`):**
   - Manages a pool of connections for performance.
   - Executes strictly parameterized SQL queries to guarantee SQL injection prevention.

### 7.3 Standardized API Response Format
All backend endpoints return a consistent JSON response structure:

```json
// Success Response:
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": [ ... ],
  "meta": { "total": 12, "page": 1 } // optional pagination metadata
}

// Error Response:
{
  "success": false,
  "message": "Validation failed / Resource not found / Unauthorized",
  "errors": [ "Due date cannot be in the past" ] // optional array of details
}
```

---

## 8. MYSQL DATABASE DESIGN

### 8.1 Database Relationship Overview
The database uses a clean, normalized relational model:
- **One-to-Many (`1:N`):**
  - A `User` has many `Projects`.
  - A `Project` has many `Tasks`.
  - A `User` has many `Tasks` (as creator/assignee).
  - A `Task` has many `Subtasks`.
  - A `Task` has many `FocusSessions`.
  - A `User` has many `FocusSessions`.
  - A `User` has many `Notifications`.
  - A `User` has many `AiLogs`.
- **Many-to-Many (`M:N`):**
  - `Projects` and `Users` via `project_members` junction table (enables shared collaboration).
  - `Tasks` and `Tags` via `task_tags` junction table (tasks can have multiple tags; tags can be on multiple tasks).

---

### 8.2 Detailed Table Schemas

#### 1. `users` Table
Stores registered user accounts and global platform roles.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `AUTO_INCREMENT, PRIMARY KEY` | Unique user ID |
| `email` | `VARCHAR(255)` | `NOT NULL, UNIQUE` | User email address (login credential) |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | bcrypt hashed password |
| `full_name` | `VARCHAR(100)` | `NOT NULL` | User full name |
| `avatar_url` | `VARCHAR(500)` | `NULL` | Profile picture URL |
| `bio` | `TEXT` | `NULL` | Short user bio |
| `role` | `ENUM('user', 'admin')` | `NOT NULL DEFAULT 'user'` | System role |
| `daily_goal_hours` | `DECIMAL(3,1)` | `NOT NULL DEFAULT 4.0` | Target daily focus hours |
| `is_active` | `TINYINT(1)` | `NOT NULL DEFAULT 1` | 1 = active, 0 = suspended |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Account creation timestamp |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` | Last updated timestamp |

---

#### 2. `projects` Table
Stores workspaces/projects used to group tasks.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `AUTO_INCREMENT, PRIMARY KEY` | Unique project ID |
| `user_id` | `INT UNSIGNED` | `NOT NULL, FOREIGN KEY -> users(id) ON DELETE CASCADE` | Creator/Owner ID |
| `title` | `VARCHAR(150)` | `NOT NULL` | Project name |
| `description` | `TEXT` | `NULL` | Project description |
| `color` | `VARCHAR(20)` | `NOT NULL DEFAULT '#6366F1'` | Hex color code for UI badges |
| `is_archived` | `TINYINT(1)` | `NOT NULL DEFAULT 0` | 1 = archived, 0 = active |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Creation timestamp |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` | Last updated timestamp |

---

#### 3. `project_members` Table (Junction: Users ↔ Projects)
Enables team collaboration on projects with role-based access.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `AUTO_INCREMENT, PRIMARY KEY` | Unique record ID |
| `project_id` | `INT UNSIGNED` | `NOT NULL, FOREIGN KEY -> projects(id) ON DELETE CASCADE` | Associated project ID |
| `user_id` | `INT UNSIGNED` | `NOT NULL, FOREIGN KEY -> users(id) ON DELETE CASCADE` | Member user ID |
| `project_role`| `ENUM('owner', 'member', 'viewer')` | `NOT NULL DEFAULT 'member'` | Access level in project |
| `joined_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Join timestamp |
| *Index* | `UNIQUE KEY` | `(project_id, user_id)` | Prevents duplicate memberships |

---

#### 4. `tasks` Table
Core entity representing work items.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `AUTO_INCREMENT, PRIMARY KEY` | Unique task ID |
| `project_id` | `INT UNSIGNED` | `NOT NULL, FOREIGN KEY -> projects(id) ON DELETE CASCADE` | Associated project ID |
| `user_id` | `INT UNSIGNED` | `NOT NULL, FOREIGN KEY -> users(id) ON DELETE CASCADE` | Creator user ID |
| `assigned_to`| `INT UNSIGNED` | `NULL, FOREIGN KEY -> users(id) ON DELETE SET NULL` | Assigned user ID |
| `title` | `VARCHAR(255)` | `NOT NULL` | Task title |
| `description`| `TEXT` | `NULL` | Detailed task description |
| `status` | `ENUM('todo', 'in_progress', 'review', 'completed')` | `NOT NULL DEFAULT 'todo'` | Current task status |
| `priority` | `ENUM('low', 'medium', 'high', 'urgent')` | `NOT NULL DEFAULT 'medium'` | Urgency/priority level |
| `due_date` | `DATETIME` | `NULL` | Target deadline |
| `estimated_minutes` | `INT UNSIGNED` | `DEFAULT 0` | Estimated duration |
| `actual_minutes` | `INT UNSIGNED` | `DEFAULT 0` | Total focus time logged |
| `position` | `INT` | `DEFAULT 0` | Sort order inside column |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Creation timestamp |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` | Last updated timestamp |

---

#### 5. `subtasks` Table
Granular checklist items belonging to a parent task.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `AUTO_INCREMENT, PRIMARY KEY` | Unique subtask ID |
| `task_id` | `INT UNSIGNED` | `NOT NULL, FOREIGN KEY -> tasks(id) ON DELETE CASCADE` | Parent task ID |
| `title` | `VARCHAR(255)` | `NOT NULL` | Checklist item text |
| `is_completed`| `TINYINT(1)` | `NOT NULL DEFAULT 0` | 1 = completed, 0 = pending |
| `estimated_minutes` | `INT UNSIGNED` | `DEFAULT 15` | AI or user estimated time |
| `sort_order` | `INT` | `DEFAULT 0` | Display order |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Creation timestamp |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` | Last updated timestamp |

---

#### 6. `tags` Table
Custom labels for classifying tasks.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `AUTO_INCREMENT, PRIMARY KEY` | Unique tag ID |
| `user_id` | `INT UNSIGNED` | `NOT NULL, FOREIGN KEY -> users(id) ON DELETE CASCADE` | Tag owner ID |
| `name` | `VARCHAR(50)` | `NOT NULL` | Tag label (e.g., "Bug", "Design") |
| `color` | `VARCHAR(20)` | `NOT NULL DEFAULT '#3B82F6'` | Badge hex color |
| *Index* | `UNIQUE KEY` | `(user_id, name)` | Prevents duplicate tags per user |

---

#### 7. `task_tags` Table (Junction: Tasks ↔ Tags)
Associates tasks with multiple tags.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `task_id` | `INT UNSIGNED` | `NOT NULL, FOREIGN KEY -> tasks(id) ON DELETE CASCADE` | Associated task |
| `tag_id` | `INT UNSIGNED` | `NOT NULL, FOREIGN KEY -> tags(id) ON DELETE CASCADE` | Associated tag |
| *Index* | `PRIMARY KEY` | `(task_id, tag_id)` | Composite primary key |

---

#### 8. `focus_sessions` Table
Logs Pomodoro and focus timer work blocks.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `AUTO_INCREMENT, PRIMARY KEY` | Unique session ID |
| `user_id` | `INT UNSIGNED` | `NOT NULL, FOREIGN KEY -> users(id) ON DELETE CASCADE` | User who logged session |
| `task_id` | `INT UNSIGNED` | `NULL, FOREIGN KEY -> tasks(id) ON DELETE SET NULL` | Linked task (optional) |
| `duration_minutes` | `INT UNSIGNED` | `NOT NULL` | Total focused minutes |
| `completed_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Timestamp session finished |
| `notes` | `VARCHAR(255)` | `NULL` | Optional quick session reflection |

---

#### 9. `ai_logs` Table
Tracks AI interactions, token usage, and prompt history for analytics and quotas.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `AUTO_INCREMENT, PRIMARY KEY` | Unique log ID |
| `user_id` | `INT UNSIGNED` | `NOT NULL, FOREIGN KEY -> users(id) ON DELETE CASCADE` | Requesting user |
| `prompt_type`| `ENUM('breakdown', 'daily_plan', 'summarize')` | `NOT NULL` | Feature used |
| `input_prompt`| `TEXT` | `NOT NULL` | User input sent to AI |
| `output_result` | `TEXT` | `NOT NULL` | AI structured response |
| `tokens_used`| `INT UNSIGNED` | `DEFAULT 0` | Token cost count |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Execution timestamp |

---

#### 10. `notifications` Table
In-app alerts and reminders.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `AUTO_INCREMENT, PRIMARY KEY` | Unique notification ID |
| `user_id` | `INT UNSIGNED` | `NOT NULL, FOREIGN KEY -> users(id) ON DELETE CASCADE` | Recipient user |
| `title` | `VARCHAR(150)` | `NOT NULL` | Notification title |
| `message` | `TEXT` | `NOT NULL` | Notification body |
| `type` | `ENUM('info', 'warning', 'success', 'reminder')` | `NOT NULL DEFAULT 'info'` | Alert level |
| `is_read` | `TINYINT(1)` | `NOT NULL DEFAULT 0` | 1 = read, 0 = unread |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Timestamp triggered |

---

## 9. API STRUCTURE (RESTful Specification)

### 9.1 Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Purpose | Auth Req? | Request Data | Response Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account | No | `{ email, password, full_name }` | Returns user info + JWT token |
| `POST` | `/api/auth/login` | Authenticate user | No | `{ email, password }` | Returns user profile + JWT token |
| `GET` | `/api/auth/me` | Fetch currently logged-in user | Yes | Header: `Bearer <token>` | Returns current authenticated user data |
| `POST` | `/api/auth/logout` | Client session sign-out | Yes | Header: `Bearer <token>` | Confirms session termination |

---

### 9.2 User & Profile Endpoints (`/api/users`)

| Method | Endpoint | Purpose | Auth Req? | Request Data | Response Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/users/profile` | Get user profile & goals | Yes | None | Profile object with daily goals |
| `PUT` | `/api/users/profile` | Update profile info & goal | Yes | `{ full_name, bio, avatar_url, daily_goal_hours }` | Updated profile object |
| `PUT` | `/api/users/change-password` | Update account password | Yes | `{ current_password, new_password }` | Success confirmation message |

---

### 9.3 Projects Endpoints (`/api/projects`)

| Method | Endpoint | Purpose | Auth Req? | Request Data | Response Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/projects` | List all accessible projects | Yes | Query: `?archived=false` | Array of projects with task counts |
| `POST` | `/api/projects` | Create a new project | Yes | `{ title, description, color }` | Created project object |
| `GET` | `/api/projects/:id` | Get project details & members | Yes | URL Param: `id` | Single project object with members list |
| `PUT` | `/api/projects/:id` | Update project details | Yes | `{ title, description, color, is_archived }` | Updated project object |
| `DELETE` | `/api/projects/:id` | Delete project | Yes | URL Param: `id` | Deletion confirmation message |
| `POST` | `/api/projects/:id/members` | Invite member to project | Yes | `{ email, role }` | Added member object |
| `DELETE` | `/api/projects/:id/members/:userId` | Remove member from project | Yes | URL Params: `id, userId` | Removal confirmation message |

---

### 9.4 Tasks Endpoints (`/api/tasks`)

| Method | Endpoint | Purpose | Auth Req? | Request Data | Response Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks` | Get filtered & sorted tasks | Yes | Query: `?project_id=&status=&priority=&due=&search=&tag_id=` | Array of tasks with subtasks count and tags |
| `POST` | `/api/tasks` | Create a new task | Yes | `{ project_id, title, description, priority, due_date, estimated_minutes, assigned_to, tag_ids }` | Created task object |
| `GET` | `/api/tasks/:id` | Get single task details | Yes | URL Param: `id` | Task object with subtasks, tags, focus history |
| `PUT` | `/api/tasks/:id` | Update full task details | Yes | `{ title, description, status, priority, due_date, estimated_minutes, assigned_to, tag_ids }` | Updated task object |
| `PATCH` | `/api/tasks/:id/status` | Quick status change (Kanban move) | Yes | `{ status, position }` | Updated status confirmation |
| `DELETE` | `/api/tasks/:id` | Delete task | Yes | URL Param: `id` | Deletion confirmation |

---

### 9.5 Subtasks Endpoints (`/api/tasks/:taskId/subtasks`)

| Method | Endpoint | Purpose | Auth Req? | Request Data | Response Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/tasks/:taskId/subtasks` | Add single subtask | Yes | `{ title, estimated_minutes }` | Created subtask object |
| `POST` | `/api/tasks/:taskId/subtasks/bulk` | Bulk insert (e.g. from AI) | Yes | `{ subtasks: [ { title, estimated_minutes } ] }` | Array of created subtasks |
| `PATCH` | `/api/tasks/:taskId/subtasks/:subtaskId` | Toggle subtask completion | Yes | `{ is_completed, title }` | Updated subtask object |
| `DELETE` | `/api/tasks/:taskId/subtasks/:subtaskId` | Delete subtask | Yes | URL Params: `taskId, subtaskId` | Deletion confirmation |

---

### 9.6 AI Productivity Endpoints (`/api/ai`)

| Method | Endpoint | Purpose | Auth Req? | Request Data | Response Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/breakdown-task` | Generate subtasks for task | Yes | `{ task_title, description }` | Array of suggested subtasks with times |
| `POST` | `/api/ai/daily-plan` | Suggest today's priority schedule | Yes | `{ available_hours }` (uses user's pending tasks) | Structured daily schedule plan |
| `POST` | `/api/ai/summarize-notes` | Convert notes into action items | Yes | `{ notes_text, target_project_id }` | Executive summary + structured action items |

---

### 9.7 Focus Sessions & Timer Endpoints (`/api/focus`)

| Method | Endpoint | Purpose | Auth Req? | Request Data | Response Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/focus/log` | Record completed focus session | Yes | `{ task_id, duration_minutes, notes }` | Created session record + updated task actual minutes |
| `GET` | `/api/focus/history` | Get recent focus logs | Yes | Query: `?days=7` | Array of completed sessions |

---

### 9.8 Analytics Endpoints (`/api/analytics`)

| Method | Endpoint | Purpose | Auth Req? | Request Data | Response Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/analytics/dashboard` | Main metrics & KPIs | Yes | None | Summary: completed today, focus hours, streak |
| `GET` | `/api/analytics/weekly` | 7-day productivity charts | Yes | None | Daily completion numbers and focus durations |

---

### 9.9 Tags Endpoints (`/api/tags`)

| Method | Endpoint | Purpose | Auth Req? | Request Data | Response Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/tags` | List all user tags | Yes | None | Array of tags |
| `POST` | `/api/tags` | Create a new tag | Yes | `{ name, color }` | Created tag object |
| `DELETE` | `/api/tags/:id` | Delete tag | Yes | URL Param: `id` | Deletion confirmation |

---

### 9.10 Notifications Endpoints (`/api/notifications`)

| Method | Endpoint | Purpose | Auth Req? | Request Data | Response Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | Get user notifications | Yes | Query: `?unread_only=true` | Array of notifications + unread count |
| `PATCH` | `/api/notifications/:id/read`| Mark single notification read | Yes | URL Param: `id` | Updated notification object |
| `PATCH` | `/api/notifications/read-all`| Mark all notifications read | Yes | None | Success confirmation |

---

### 9.11 Admin Endpoints (`/api/admin`) *(Restricted: `role === 'admin'`)*

| Method | Endpoint | Purpose | Auth Req? | Request Data | Response Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/metrics` | Platform overview stats | Yes (Admin) | None | Total users, total tasks, AI usage, DB status |
| `GET` | `/api/admin/users` | List all registered users | Yes (Admin) | Query: `?search=&page=&limit=` | Paginated user list |
| `PATCH` | `/api/admin/users/:id/status`| Suspend or activate user | Yes (Admin) | `{ is_active: boolean }` | Updated user object |

---

## 10. COMPLETE SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT BROWSER                                │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    React 18 + Vite (SPA)                          │  │
│  │                                                                   │  │
│  │  ┌────────────────────┐ ┌───────────────────┐ ┌────────────────┐  │  │
│  │  │   UI Components    │ │    Auth Context   │ │  Axios Client  │  │  │
│  │  │  (shadcn/ui + CSS) │ │ (JWT State Store) │ │ (Interceptors) │  │  │
│  │  └─────────┬──────────┘ └─────────┬─────────┘ └────────┬───────┘  │  │
│  └────────────┼──────────────────────┼────────────────────┼──────────┘  │
└───────────────┼──────────────────────┼────────────────────┼─────────────┘
                │                      │                    │
                │ HTTPS (REST API Requests with Bearer JWT) │
                ▼                      ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      BACKEND SERVER (Node.js / Express)                 │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      Global Security Layer                        │  │
│  │              (CORS, Helmet, Rate Limiter, JSON Body)              │  │
│  └─────────────────────────────────┬─────────────────────────────────┘  │
│                                    │                                    │
│  ┌─────────────────────────────────▼─────────────────────────────────┐  │
│  │                         API Routes Router                         │  │
│  │   /api/auth   /api/projects   /api/tasks   /api/ai   /api/focus   │  │
│  └─────────────────────────────────┬─────────────────────────────────┘  │
│                                    │                                    │
│  ┌─────────────────────────────────▼─────────────────────────────────┐  │
│  │                 Middleware & Authentication Layer                 │  │
│  │        (JWT Verification, Role Guard, Input Validation)           │  │
│  └─────────────────────────────────┬─────────────────────────────────┘  │
│                                    │                                    │
│  ┌─────────────────────────────────▼─────────────────────────────────┐  │
│  │                         Controllers Layer                         │  │
│  │           (Request Handling, Status Codes, Orchestration)         │  │
│  └───────────────────┬───────────────────────────────┬───────────────┘  │
│                      │                               │                  │
│  ┌───────────────────▼──────────────┐ ┌──────────────▼───────────────┐  │
│  │           Services Layer         │ │          AI Service          │  │
│  │  (Business Logic, Calculations)  │ │   (Prompt Builder & Parser)  │  │
│  └───────────────────┬──────────────┘ └──────────────┬───────────────┘  │
└──────────────────────┼───────────────────────────────┼──────────────────┘
                       │                               │
                       ▼                               ▼
┌────────────────────────────────────────┐ ┌──────────────────────────────┐
│        MYSQL DATABASE CLUSTER          │ │    EXTERNAL AI SERVICE       │
│                                        │ │   (OpenAI / Gemini API)      │
│  ┌──────────────────────────────────┐  │ └──────────────────────────────┘
│  │       Connection Pool (mysql2)   │  │
│  ├──────────────────────────────────┤  │
│  │ • users         • projects       │  │
│  │ • tasks         • subtasks       │  │
│  │ • project_mems  • tags           │  │
│  │ • focus_sess    • ai_logs        │  │
│  │ • notifications                  │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

---

## 11. PROJECT FOLDER STRUCTURE

The project is divided into two distinct root directories: `frontend/` and `backend/`.

```
AI-PRODUCTIVITY-PLATFORM/
├── frontend/                     # React + Vite Frontend Application
│   ├── public/                   # Static assets, favicon, manifest
│   ├── src/
│   │   ├── assets/               # Local images, illustrations, SVG logos
│   │   ├── components/           # Reusable UI Components
│   │   │   ├── common/           # Generic components (Button, Modal, Input, Badge)
│   │   │   ├── layout/           # Navbar, Sidebar, AppLayout, Footer
│   │   │   ├── tasks/            # TaskCard, TaskTable, TaskModal, SubtaskList
│   │   │   ├── projects/         # ProjectCard, ProjectModal, MemberList
│   │   │   ├── ai/               # AiBreakdownModal, AiPlanWidget, NoteSummaryModal
│   │   │   ├── focus/            # PomodoroTimer, SessionHistory
│   │   │   └── analytics/        # StreakCounter, CompletionChart, MetricWidget
│   │   ├── context/              # React Context Providers (AuthContext, ThemeContext)
│   │   ├── hooks/                # Custom React Hooks (useAuth, useTasks, useProjects)
│   │   ├── pages/                # Top-level Page Views
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ProjectsPage.jsx
│   │   │   ├── ProjectDetailPage.jsx
│   │   │   ├── TasksPage.jsx
│   │   │   ├── AiAssistantPage.jsx
│   │   │   ├── FocusTimerPage.jsx
│   │   │   ├── AnalyticsPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── AdminDashboardPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── services/             # API client & endpoint service functions (api.js, authService.js, taskService.js)
│   │   ├── utils/                # Date formatting, validators, constants
│   │   ├── App.jsx               # Root Component with Routes
│   │   ├── main.jsx              # Application Entry Point
│   │   └── index.css             # Tailwind CSS imports & global design tokens
│   ├── index.html                # HTML template
│   ├── vite.config.js            # Vite build configuration
│   ├── tailwind.config.js        # Tailwind CSS configuration
│   ├── package.json              # Frontend dependencies and scripts
│   └── .env.example              # Sample frontend environment variables
│
├── backend/                      # Node.js + Express + MySQL Backend
│   ├── src/
│   │   ├── config/               # Database pool and environment config
│   │   │   ├── db.js             # mysql2/promise connection pool
│   │   │   └── env.js            # Environment variable validation
│   │   ├── controllers/          # Route controller functions
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── projectController.js
│   │   │   ├── taskController.js
│   │   │   ├── subtaskController.js
│   │   │   ├── aiController.js
│   │   │   ├── focusController.js
│   │   │   ├── analyticsController.js
│   │   │   ├── tagController.js
│   │   │   ├── notificationController.js
│   │   │   └── adminController.js
│   │   ├── middleware/           # Express middleware
│   │   │   ├── authMiddleware.js # JWT verification
│   │   │   ├── roleMiddleware.js # Admin / Owner permission checks
│   │   │   ├── validate.js       # Request body/param validators
│   │   │   ├── errorMiddleware.js# Centralized error handler
│   │   │   └── rateLimiter.js    # Rate limiting for auth & AI endpoints
│   │   ├── routes/               # API route definitions
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── projectRoutes.js
│   │   │   ├── taskRoutes.js
│   │   │   ├── subtaskRoutes.js
│   │   │   ├── aiRoutes.js
│   │   │   ├── focusRoutes.js
│   │   │   ├── analyticsRoutes.js
│   │   │   ├── tagRoutes.js
│   │   │   ├── notificationRoutes.js
│   │   │   └── adminRoutes.js
│   │   ├── services/             # Core business logic & AI API integration
│   │   │   ├── aiService.js      # Prompt engineering & AI API client
│   │   │   └── analyticsService.js# Productivity metrics calculations
│   │   ├── db/                   # Database scripts
│   │   │   ├── schema.sql        # Table creation DDL script
│   │   │   └── seed.sql          # Sample development data (admin, users, tasks)
│   │   ├── utils/                # Helper utilities (jwt.js, password.js, response.js)
│   │   ├── app.js                # Express app configuration & middleware mounts
│   │   └── server.js             # Server entry point (starts listener on PORT)
│   ├── package.json              # Backend dependencies and scripts
│   └── .env.example              # Sample backend environment variables
│
├── .gitignore                    # Git ignore for node_modules, .env, build output
├── PHASE_1_ARCHITECTURE.md       # This Architecture & Planning Document
└── README.md                     # Project overview and setup instructions
```

---

## 12. SECURITY CONSIDERATIONS

1. **Password Hashing:**
   - User passwords must never be stored in plain text.
   - Use `bcryptjs` with a minimum salt rounds factor of **10** for hashing passwords during registration and password change.
2. **JWT Security & Token Handling:**
   - Signed using a strong secret key (`JWT_SECRET`) with an expiration period (e.g., `7d`).
   - The token payload only contains safe identifiers (`id`, `email`, `role`) — no sensitive data or passwords.
   - Client sends the token in the standard `Authorization: Bearer <token>` HTTP header.
3. **Strict SQL Injection Prevention:**
   - **Zero String Concatenation in SQL:** Direct dynamic string concatenation into SQL queries is prohibited.
   - All queries use parameterized statements (`?` placeholders) supported natively by `mysql2/promise`.
4. **Authorization & Data Isolation (IDOR Prevention):**
   - Every database query modifying or retrieving user tasks or projects explicitly validates that `user_id` matches the authenticated requester (or that the user is an authorized member of the project).
5. **Input Validation & Sanitization:**
   - Incoming request payloads (`req.body`, `req.params`, `req.query`) are validated against schema rules (e.g., valid email formats, string lengths, enum bounds).
   - Prevents invalid data states and malformed payloads.
6. **Cross-Origin Resource Sharing (CORS):**
   - In production, backend restricts CORS origins strictly to the authorized frontend domain (e.g., `https://my-productivity-app.vercel.app`).
7. **Rate Limiting:**
   - Express rate limiters protect sensitive endpoints (e.g., max 10 login attempts per 15 minutes to prevent brute-force attacks; max 20 AI generation requests per hour per user).
8. **Environment Variable Protection:**
   - All secrets (`JWT_SECRET`, `DB_PASSWORD`, `AI_API_KEY`, `PORT`) remain stored in `.env` files that are strictly excluded from Git commits via `.gitignore`.
9. **Safe Error Handling:**
   - Central error middleware prevents leaking raw database error stacks, SQL queries, or internal paths to client responses in production.

---

## 13. DEVELOPMENT PHASE PLAN

We will execute the implementation across **8 clear, sequential phases**:

```
┌────────────────────────────────────────────────────────┐
│  Phase 1: Planning & Architecture (CURRENT — COMPLETED)│
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│  Phase 2: Project Setup & Environment Configuration    │
│  • Initialize frontend (Vite+React+Tailwind) & backend │
│  • Configure .env, Git repo, and base scripts          │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│  Phase 3: MySQL Database Setup & Connection Pool       │
│  • Create database schema.sql and seed.sql             │
│  • Establish resilient mysql2 connection pool          │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│  Phase 4: Authentication & Security Subsystem          │
│  • Implement bcrypt password hashing & JWT generation  │
│  • Build auth routes, controllers, and authMiddleware  │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│  Phase 5: Core Backend REST APIs                       │
│  • Projects CRUD & Task Management (Kanban/Status)     │
│  • Subtasks, Tags, Focus Sessions & Analytics APIs     │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│  Phase 6: AI Integration Services                      │
│  • AI Task Breakdown, Daily Plan & Notes Summarizer    │
│  • Error handling and token usage tracking             │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│  Phase 7: Frontend UI & State Implementation           │
│  • Implement design system (Tailwind + shadcn/ui)      │
│  • Build Pages: Dashboard, Kanban Board, Focus Timer,   │
│    AI Hub, Analytics, and Admin Views                  │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│  Phase 8: End-to-End Integration, Testing & Deployment │
│  • Connect frontend with backend REST APIs             │
│  • Perform end-to-end user flow verification           │
│  • Deploy Frontend to Vercel and Backend to Render     │
└────────────────────────────────────────────────────────┘
```

---

## PHASE 1 COMPLETION CHECKLIST

- [x] **1. Problem Statement:** Clearly defined real-world problem, target users, inefficiencies of existing tools, and proposed solution.
- [x] **2. Target Users:** Outlined individual users, team members, and system administrators with specific capabilities.
- [x] **3. User Roles & Permissions:** Detailed role matrix covering `user`, `admin`, and project-level scopes (`owner`, `member`, `viewer`).
- [x] **4. Complete Feature List:** Organized realistic feature requirements across Auth, Tasks, Projects, AI, Dashboard, Focus, and Search.
- [x] **5. Application Flow:** Mapped complete end-to-end journey from landing to logout.
- [x] **6. Frontend Architecture:** Defined page breakdown, reusable components, route guards, state management, and Axios interceptors.
- [x] **7. Backend Architecture:** Established layered architecture (Routes → Controllers → Services → DB Pool) with standard responses.
- [x] **8. MySQL Database Design:** Defined 10 normalized tables with primary keys, foreign keys, cascades, and data types.
- [x] **9. API Structure:** Detailed 30+ RESTful endpoints with HTTP verbs, request payloads, auth requirements, and response purposes.
- [x] **10. Complete System Architecture:** Provided clear ASCII system flow diagram linking client, server, DB, and external AI.
- [x] **11. Project Folder Structure:** Designed clean, beginner-friendly file and folder directory tree for `frontend/` and `backend/`.
- [x] **12. Security Considerations:** Established rules for bcrypt hashing, JWT validation, SQL injection prevention, CORS, and IDOR protection.
- [x] **13. Development Phase Plan:** Broken down development roadmap into 8 sequential, manageable phases.

---
*Phase 1 is complete. This document serves as the permanent single source of truth for subsequent development phases.*
