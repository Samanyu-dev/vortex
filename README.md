# 🌌 VORTEX — "Turn tasks into momentum."

**VORTEX** is an ultra-premium, production-ready, futuristic task management operating system built to demonstrate world-class front-end motion design, sound, robust system architectures, and flawless user experiences. Inspired by high-end design paradigms from Arc Browser, Linear, Stripe, and modern sci-fi interfaces, VORTEX elevates task management into a high-performance productivity cockpit.

---

## 🚀 Key Features

* **Futuristic Split-Screen Access:**
  * **Left Side:** Interactive GSAP particle canvas with custom node connections, floating 3D glass cards showing live telemetry, and aurora color fields.
  * **Right Side:** High-tech glassmorphism forms with slide-in tab transitions and real-time cryptography status indications.
* **The "Task Flow Engine" (Workspace):**
  * Elegant glassmorphic columns with dynamic glow borders indicating active drop targets.
  * Staggered GSAP/Framer-motion columns entering the viewport gracefully.
  * Custom tags filter bar and inline search parameters.
* ** Bespoke 3D Hover tilt & Drag-and-Drop:**
  * Task cards react to mouse coordinates with a custom GSAP 3D hover tilt, neon priority glow flares, and floating lighting effects.
  * Cards scale to 1.05 and skew dynamically based on dragging velocity, with neighbors sliding elastic-spring fashion.
* **Spotlight Focus Mode (Deep Work Cockpit):**
  * Fades and blurs peripheral UI components.
  * Displays the selected task in high-contrast centered focus.
  * Houses an interactive **Pomodoro Timer** with countdown circles, cycles (Deep Work / Chill Break), and HTML5 audio synthesizer chimes on cycle completion.
* **CMD+K fuzzy Search Command Palette:**
  * Floating fuzzy search terminal listening to global key shortcuts.
  * Arrow key list traversal and hotkeys (`Esc` to close, `Enter` to edit).
* **Quantum Telemetry Analytics:**
  * Metric cards displaying total orchestrations, completed tasks, and rate of productivity.
  * GSAP count-up numbers transitioning from 0 on load.
  * Glowing SVG wave bars detail weekly output metrics.
* **Core Matrix Settings:**
  * Ambassador for ambient theme customization.
  * Interactive sliders for backdrop blur strength and glow intensities.
  * Reset registry keys (database re-seeding).
* **Robust REST Backend with Zero-Config Fallback:**
  * Node.js/Express with ES Modules and strict JWT authentication.
  * Smart connector: automatically fallbacks to a high-performance, persistent JSON database inside `server/data/db.json` when no MongoDB Atlas credentials are provided. Instantly testable out-of-the-box!

---

## 🛠️ Tech Stack

### Frontend Core
* **React 19**
* **TypeScript** (Strict Mode compile compliant)
* **Vite** (Ultra-fast packaging)
* **Tailwind CSS** (Futuristic glass styling tokens)
* **GSAP + @gsap/react** (3D tilt, count-up counters, circular countdowns, particles canvas)
* **Framer Motion** (Spring drawer slides, tab indicator shifts, modal popups)
* **Zzustand** (Unified global sync state)
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
│   │   │   ├── TaskBoard.tsx   # Status columns & drag targets
│   │   │   └── TaskCard.tsx    # 3D interactive tilt cards
│   │   ├── store/
│   │   │   └── useVortexStore.ts # Unified Zustand store
│   │   ├── index.css           # Glowing tokens and keyframe animations
│   │   └── App.tsx             # Auth router and loader splash
│   ├── tailwind.config.js      # Glow shadows and semantic color extensions
│   └── package.json            # Client scripts and dependencies
│
├── server/                     # Node.js + Express REST Backend
│   ├── src/
│   │   ├── db/
│   │   │   └── localDb.js      # Zero-config persistent JSON fallback
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT validation flow
│   │   ├── models/
│   │   │   └── Schemas.js      # Unified Mongoose / Fallback DB schemas
│   │   ├── routes/
│   │   │   ├── auth.js         # JWT access key register & seed
│   │   │   └── tasks.js        # CRUD operations & audit logging
│   │   └── index.js            # Main server entry & bootstrap
│   └── package.json            # Server dependencies & scripts
│
├── package.json                # Root workspace configuration
└── README.md                   # Operational telemetry document
```

---

## 🛸 Quick Setup

Follow these simple steps to run VORTEX locally:

### 1. Enlist and Install Dependencies
In the root directory of the project, run:
```bash
npm run install:all
```
This single command concurrently installs all root, client, and server packages.

### 2. Ignite Development Environments
Once installation is complete, run:
```bash
npm run dev
```
This triggers both the Vite frontend server and nodemon Express backend concurrently:
* **Frontend Dashboard:** [http://localhost:5173](http://localhost:5173)
* **Backend Server:** [http://localhost:5001](http://localhost:5001)

### 3. Setup Custom Database (Optional)
By default, VORTEX launches in **offline mode**, caching user profiles and tasks to `server/data/db.json` automatically.
To connect to MongoDB Atlas, add your connection string inside `/server/.env`:
```env
PORT=5001
JWT_SECRET=vortex_quantum_secret_key_99
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/vortex
```

---

## 🎨 Architectural Decisions & Design Tradeoffs

### 1. Inter-exchangeable Local persistent JSON DB fallbacks
* **Decision:** To guarantee a seamless initial run experience, we avoided forcing immediate external database setup (which usually halts recruiters or developers on review). 
* **Design:** We decoupled our routes from direct Mongoose models by exporting standard query bindings that automatically route to either `Mongoose` or a local file systems manager mirroring standard queries (`findOne`, `findByIdAndUpdate`).

### 2. Custom 3D Tilt Engine over third-party Libraries
* **Decision:** Standard cards in dashboard templates feel static. Instead of pulling heavy external cards, we implemented cursor trigonometry inside React combined with GSAP's `power3` easing.
* **Result:** Dragging cards rotates according to velocity skews, and hovering yields immersive 3D tilting which matches high-end web design.

### 3. Unified Zustand Store for Navigation, Timers, and Cache
* **Decision:** Prop drilling of tasks or timer tickers introduces lags.
* **Design:** All components are fully synchronized to a single store (`useVortexStore.ts`). Checking a subtask inside the drawer instantly updates the progress bar on the board card, completion rate circular analytics, and weekly telemetry trends, in full 60FPS.
