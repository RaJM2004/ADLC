# GENQUANTAA ADLC — AI Development Lifecycle Platform

![Version](https://img.shields.io/badge/version-0.1.0--mvp-purple)
![License](https://img.shields.io/badge/license-Proprietary-blue)
![Architecture](https://img.shields.io/badge/architecture-FastAPI%20%2B%20React%20%2B%20MongoDB-teal)
![Status](https://img.shields.io/badge/stage-Milestone%201%20Completed-success)

> **Enterprise AI Engineering Orchestration Platform** accelerating the planning, design, development, testing, evaluation, governance, deployment, monitoring, and continuous improvement of AI applications.

---

> [!NOTE]
> **Prototype & GxP Qualification Notice**:
> GENQUANTAA ADLC is an enterprise prototype designed to demonstrate governed AI lifecycles. It is not claimed to be GxP validated, compliant by default, or qualified for regulated production use without independent organizational validation.

---

## 1. Feature Highlights (Milestone 1 — Foundation)

- **8 Configurable Lifecycle Stages**:
  1. Discovery & Project Intake
  2. Requirements, Risk Assessment & Planning
  3. Architecture & Data Design
  4. Development & Implementation
  5. Data Pipelines & Model Development
  6. Verification, Testing & AI Evaluation
  7. Release Readiness & Deployment
  8. Monitoring, Optimization & Retirement
- **11 Specialist Agent Registry**:
  - `agent_01_intake_requirements` (Active MVP)
  - `agent_02_planning_task` (Active MVP)
  - `agent_07_qa_test` (Active MVP)
  - `agent_08_ai_risk_compliance` (Active MVP)
  - 7 Planned Specialist Agents (Architecture, Data Eng, Software Dev, Model Dev, Security, Release, Monitoring)
- **Authoritative State Machine & Governance Gates**:
  - Controlled lifecycle transitions with prerequisite validation.
  - Human reviewer sign-offs preventing autonomous agent bypass.
- **Resilient MongoDB Data Layer**:
  - Configured with live **MongoDB Atlas** (`mongodb+srv://...`).
  - Automatic thread-safe embedded persistent JSON fallback for offline environments.
- **AI Model Provider Abstraction**:
  - Google Gemini API (`gemini-1.5-flash`) integration with secret redaction.
  - Mock Provider adapter for deterministic offline runs.
- **Enterprise SaaS Frontend**:
  - React 18, TypeScript, Tailwind CSS, Lucide icons, Vite.
  - Dedicated 14-section navigation matching enterprise specifications.
  - Interactive stage timeline, KPI cards, and 1-click GxP Pilot launch.

---

## 2. Pilot Project: End-to-End CSV Copilot for GxP ADLC

The platform includes a pre-configured pilot project specifically designed to demonstrate the complete 8-step vertical slice:
1. **Intake & Document Upload**: Ingest clinical protocol and data-validation specifications.
2. **Text Extraction & Requirements Drafting (Agent 1)**: Automatic extraction of functional, regulatory, and data-integrity requirements.
3. **Human Review & Approval**: Quality assurance review gate.
4. **Task & Test Generation (Agent 2)**: Automated work breakdown structure and test specifications.
5. **Deterministic Test Execution (Agent 7)**: Real test suite execution on CSV validation logic.
6. **AI Risk Assessment & Compliance Drafting (Agent 8)**: Hazard identification and required-evidence checklists.
7. **Traceability Matrix**: Complete linkage between requirements, tasks, test runs, and evidence.
8. **Summary Dashboard & Reports**: Exportable project lifecycle status.

---

## 3. Quickstart (Local Direct Execution — No Docker Required)

### Step 1: Clone and Configure Environment
The repository root contains `.env` pre-configured for development:
```bash
# Check or edit configuration
cat .env
```

### Step 2: Start the Backend Service (FastAPI)
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
- API Health Check: [http://localhost:8000/health](http://localhost:8000/health)
- Interactive OpenAPI Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Step 3: Start the Frontend Application (Vite + React)
```bash
cd frontend
npm install
npm run dev
```
- Open browser: [http://localhost:5173](http://localhost:5173)

### Step 4: Run Automated Tests
```bash
cd backend
python -m pytest tests/ -v
```

---

## 4. Architecture and Directory Structure

```
genquantaa-adlc/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── endpoints/
│   │   │       │   ├── health.py
│   │   │       │   ├── projects.py
│   │   │       │   └── system.py
│   │   │       └── api.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── logging.py
│   │   │   └── security.py
│   │   ├── database/
│   │   │   └── client.py
│   │   ├── models/
│   │   │   └── enums.py
│   │   ├── repositories/
│   │   │   └── project_repository.py
│   │   ├── schemas/
│   │   │   ├── project.py
│   │   │   └── system.py
│   │   ├── services/
│   │   │   └── project_service.py
│   │   └── main.py
│   ├── tests/
│   │   └── test_milestone_1.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/client.ts
│   │   ├── components/
│   │   │   ├── common/StatusChip.tsx
│   │   │   └── layout/AppLayout.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Projects.tsx
│   │   │   ├── ProjectWorkspace.tsx
│   │   │   └── PlaceholderView.tsx
│   │   ├── types/index.ts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── docs/
│   ├── architecture.md
│   ├── agent-specifications.md
│   ├── data-model.md
│   ├── setup-guide.md
│   └── demo-script.md
├── storage/
│   ├── uploads/
│   └── db/
├── .env.example
├── .env
├── .gitignore
└── README.md
```

---

## 5. Milestone Status & Roadmap

| Milestone | Scope | Status |
| :--- | :--- | :--- |
| **Milestone 1 — Foundation** | Project scaffolding, MongoDB Atlas / resilient store, FastAPI API v1, React 18 / Tailwind / Lucide UI, 8-stage state machine, project CRUD, pilot project seeding | **Completed & Verified** |
| **Milestone 2 — Intake & Requirements** | Multi-format document parser (PDF, DOCX, TXT, CSV), Agent 1 LLM extraction (Gemini/Mock), Human approval gates | Next |
| **Milestone 3 — Planning & Orchestration** | Agent 2 task & test breakdown, dependency graph, workflow run telemetry | Next |
| **Milestone 4 — QA, Evaluation & Evidence** | Agent 7 deterministic test runner, Agent 8 risk drafting, Traceability matrix, Evidence report | Next |
| **Milestone 5 — Full Pilot Slice & Hardening** | End-to-end workflow execution, report generation, audit exports | Next |
