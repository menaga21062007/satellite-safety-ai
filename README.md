# 🛰️ Satellite Safety Monitoring AI (Aegis-Orbit SSA)

> **Autonomous Space Situational Awareness (SSA), Real-time Radar Tracking, Foster 2D B-Plane AI Collision Prediction, and Collision Avoidance Maneuver (CAM) Mission Control System.**

[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript%20%7C%20TailwindCSS-00D4FF)](https://reactjs.org/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20SQLite-38BDF8)](https://nodejs.org/)
[![AI-Microservice](https://img.shields.io/badge/AI%20Service-Python%20%7C%20FastAPI-10B981)](https://fastapi.tiangolo.com/)
[![Reports](https://img.shields.io/badge/Reports-PDFKit%20%7C%20CSV-EF4444)](https://pdfkit.org/)

---

## 🌟 Executive Summary & Project Goal
As thousands of active satellites and hundreds of thousands of dangerous debris fragments crowd Low Earth Orbit (LEO), tracking conjunctions and executing collision avoidance maneuvers is critical to preventing the catastrophic Kessler Syndrome.

**Satellite Safety Monitoring AI** provides:
1. **Satellite Monitoring**: Live orbital telemetry (altitude, velocity, orbit profile, fuel, inclination, battery) with live-updating simulated satellite movement.
2. **Debris Detection**: High-fidelity radar sensor simulation tracking nearby objects (debris, old satellite fragments, rocket bodies, unknown objects).
3. **AI Collision Risk Prediction**: Astrodynamic Foster 2D B-plane encounter probability ($P_c$), miss distance ($b$), and time-to-impact ($TCA$) calculation.
4. **Safe Orbit Maneuver Recommendation**: Automated delta-V thrust calculations, altitude changes ($\Delta h$), burn duration, and fuel budgeting based on the Tsiolkovsky rocket equation.
5. **Mission Control Dashboard**: Modern NASA/ESA-grade dark-themed tactical HUD with 2D radar polar sweep & geocentric orbital maps.
6. **Real-Time Alerts System**: Instant automated alerts for critical proximity events with acknowledge and resolve workflows.
7. **Mission Reports**: Instant one-click downloadable audit-ready PDF and raw tabular CSV safety reports.
8. **Interactive Demo Mode**: "Start Simulation" and "Inject Hazard" triggers to demonstrate a live close-encounter scenario and successful safe orbit maneuver execution.

---

## 🗂️ Clean Project Directory Structure

```
satellite-safety-ai/
├── backend/                        # Node.js + Express Backend Service
│   ├── src/
│   │   ├── ai/
│   │   │   └── riskEngine.js       # Statistical Foster 2D B-plane risk model & CAM planner
│   │   ├── simulation/
│   │   │   └── simulationManager.js# Physics ticking loop & approaching hazard generator
│   │   ├── reports/
│   │   │   └── reportGenerator.js  # High-res PDFKit PDF & CSV report generator
│   │   ├── db.js                   # SQLite database initialization & seeding
│   │   └── server.js               # Express REST API & static routing
│   ├── sample_data.json            # Seed data for satellites & debris
│   ├── package.json
│   └── satellite_safety.sqlite     # Persistent embedded SQLite database
├── frontend/                       # React 18 + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx          # Top bar with satellite selector, health, simulation controls
│   │   │   ├── Sidebar.tsx         # Left navigation with active badge counts
│   │   │   └── OrbitRadarCanvas.tsx# 2D Canvas radar polar sweep & geocentric Earth orbit views
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx       # Operator terminal & clearance login
│   │   │   ├── DashboardPage.tsx   # Live Mission Control Master HUD
│   │   │   ├── DebrisPage.tsx      # Debris radar feed, search, filter & inspection
│   │   │   ├── RiskAnalysisPage.tsx# Recharts collision probability & covariance analytics
│   │   │   ├── ManeuverPage.tsx    # Safe Orbit Maneuver planner & burn execution
│   │   │   ├── AlertsPage.tsx      # Alerts timeline with acknowledge & resolve actions
│   │   │   └── ReportsPage.tsx     # PDF & CSV report preview & download
│   │   ├── api.ts                  # Centralized typed API client
│   │   ├── types.ts                # TypeScript interfaces
│   │   ├── App.tsx                 # Core application controller & Web Audio alert
│   │   ├── main.tsx
│   │   └── index.css               # Futuristic HUD styles & glassmorphic themes
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
├── ai/                             # Python FastAPI AI Microservice (Optional/Modular)
│   ├── app.py                      # FastAPI endpoints (/predict-risk, /recommend-maneuver)
│   ├── risk_model.py               # Astrodynamics & covariance risk prediction engine
│   └── requirements.txt
├── docs/                           # Comprehensive Documentation
│   ├── ARCHITECTURE.md             # Astrodynamic formulas, state vectors & data flow
│   ├── API_SPEC.md                 # OpenAPI REST endpoints documentation
│   └── HACKATHON_DEMO_SCRIPT.md    # 3-minute winning presentation walkthrough
└── README.md                       # Project Guide
```

---

## ⚡ Quick Start & Run Commands

### Prerequisites
- **Node.js**: v18+ or v20+ or v24+
- **Python** (optional): 3.10+ (if running the Python AI microservice alongside Node)

### 1. Start Backend Server (Terminal 1)
```bash
cd backend
npm install
npm start
```
*The backend starts at `http://localhost:5000` and initializes SQLite automatically.*

### 2. Start Frontend Application (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
*Open your browser and navigate to **`http://localhost:3000`**.*

### 3. (Optional) Start Python AI Microservice (Terminal 3)
```bash
cd ai
pip install -r requirements.txt
python app.py
```
*Runs FastAPI on `http://localhost:8001`.*

---

## 🚀 7 Core Pages Walkthrough

| # | Page | Key Features |
|---|---|---|
| **1** | **Operator Login / Landing** | Clearance authentication, mission readiness checklist, one-click access. |
| **2** | **Mission Dashboard (Master HUD)** | 2D Canvas radar polar sweep, Earth geocentric orbital view, live telemetry, risk gauge, quick debris table, active alerts feed, and one-click "Move to Safe Orbit" button. |
| **3** | **Debris Detection & Inspection** | Filterable by type (space debris, rocket body, old sat, unknown), threat level (safe, watchlist, risky, critical), keyword search, and detailed telemetry drawer. |
| **4** | **Collision Risk & AI Analysis** | Recharts bar charts ($P_c$ by object), risk distribution donut chart, Foster 2D B-plane covariance math walkthrough. |
| **5** | **Safe Orbit Maneuver Planner** | Safe movement direction, altitude change ($\Delta h$), burn duration, propellant consumption ($\Delta m$), AI rationale, and "Move to Safe Orbit" burn execution. |
| **6** | **Alerts History** | Chronological timeline of critical events with "Acknowledge" and "Mark Resolved" workflows. |
| **7** | **Safety Reports** | One-click **Download PDF** (audit-ready formatted document) and **Download CSV** (tabular telemetry dataset). |

---

## 📡 Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/satellite` | Active satellite telemetry & coordinates |
| `GET` | `/api/satellites` | List all monitored satellites |
| `POST` | `/api/satellite/select` | Switch active satellite |
| `GET` | `/api/debris` | Nearby debris objects within radar perimeter |
| `GET` | `/api/debris/:id` | Individual debris target details |
| `POST` | `/api/simulation/start` | Start live radar physics simulation |
| `POST` | `/api/simulation/stop` | Pause radar simulation |
| `POST` | `/api/simulation/reset` | Reset simulation to baseline |
| `POST` | `/api/simulation/trigger-hazard` | Inject immediate critical conjunction trajectory |
| `GET` | `/api/risk-analysis` | Foster 2D B-plane collision risk evaluation |
| `POST` | `/api/maneuver` | Execute safe orbit thruster burn |
| `GET` | `/api/alerts` | List real-time alerts |
| `POST` | `/api/alerts/:id/acknowledge` | Acknowledge alert |
| `POST | `/api/alerts/:id/resolve` | Mark alert resolved |
| `GET` | `/api/report/pdf` | Stream audit-ready PDF report |
| `GET` | `/api/report/csv` | Download tabular CSV report |

---

## 🏆 Hackathon Demo Scenario (How to Win)

1. Open **`http://localhost:3000`** in browser.
2. Note the **active 2D radar sweep** and the **Aegis-Sentinel 1** satellite telemetry in Low Earth Orbit (550 km).
3. Click **`INJECT HAZARD`** in the top bar:
   - A critical conjunction trajectory is immediately simulated (`COSMOS-1408 Frag #4192`).
   - Distance collapses to 11.2 km, ETA is 3m 15s, and collision probability spikes to **92.4% (CRITICAL)**.
   - The flashing red alarm banner triggers with an audible warning beep.
4. Click **`MOVE TO SAFE ORBIT`**:
   - The thruster burn sequence executes (`+12.5 km Prograde Altitude Boost`, $14.8\text{ m/s } \Delta V$).
   - Satellite altitude boosts to 562.5 km.
   - Debris separation expands to $>50\text{ km}$.
   - Collision risk drops to **LOW (0.4%)**.
   - Active alert automatically updates to **Resolved**.
5. Navigate to **Safety Reports** and click **`DOWNLOAD PDF REPORT`** to display the downloaded PDF.

---

## 🔮 Future Improvements & Production Roadmap
- **Real-time Space-Track.org TLE Ingestion**: Connect real NORAD Two-Line Element sets via SGP4 propagation.
- **Deep Reinforcement Learning (DRL) Maneuver Optimization**: Train a Proximal Policy Optimization (PPO) agent to balance propellant conservation against secondary conjunction risks.
- **Multi-Constellation Swarm Coordination**: Autonomous coordination across mega-constellations (Starlink, OneWeb) to avoid cascade conflicts.
- **Hardware-in-the-loop (HIL) Integration**: Connect to cubesat thruster flight computers via CAN bus or CCSDS telecommand protocols.
