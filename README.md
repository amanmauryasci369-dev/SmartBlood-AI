# SmartBlood AI
### AI-Powered Intelligent Blood Resource Management and Emergency Coordination System
**Smart India Hackathon (SIH 2026) | Problem Statement ID: 26202**  
*Organization: AICTE, MIC-Student Innovation | Theme: Smart Automation*

---

## Overview
SmartBlood AI is a production-grade, privacy-first, intelligent decision-support platform designed to eliminate acute blood shortages, prevent blood component spoilage, and coordinate life-saving emergency dispatches across regional healthcare networks.

It operates as an intelligent optimization and decision-support layer around existing national infrastructure (such as e-RaktKosh), integrating multi-source data, geospatial GIS, Scikit-Learn machine learning, regulatory shelf-life rules, FEFO triage, wastage analytics, and hospital-to-hospital resource sharing.

---

## 5 Core Pillars (SIH PS 26202)
1. **Intelligent Use of Resources**: First-Expire-First-Out (FEFO) inventory prioritization ($A \to B \to C$) and proactive inter-facility rebalancing transfer near-expiry blood from low-burn peripheral centers to apex trauma facilities.
2. **Artificial Intelligence**: Genuine Scikit-Learn pipelines for forward demand forecasting, shortage risk modeling, FEFO expiry risk classification, statistical anomaly detection, and transparent baseline wastage risk prediction.
3. **Multiple Data Sources**: Pluggable adapter architecture ingesting synthetic e-RaktKosh compatible feeds, hospital HIS emergency queues, blood bank LIS registries, privacy-masked voluntary donors, and OpenStreetMap GIS.
4. **Valuable Actionable Insights**: Severity-tagged alerts (`CRITICAL`, `HIGH`, `ATTENTION`, `OPPORTUNITY`), hemovigilance discard etiology tracking, and explainable justifications for every clinical recommendation.
5. **Smart Automation**: Unified multi-source emergency ranking (Blood Banks, Peer Hospitals, Donors, GIS transit) in $<200\text{ ms}$, automated peer requisition state machines, and a 1-click autonomous 19-step SIH demo scenario.

---

## Key Modules & Navigation Views
- **Command Center (`/`)**: Interactive Leaflet GIS map with 8 metropolitan clusters, layer toggles, active transit corridors, executive AI insight stream, and role-specific dashboards.
- **Expiry & FEFO Dashboard (`/expiry-risk`)**: 4 KPI counters, Recharts risk breakdown curves by group/component/bank, days remaining decay histogram, and strictly sorted FEFO priority queue table.
- **Wastage Analytics (`/wastage-analytics`)**: Utilization rate %, wastage rate %, multi-cause discard breakdown (Expiry, TTI Reactive, Damaged, QC), longitudinal collection-transfusion-discard area curves, proactive reduction advisories, and demarcated literature benchmarks.
- **Hospital Network (`/hospital-network`)**: Peer-to-peer hospital resource sharing network. Discovered nearby hospitals and blood banks with clear availability tags (`REPORTED`, `CONFIRMED`, `RESERVED`) and active requisition workflow.
- **Hospital Communications (`/hospital-communications`)**: Secure clinical coordination channel with full message audit trail and zero donor/patient PII exposure.
- **Admin Configuration (`/admin/configuration`)**: Dynamic slider configurator for system safety thresholds (stale inventory hours, expiry warning days, shortage buffer multiplier, wastage risk sensitivity).
- **19-Step SIH Demo Simulator**: Floating autonomous scenario runner executing the complete emergency workflow from initial SOS to GIS routing and inventory decrement.

---

## Technology Stack
- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Leaflet + OpenStreetMap, Recharts, Lucide Icons.
- **Backend**: Python 3.12, FastAPI, SQLAlchemy 2.0, Pydantic v2, Pytest.
- **Database**: SQLite (local development) / PostgreSQL (production compatible).
- **Data & ML**: Pandas, NumPy, Scikit-learn, Joblib.
- **Security**: JWT Authentication (HS256), Bcrypt password hashing, Role-Based Access Control (RBAC).

---

## Quick Start Guide

### 1. Prerequisites
- Python 3.12+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# In project root
source backend/.venv/bin/activate
pip install -r backend/requirements.txt

# Run database migrations and seed data
PYTHONPATH=.:backend backend/.venv/bin/python backend/app/seed.py

# Run comprehensive test suite
PYTHONPATH=.:backend backend/.venv/bin/pytest tests/ -v

# Start FastAPI backend server (Runs on http://127.0.0.1:8000)
PYTHONPATH=.:backend backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Frontend Setup
```bash
# In project root
cd frontend
npm install
npm run build
npm run dev -- --host 127.0.0.1 --port 5173
```
Open **`http://127.0.0.1:5173`** in your browser.

---

## Pre-Configured Demo Accounts for SIH Judging
Use the **Role Dropdown** in the top navigation bar to switch personas:
- **Regional Admin**: `admin@smartblood.gov` / `AdminPassword123!`
- **Blood Bank Officer**: `bloodbank@redcross.org` / `BankPassword123!`
- **Hospital / Trauma Chief**: `trauma@aiims.edu` / `HospitalPassword123!`
- **Verified Donor**: `donor.priya@example.com` / `DonorPassword123!`
- **Patient / Seeker**: `patient.rahul@example.com` / `PatientPassword123!`

---

## Documentation Suite
- [Current System Analysis](file:///Users/amanmaurya/Desktop/SmartBlood-AI/docs/current-system-analysis.md)
- [Blood Shelf-Life & Regulatory Standards](file:///Users/amanmaurya/Desktop/SmartBlood-AI/docs/shelf-life.md)
- [FEFO Inventory Prioritization](file:///Users/amanmaurya/Desktop/SmartBlood-AI/docs/fefo.md)
- [Wastage Management & Reduction](file:///Users/amanmaurya/Desktop/SmartBlood-AI/docs/wastage-management.md)
- [Hospital-to-Hospital Resource Network](file:///Users/amanmaurya/Desktop/SmartBlood-AI/docs/hospital-network.md)
- [Unified Emergency Workflow](file:///Users/amanmaurya/Desktop/SmartBlood-AI/docs/emergency-workflow.md)
- [AI Models & Decision Support Integration](file:///Users/amanmaurya/Desktop/SmartBlood-AI/docs/ai-integration.md)
- [SIH 26202 Problem Alignment](file:///Users/amanmaurya/Desktop/SmartBlood-AI/docs/sih-26202-alignment.md)
- [REST API Reference](file:///Users/amanmaurya/Desktop/SmartBlood-AI/docs/api.md)
- [Database Schema & ERD](file:///Users/amanmaurya/Desktop/SmartBlood-AI/docs/database.md)
- [15/19-Step Judging Demo Script](file:///Users/amanmaurya/Desktop/SmartBlood-AI/docs/demo.md)
