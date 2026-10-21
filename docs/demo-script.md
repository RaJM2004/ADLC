# GENQUANTAA ADLC — Pilot Demonstration Script
## Pilot Project: End-to-End CSV Copilot for GxP ADLC

### Objective
Demonstrate the governance and orchestration capabilities of the GENQUANTAA ADLC platform using the GxP CSV Copilot pilot.

---

### Step 1: Open the Application Dashboard
1. Ensure the backend is active at `http://localhost:8000` and frontend at `http://localhost:5173`.
2. Open [http://localhost:5173](http://localhost:5173).
3. Observe:
   - System status indicators: Backend Online, MongoDB Atlas connected.
   - 8 Lifecycle Stages overview.
   - Specialist Agent Registry status (11 registered, 4 active MVP).
   - "Featured Pilot Project" highlight card.

---

### Step 2: Initialize the Pilot Project
1. Click **"Launch GxP CSV Copilot Pilot"**.
2. Notice the project is initialized in the authoritative database with:
   - **Name**: `End-to-End CSV Copilot for GxP ADLC`
   - **Intended Use**: `Assist clinical data managers in verifying clinical trial dataset integrity against 21 CFR Part 11 and ALCOA+ data integrity guidelines.`
   - **Domain**: `GxP Clinical Data Engineering`
   - **Risk Tier**: `High`
   - **Initial Stage**: `Discovery & Intake` (Draft/Running)

---

### Step 3: Explore the Project Workspace
1. View the **8-Stage ADLC Lifecycle Pipeline**:
   - Stage 1: Discovery & Intake
   - Stage 2: Requirements & Planning
   - Stage 3: Architecture & Design
   - Stage 4: Development
   - Stage 5: Data & Model Dev
   - Stage 6: Verification & Testing
   - Stage 7: Release Readiness & Deployment
   - Stage 8: Monitoring & Optimization
2. Click through each stage tab to review prerequisites, assigned specialist agent, and review requirements.

---

### Step 4: Advance the Lifecycle Stage Gate
1. Click **"Advance Stage Gate"**.
2. Observe the orchestrator state transition:
   - Stage 1 (`Discovery & Intake`) transitions to `COMPLETED` with timestamp and reviewer attribution.
   - Stage 2 (`Requirements & Planning`) transitions to `RUNNING` with verified prerequisites.
   - The authoritative project state updates live in MongoDB Atlas.

---

### Step 5: Explore the 14-Section Governance Navigation
1. Use the left sidebar to navigate across all lifecycle dimensions:
   - **Requirements (Agent 1)**
   - **Tasks (Agent 2)**
   - **AI Agents (11 Agent Definitions)**
   - **Testing & Evaluations (Agent 7)**
   - **Risks & Compliance (Agent 8)**
   - **Traceability Matrix**
   - **Evidence & Reports**
   - **Approvals & Governance Gates**
2. Notice every section links back directly to the active GxP pilot workflow.
