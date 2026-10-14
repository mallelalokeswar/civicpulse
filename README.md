# 🚨 CivicPulse: Autonomous Municipal Triage & Infrastructure Copilot

**Smart Cities • Public Safety • Multimodal Hazard Triage • Autonomous Routing**

> **CivicPulse** is an end-to-end municipal infrastructure copilot that eliminates filing friction, bureaucratic delays, and duplicate ticket spam. Citizens simply snap a photo, upload a video, or drop a voice note in any language. Powered by **Google Gemini 3.8 Flash** multimodal intelligence, CivicPulse extracts exact hazards, scores severity, performs semantic clustering to prevent duplicate backlogs, autonomously dispatches departmental work orders, and provides civil engineers with predictive infrastructure decay modeling.

---

## 🌟 Key Capabilities

### 1. 📱 Multimodal Citizen Ingestion Channel
- **Zero Bureaucracy Filing**: Citizens don't fill out tedious 10-step municipal forms. They snap a photo or record a voice note in any language (English, Spanish, Mandarin, Arabic, French, Hindi, etc.).
- **Live Voice Transcription & Translation**: Web Audio API recorder captures citizen voice notes; Gemini transcribes and translates dialect into actionable English civil engineering logs.
- **Sensor & Visual Geolocation**: Automatic GPS coordinates extraction cross-referenced with visual landmark cues (street signs, intersections, building markers).
- **Simulated WhatsApp / Telegram Bot Channel**: Citizens can interact with an automated city bot simulator with immediate triage confirmation and dispatch tracking code.

### 2. ⚡ Gemini Multimodal Hazard Triage
- **Issue Classification**: Distinguishes asphalt fatigue potholes, pressurized water main ruptures, downed luminaire poles with live exposed cables, illegal industrial chemical dumping, root heaves, and structural bridge cracks.
- **Priority Severity Scoring (1–5)**:
  - **P5 (Critical / Imminent Danger)**: Immediate 4-hour SLA dispatch (e.g. 240V exposed wire, active water main geyser).
  - **P4 (Severe Hazard)**: 24-hour SLA (e.g. deep pothole on arterial commuter lane).
  - **P3 (Moderate)**: 48-hour SLA (e.g. commercial fly-tipping).
  - **P1–P2 (Low / Accessibility)**: 72-hour turnaround (e.g. sidewalk ADA lip).
- **Hazard Physical Metrics**: Estimates crater depth/dimensions, hazard perimeter radius, traffic lane disruption, and municipal tort liability.

### 3. 🛡️ Semantic Clustering & Duplicate Ticket Prevention
- **Spatial Buffer & NLP Clustering**: Analyzes reports within a 75-meter radius and calculates semantic similarity.
- **Automatic Merging**: Prevents 50 citizens from creating 50 separate tickets for the same pothole. Instead, merges reports into a single Master Ticket, increments citizen confirmations, logs new photos, and escalates severity if conditions worsen.

### 4. 📋 Autonomous Municipal Routing & Work Order Engine
- **Autonomous Dispatch**: Instantly routes tickets to the appropriate municipal department:
  - *Public Works & Streets*
  - *Dept of Water & Sewage*
  - *Power & Streetlighting*
  - *Sanitation & Hazardous Waste*
  - *Building Inspection & Safety*
- **Field-Ready Work Orders**: Generates structured Work Order IDs (`WO-2026-XXXX`) with:
  - Assigned field crew (e.g., `Alpha Paving Rapid Unit #4`)
  - Itemized cost forecast (materials, labor, equipment)
  - Required tools (cold planer, asphalt hotbox, vacuum excavator)
  - Required safety permits (Class II Lane Closure, Emergency Boil Water Advisory).

### 5. 🗺️ City Engineering Heatmap & Predictive Decay Modeling
- **Interactive Leaflet GIS Heatmap**: CartoDB dark-mode geospatial view with pulsing severity pins, cluster filters, and slide-over ticket inspection drawers.
- **Predictive Infrastructure Decay Modeling**:
  - Monitors corridor stress (Downtown Core, Harbor & Riverside, Industrial Corridor, University District, West Suburbs).
  - 30-day, 90-day, and 180-day failure probability projections using infrastructure age, traffic volume, drainage stress, and incident velocity.
  - **Proactive vs Reactive Cost Avoidance**: Visualizes how targeted preventative spending ($238k) prevents catastrophic emergency repair claims ($821k)—a **3.45x Return on Investment (ROI)**.

### 6. 🤖 Municipal Civil Engineering Copilot
- Natural language decision support for city managers and dispatchers.
- Quick insights into liability risks, preventative repair schedules, and council budget memos.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **AI Engine** | Google Gemini 3.8 Flash (`@google/genai` SDK) for Multimodal Vision & Audio Analysis |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons |
| **Geospatial GIS** | Leaflet GIS Engine, CartoDB Dark Matter tiles, OpenStreetMap |
| **Backend API** | Node.js, Express, Multer (multipart audio/video ingestion), CORS, Dotenv |
| **Audio Processing** | HTML5 Web Audio API, MediaRecorder |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ installed
- *(Optional)* **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/) for live API calls.
  *(Note: CivicPulse includes an intelligent civil engineering simulation fallback engine that functions out-of-the-box even without an API key!)*

### 2. Configuration
Copy `.env.example` to `.env` and insert your Gemini API Key if desired:
```bash
GEMINI_API_KEY="your-gemini-api-key-here"
PORT=3001
```

### 3. Launch CivicPulse
Run from the root directory:
```bash
# Start backend server (serves the built client on http://localhost:3001)
npm start
```
Or run the Vite development server concurrently:
```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend (in client/)
cd client
npm run dev
```

Open your browser at:
👉 **`http://localhost:3001`** (or `http://localhost:5173` for Vite hot-reload)

---

## 📡 API Endpoints

- `GET /api/health` — System status, active ticket counts, and Gemini configuration status.
- `GET /api/tickets` — Query all hazard tickets with filters (`department`, `severity`, `status`, `neighborhood`).
- `GET /api/tickets/:id` — Detailed ticket inspection with work order and duplicate history.
- `PATCH /api/tickets/:id` — Dispatch crews, update progress, or mark repairs resolved.
- `POST /api/triage/multimodal` — Multipart endpoint receiving images, voice notes, GPS coordinates, and descriptions.
- `POST /api/triage/bot-simulator` — Simulated WhatsApp / Telegram citizen message gateway.
- `GET /api/infrastructure/decay-model` — Predictive neighborhood decay ratings, failure risks, and cost-avoidance ROI.
- `GET /api/infrastructure/heatmap` — GIS geospatial coordinate density.
- `POST /api/copilot/chat` — Conversational municipal civil engineering copilot powered by Gemini 3.8 Flash.
