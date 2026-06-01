# 🌌 VORTEX — "Turn tasks into momentum."

**VORTEX** is an ultra-premium, production-ready, futuristic task management operating system built to demonstrate world-class front-end motion design, robust full-stack architecture, and fluid user experiences. Inspired by high-end design utilities like **Linear, Arc Browser, Raycast, and Apple Vision Pro**, VORTEX transforms task management into a high-performance productivity cockpit.

### 🔗 Live Cloud Deployments
* **Production Workspace (Vercel):** [https://vortex-task.vercel.app](https://vortex-task.vercel.app)
* **Production API (Render):** [https://vortex-api-dsx0.onrender.com](https://vortex-api-dsx0.onrender.com)
* **Production Database (MongoDB Atlas):** Mumbai (`ap-south-1`) Shared Cluster

---

## 🚀 Product Features

* **Flowing Stream Workspace:**
  * Replaces standard vertical card Kanban columns with a single, flowing horizontal stream divided into logical sectors: `In Queue` (Todo), `In Flight` (In Progress), and `Completed` (Done).
  * **Compact Horizontal Accordions:** Tasks exist as compact horizontal segments. Clicking a segment expands it inline smoothly with spring physics, revealing subtask checklists and note parameters. 
  * **Cognitive Spotlight:** Only *one* task segment can be expanded at any time. Expanding another task automatically collapses the previous one, locking in focus.
* **The Momentum Engine:**
  * Replaces heavy dashboard widgets with a sleek, live momentum score ticker (`MOMENTUM // {Score} // {Trajectory}`).
  * Calculates an active score (between `10` and `99`) in real-time using completed ratios, flight load factors, and Focus streaks, notifying you instantly on trajectory shifts.
* **Zen Focus Mode:**
  * Spotlights your active task. Engaging focus collapses the sidebar to `0px` and slides it away completely, blurs background elements, and blackouts the viewport into a matte void (`#020204`).
  * Features a gorgeous, thin-stroke circular **Pomodoro Countdown Timer** with cycle triggers (Work/Break) and retro HTML5 Synthesizer chime beeps on completion.
* **Arc-Style Expandable Sidebar:**
  * A minimal 64px-wide vertical icon rail in its collapsed state.
  * Hovering expands it smoothly to 240px to reveal text labels, keeping the workspace canvas visually clean.
* **CMD+K Search Command Palette:**
  * Floating fuzzy search terminal listening to global key shortcuts.
  * Arrow key list traversal and hotkeys (`Esc` to close, `Enter` to inspect).
* **Robust JWT Session Auth:**
  * Secure user registration, sign-in, and persistent sessions.
  * Pre-seeds new accounts with cinematic sci-fi tasks (e.g. *"Calibrate warp drive coils"*, *"Refactor quantum state manager"*) to demonstrate metrics instantly.

---

## 🛠️ Tech Stack

### Frontend Core
* **React 19**
* **TypeScript** (Strict Mode compile compliant)
* **Vite** (Ultra-fast packaging)
* **Tailwind CSS** (Futuristic glass and matte styling tokens)
* **GSAP + @gsap/react** (Expand morphs, Pomodoro circular meters, canvas particles, count-ups)
* **Framer Motion** (Spring drawer slides, tab sliders, Zen overlays)
* **Zustand** (Unified global sync state store)
* **Zod** (Form validations)
* **Lucide Icons** (Futuristic HUD vector symbols)

### Backend & Storage
* **Node.js + Express** (ES Modules)
* **JWT** (JSON Web Tokens)
* **Bcrypt.js** (Hashed password security)
* **Mongoose** (MongoDB Atlas driver)
* **Vortex JSON Engine** (Database fallback mechanism)

---

## 📁 Repository Structure

```
vortex/
├── client/                     # Vite + React 19 Frontend
│   ├── src/
│   │   ├── components/         # Immersive HUD Views
│   │   │   ├── Analytics.tsx   # GSAP count-ups & charts
│   │   │   ├── CommandPalette.tsx # CMD+K fuzzy overlay
│   │   │   ├── CreateTaskModal.tsx # Zod-validated wizard
│   │   │   ├── DashboardLayout.tsx # Master layout coordinator
│   │   │   ├── FocusMode.tsx   # Spotlight cockpit & Pomodoro
│   │   │   ├── Login.tsx       # Canvas particle access key panel
│   │   │   ├── Settings.tsx    # Calibration preferences
│   │   │   ├── Sidebar.tsx     # Progress SVGs & widgets
│   │   │   ├── TaskBoard.tsx   # Horizontal sections & stream
│   │   │   └── TaskCard.tsx    # Horizontal accordion cards
│   │   ├── store/
│   │   │   └── useVortexStore.ts # Unified Zustand store
│   │   ├── index.css           # Muted slate tokens and styling variables
│   │   └── App.tsx             # Auth router and loader splash
│   ├── tailwind.config.js      # Custom matte colors and razor borders
│   └── package.json            # Client scripts and dependencies
│
├── server/                     # Node.js + Express REST Backend
│   ├── src/
│   │   ├── db/
│   │   │   └── localDb.js      # Zero-config persistent JSON fallback
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT validation flow
│   │   ├── models/
│   │   │   └── Schemas.js      # Mongoose schemas
│   │   ├── routes/
│   │   │   ├── auth.js         # JWT registration, login, and seeding
│   │   │   └── tasks.js        # CRUD operations & audit logging
│   │   └── index.js            # Main server entry & bootstrap
│   └── package.json            # Server dependencies & scripts
│
├── package.json                # Root workspace configuration
└── README.md                   # System operational guide
```

---

## 📡 API Documentation

All API requests are prefix-served at `/api`. Requests must include `Content-Type: application/json`. Protected endpoints require the JWT token passed as a Bearer token in the `Authorization` header: `Authorization: Bearer <token>`.

### 1. Authentication Router (`/api/auth`)

#### `POST /api/auth/register`
* **Description:** Register a new account and pre-seed core tasks.
* **Request Body:**
  ```json
  {
    "name": "Jean-Luc Picard",
    "email": "picard@enterprise.federation",
    "password": "secure_password_123"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "603d7c5e3b9f0a2d1c8b9a3f",
      "name": "Jean-Luc Picard",
      "email": "picard@enterprise.federation"
    }
  }
  ```

#### `POST /api/auth/login`
* **Description:** Authenticate access credentials.
* **Request Body:**
  ```json
  {
    "email": "picard@enterprise.federation",
    "password": "secure_password_123"
  }
  ```
* **Response (200 OK):** *(Same payload structure as register)*

#### `GET /api/auth/me`
* **Description:** Fetch current logged-in session profile.
* **Headers:** `Authorization: Bearer <token>`
* **Response (200 OK):**
  ```json
  {
    "id": "603d7c5e3b9f0a2d1c8b9a3f",
    "name": "Jean-Luc Picard",
    "email": "picard@enterprise.federation"
  }
  ```

---

### 2. Task Operational Router (`/api/tasks`)

#### `GET /api/tasks`
* **Description:** Retrieve all tasks belonging to the current user.
* **Headers:** `Authorization: Bearer <token>`
* **Response (200 OK):**
  ```json
  [
    {
      "_id": "603d7d7c5e3b9f0a2d1c8b9b",
      "userId": "603d7c5e3b9f0a2d1c8b9a3f",
      "title": "Calibrate warp drive coils",
      "description": "Align plasma injectors across subspace channels.",
      "status": "Todo",
      "priority": "High",
      "dueDate": "2026-06-05",
      "tags": ["core", "engineering"],
      "subtasks": [
        { "_id": "sub1", "title": "Initiate magnetic lock", "completed": true }
      ],
      "activities": [
        { "_id": "act1", "text": "Task matrix generated", "time": "2026-06-01T17:00:00Z" }
      ],
      "createdAt": "2026-06-01T17:00:00Z",
      "updatedAt": "2026-06-01T17:05:00Z"
    }
  ]
  ```

#### `POST /api/tasks`
* **Description:** Instantiate a new task.
* **Headers:** `Authorization: Bearer <token>`
* **Request Body:**
  ```json
  {
    "title": "Refactor quantum state manager",
    "description": "Optimize event loops.",
    "status": "Todo",
    "priority": "Medium",
    "dueDate": "2026-06-10",
    "tags": ["state", "system"]
  }
  ```
* **Response (201 Created):** *(Returns the newly generated task object)*

#### `PUT /api/tasks/:id`
* **Description:** Update complete parameters of a task.
* **Headers:** `Authorization: Bearer <token>`
* **Request Body:** *(Accepts partial or complete task fields, including `subtasks` array)*
* **Response (200 OK):** *(Returns the updated task object, with auto-generated audit activity log)*

#### `PATCH /api/tasks/:id/status`
* **Description:** Perform a rapid stage transition (Queue / Flight / Completed).
* **Headers:** `Authorization: Bearer <token>`
* **Request Body:**
  ```json
  {
    "status": "In Progress"
  }
  ```
* **Response (200 OK):** *(Returns the patched task with dynamic stage activity log)*

#### `DELETE /api/tasks/:id`
* **Description:** Wipe a task record from databases.
* **Headers:** `Authorization: Bearer <token>`
* **Response (200 OK):**
  ```json
  {
    "message": "Task deleted successfully",
    "id": "603d7d7c5e3b9f0a2d1c8b9b"
  }
  ```

---

## 🛸 Quick Setup

### 1. Enlist and Install Dependencies
Concurrently install all root, client, and server packages with a single trigger:
```bash
npm run install:all
```

### 2. Configure Environment Keys
Add a `.env` file inside `/server` with these templates:
```env
PORT=5001
JWT_SECRET=your_secure_signature_key
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/vortex
```
*(Leave `MONGODB_URI` blank to auto-activate the zero-config offline persistent JSON databasefallback).*

### 3. Ignite Development Server
Concurrently boot both the Express server and Vite frontend:
```bash
npm run dev
```
* **Client Portal:** [http://localhost:5173](http://localhost:5173)
* **Backend API:** [http://localhost:5001](http://localhost:5001)

---

## 🎨 Architectural Decisions, Tradeoffs, & Assumptions

### 1. Inter-exchangeable Local persistent JSON DB fallbacks
* **Decision:** To guarantee a seamless initial run experience, we avoided forcing immediate external database setup (which usually halts recruiters or developers on review). 
* **Design:** We decoupled our routes from direct Mongoose models by exporting standard query bindings that automatically route to either `Mongoose` or a local file systems manager mirroring standard queries (`findOne`, `findByIdAndUpdate`).

### 2. Custom 3D Tilt Engine over third-party Libraries
* **Decision:** Standard cards in dashboard templates feel static. Instead of pulling heavy external cards, we implemented cursor trigonometry inside React combined with GSAP's `power3` easing.
* **Result:** Dragging cards rotates according to velocity skews, and hovering yields immersive 3D tilting which matches high-end web design.

### 3. Unified Zustand Store for Navigation, Timers, and Cache
* **Decision:** Prop drilling of tasks or timer tickers introduces lags.
* **Design:** All components are fully synchronized to a single store (`useVortexStore.ts`). Checking a subtask inside the drawer instantly updates the progress bar on the board card, completion rate circular analytics, and weekly telemetry trends, in full 60FPS.
