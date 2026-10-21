# GENQUANTAA ADLC — Setup and Execution Guide

## Overview
GENQUANTAA ADLC is an enterprise-grade AI Development Lifecycle Orchestration Platform designed to manage AI systems across 8 lifecycle stages with human governance gates, specialist agents, automated test verification, and complete audit traceability.

---

## Prerequisites (Direct Local Execution — No Docker Required)
- **Node.js**: v18+ (tested on v24.19) & npm
- **Python**: 3.11+ (tested on 3.12.4)
- **MongoDB**: MongoDB Atlas connection (provided in `.env`) or automatic resilient local fallback.

---

## 1. Environment Setup

Copy `.env.example` to `.env` (already pre-configured with Atlas URI and Gemini key):
```bash
cp .env.example .env
```

Key configurations in `.env`:
- `MONGODB_URI`: Pre-configured with live MongoDB Atlas connection string.
- `LLM_PROVIDER`: `gemini` (with configured key) or `mock` for deterministic development.
- `APP_ENV`: `development`
- `STORAGE_BACKEND`: `local`

---

## 2. Backend Execution

From the repository root:
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- Interactive OpenAPI Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health check: [http://localhost:8000/health](http://localhost:8000/health)

---

## 3. Frontend Execution

From the repository root:
```bash
cd frontend
npm install
npm run dev
```
- Open browser: [http://localhost:5173](http://localhost:5173)

---

## 4. Running Backend Tests

```bash
cd backend
pytest tests/ -v
```

---

## 5. Pilot Project Demonstration: GxP CSV Copilot

1. Navigate to the dashboard at [http://localhost:5173](http://localhost:5173).
2. Click **"Launch GxP CSV Copilot Pilot"**.
3. View the seeded pilot project with full metadata, intended use statement (21 CFR Part 11 / ALCOA+), and 8-stage lifecycle tracker.
4. Advance stages through governed approval gates.
