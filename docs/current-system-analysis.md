# SmartBlood AI — Current System Analysis

**Analysis Timestamp**: 2026-09-07T22:45:00+05:30  
**Scope**: Pre-extension baseline inspection for advanced shelf-life management, FEFO prioritization, wastage reduction, and hospital-to-hospital resource sharing network.

---

## 1. Existing Modules & Architecture

SmartBlood AI currently operates as a full-stack, modular clinical decision-support and blood logistics platform:

```
[Synthetic e-RaktKosh Feed]  [Blood Bank LIS]  [Hospital HIS Emergency]  [Donors]  [GIS]
                       │               │                 │                    │        │
                       └───────────────┼─────────────────┼────────────────────┴────────┘
                                       ▼
                     [Multi-Source DataSourceAdapter Layer]
                     (MockERaktKosh, BloodBank, Hospital, Donor, GIS)
                                       ▼
                       [Central Database: SQLite / PostgreSQL]
                                       ▼
                   ┌───────────────────┴───────────────────┐
                   ▼                                       ▼
      [Scikit-Learn ML Pipelines]            [Optimization & Routing Engine]
   - Demand Forecaster (RandomForest)        - Multi-Criteria Spatial Matcher
   - Expiry Risk Classifier (FEFO 3-Tier)    - Inter-Facility Spoilage Balancer
   - Anomaly Detector (IsolationForest)      - Transparent Donor Matcher
                   └───────────────────┬───────────────────┘
                                       ▼
               [Role Dashboards: Admin, Blood Bank, Hospital, Donor, Patient]
```

### Backend Components (`backend/app/`):
- **Core**: `config.py` (Pydantic v2 settings, enums for `UserRole`, `AvailabilityStatus`, `ComponentType`, `BloodGroup`), `database.py` (SQLAlchemy engine & sessionmaker), `security.py` (JWT & bcrypt), `deps.py` (RBAC dependencies).
- **Adapters (`app/adapters/`)**:
  - `DataSourceAdapter` (Base abstract class)
  - `MockERaktKoshAdapter` (Standardized e-RaktKosh sandbox ingestion)
  - `BloodBankAdapter` (Direct LIS integration)
  - `HospitalAdapter` (HIS emergency queue interface)
  - `DonorAdapter` (Privacy-preserving voluntary donor registry)
  - `GISAdapter` (Haversine distance & emergency speed model)
- **Services (`app/services/`)**:
  - `emergency_routing.py` (Haversine calculation, urban speed transit estimation, multi-factor scoring)
  - `optimization_engine.py` (Proactive rebalance planner matching expiring units with trauma centers)
- **ML Subsystem (`ml/` & `app/ml/`)**:
  - `MLInferenceEngine` (`ml/prediction/inference.py`): unified artifact loader for demand, expiry, anomaly models.
  - Exported Joblib artifacts in `ml/models/` with JSON evaluation metrics.

### Frontend Components (`frontend/src/`):
- **Framework**: Vite 8 + React 19 + TypeScript + Tailwind CSS v4 + Recharts + React Leaflet.
- **Top Bar**: `Navbar.tsx` with role switcher, system status indicator, search trigger, AI metrics modal trigger.
- **Geospatial**: `MapView.tsx` (Leaflet GIS with multi-city navigation, layer toggles, search, dark popups).
- **Role Portals**: `AdminDashboard.tsx`, `BloodBankDashboard.tsx`, `HospitalDashboard.tsx`, `DonorDashboard.tsx`, `PatientDashboard.tsx`.
- **Specialized Components**:
  - `AIInsightsSection.tsx` (Executive AI insight cards with severity tiers)
  - `AnalyticsCharts.tsx` (Transfusion velocity, blood group inventory, spoilage trends)
  - `DonorMatchingPanel.tsx` (Transparent multi-criteria donor ranking)
  - `BloodSearchModal.tsx` (Multi-parameter inventory search)
  - `EmergencySOSModal.tsx` (Clinical SOS workflow)
  - `ModelMetricsModal.tsx` (Empirical Scikit-learn test evaluation metrics)
  - `LiveDemoSimulator.tsx` (15-step simulated scenario runner)
  - `WhySmartBloodPage.tsx` (10-point architectural advantage matrix)

---

## 2. Existing Database Tables

Inspected directly via SQLite master query on `smartblood.db`:

| Table Name | Key Columns | Current Purpose |
| :--- | :--- | :--- |
| `users` | `id, email, hashed_password, full_name, role, is_active, facility_type, facility_id` | Authentication & role-based access control (Admin, Blood Bank, Hospital, Donor, Patient). |
| `blood_banks` | `id, name, license_number, district, state, latitude, longitude, contact_number, storage_capacity, cold_chain_verified, is_active` | Licensed blood transfusion centers & regional storage hubs. |
| `hospitals` | `id, name, license_number, district, state, latitude, longitude, contact_number, has_trauma_center, bed_capacity, is_active` | Healthcare facilities, general hospitals, and Level-1 apex trauma centers. |
| `blood_inventory` | `id, facility_id, blood_group, component, units_available, batch_number, status, collected_date, expiry_date, temperature_celsius, is_quarantined, last_verified_by_user_id, verified_at, source_tag` | Granular unit batch tracking with 4-tier availability taxonomy (`REPORTED`, `CONFIRMED`, `PREDICTED`, `RECOMMENDED`). |
| `emergency_requests` | `id, hospital_id, blood_group, component, units_required, urgency_level, clinical_notes, status, allocated_blood_bank_id, allocated_units, created_at, resolved_at` | Hospital emergency SOS requests and triage states. |
| `transfer_logs` | `id, emergency_request_id, source_bank_id, destination_hospital_id, blood_group, component, units, transfer_reason, distance_km, estimated_transit_mins, status, dispatch_token` | Inter-facility transfer receipts and transit tokens. |
| `donor_profiles` | `id, user_id, public_donor_tag, blood_group, latitude, longitude, last_donation_date, is_available, eligible_after` | Masked donor pool preserving donor privacy (`DONOR-DEL-0001`). |
| `donor_matches` | `id, emergency_request_id, donor_id, match_score, compatibility_score, proximity_score, distance_km, notification_status` | Multi-factor donor match ranking logs. |
| `shortage_predictions`| `id, blood_bank_id, blood_group, component, projected_shortage_units, risk_level, equation_breakdown` | Quantitative shortage balance equation storage. |
| `alerts` | `id, severity, title, message, category, facility_id, is_read, created_at` | System-wide alert stream (`CRITICAL`, `WARNING`, `ATTENTION`, `OPPORTUNITY`). |
| `audit_logs` | `id, user_id, action, resource_type, resource_id, details, ip_address, timestamp` | Immutable audit trail for all clinical transactions. |

---

## 3. Existing APIs

Registered under `/api/v1` in `backend/app/api/v1/api.py`:

### Authentication (`/auth`):
- `POST /auth/register` — Register new user
- `POST /auth/login` — OAuth2 password login generating JWT
- `GET /auth/me` — Current authenticated user profile

### Facilities (`/facilities`):
- `GET /facilities/blood-banks` — List blood banks with filtering
- `GET /facilities/hospitals` — List hospitals with trauma flags

### Blood Inventory (`/inventory`):
- `GET /inventory` — Query inventory batches with status, facility, component filters
- `POST /inventory` — Create direct unit batch
- `POST /inventory/sync-eraktkosh` — Ingest synthetic e-RaktKosh compatible feed
- `POST /inventory/{item_id}/confirm` — Laboratory certification of reported inventory
- `GET /inventory/summary` — Aggregated inventory counts by blood group

### Emergency SOS (`/emergency`):
- `POST /emergency/sos` — Trigger emergency SOS and produce AI-ranked blood bank options
- `POST /emergency/{request_id}/accept` — Accept recommendation and generate transit token
- `GET /emergency/active-sos` — List unresolved SOS requests

### Predictive Analytics & ML (`/predictions`):
- `GET /predictions/demand` — Multi-horizon demand forecast (1d/3d/7d/30d)
- `GET /predictions/expiry-risk` — FEFO 3-tier expiry risk classification
- `GET /predictions/model-metrics` — Authentic empirical Scikit-learn test evaluation metrics

### Inter-Facility Transfers (`/transfers`):
- `GET /transfers/rebalance-proposals` — Algorithmic wastage prevention redistribution proposals
- `GET /transfers/logs` — History of dispatched transfers

### Intelligence & Insights (`/intel`):
- `POST /intel/blood/search` — Fast multi-parameter blood search (Module 1)
- `GET /intel/shortage-risk` — Quantitative shortage risk equation evaluation (Module 4)
- `GET /intel/donor-matches` — Privacy-preserving donor matching with score breakdowns (Module 7)
- `GET /intel/anomalies` — Transfusion consumption surge / hoarding detector (Module 10)
- `GET /intel/alerts` — Categorized smart alerts (Module 11)
- `GET /intel/insights` — AI synthesized insight cards (Module 17)
- `GET /intel/analytics` — Longitudinal collections, issues, and expiries trend data (Module 12)
- `POST /intel/demo/run-scenario` — Scenario trigger for live simulation (Module 20)

---

## 4. Existing Frontend Pages & Navigation

Currently controlled in `frontend/src/App.tsx` and `Navbar.tsx`:
- `activeTab === 'dashboard'`:
  - **GIS Map View** (`MapView.tsx`): 8 metropolitan clusters, basemaps, filters, transit line.
  - **AI Insights Section** (`AIInsightsSection.tsx`): Live synthesized clinical cards.
  - **Role-specific Portals**:
    - `ADMIN`: Global overview, stock breakdown, rebalance proposals, analytics charts.
    - `BLOOD_BANK`: Local inventory manager, e-RaktKosh sync button, laboratory verify button.
    - `HOSPITAL`: Active SOS monitor, emergency SOS trigger modal.
    - `DONOR`: Masked eligibility status, donor appointment booking card.
    - `PATIENT`: Patient blood availability finder and requisition status.
- `activeTab === 'why-smartblood'`:
  - **Strategic Architectural Advantage Matrix** (`WhySmartBloodPage.tsx`): 10-point differentiation against legacy portals.
- **Modals**:
  - `EmergencySOSModal`: Multi-step clinical SOS workflow.
  - `BloodSearchModal`: Geodesic search modal with distance slider.
  - `ModelMetricsModal`: Scikit-learn test metrics table with zero invented numbers.
- **Simulator**:
  - `LiveDemoSimulator`: Floating 15-step autonomous scenario runner.

---

## 5. Existing AI Functionality

1. **Demand Forecaster**: Trained `RandomForestRegressor` on 20,000 records ($MAE = 7.73$, $RMSE = 9.71$, $R^2 = 0.342$). Multi-horizon extrapolation ($1\text{d}, 3\text{d}, 7\text{d}, 30\text{d}$).
2. **FEFO Shelf-Life Classifier**: Trained `RandomForestClassifier` triaging units into `LOW_RISK`, `MEDIUM_RISK`, `HIGH_RISK` based on days remaining, component type, and temperature.
3. **Anomaly Detector**: `IsolationForest` detecting unusual spikes in transfusion consumption ($5\%$ contamination rate).
4. **Quantitative Shortage Equation**:
   $$\text{Projected Stock} = \text{Current Stock} + \text{Incoming Supply} - \text{Predicted Demand} - \text{Expected Expiry Loss}$$
5. **Donor Ranking Algorithm**:
   $$\text{Score} = 0.30 \cdot \text{Compat} + 0.25 \cdot \text{Elig} + 0.20 \cdot \text{Proximity} + 0.25 \cdot \text{RespProb}$$

---

## 6. What Needs Modification

| Area | Current Implementation | Required Modification |
| :--- | :--- | :--- |
| `BloodInventory` Model | Has `units_available`, `collected_date`, `expiry_date`. | Add `reserved_units`, `issued_units`, `expired_units`, `processing_date` (nullable) to support granular lifecycle tracking while maintaining backward compatibility with `units_available`. |
| Inventory API | Standard filter on status, component, group. | Add `/api/inventory/fefo` endpoint returning strictly ordered FEFO priority queues with explanation reasons. |
| Expiry API | Single-unit prediction on `/predictions/expiry-risk`. | Add high-level `/api/expiry-risk` returning facility-wide inventory categorized by configurable thresholds (`SAFE`, `APPROACHING`, `HIGH`, `EXPIRED`). |
| Emergency SOS Routing | Routes requests only to blood banks. | Extend routing to search **both** blood banks and **Hospital Network** (H2H sharing), incorporating real-time donor matching and GIS transit times in one unified recommendation score. |
| Navbar & App Tabs | Only has `'dashboard'` and `'why-smartblood'`. | Add navigation tabs for `/expiry-risk`, `/wastage-analytics`, `/hospital-network`, `/hospital-communications`, and `/admin/configuration`. |
| Main Dashboard | Shows general stock & rebalancing. | Add dedicated KPI widgets for Expiry Risk, Wastage Risk, Hospital Requests, Predicted Shortages, and Integrated AI Recommendations. |

---

## 7. What Needs to Be Added

### New Database Tables:
1. `component_shelf_life_rules`: Configurable shelf-life rules per component (RBC: 35-42 days @ 2-6°C, Platelets: 5 days @ 20-24°C with agitation, FFP: 365 days @ ≤-18°C, Cryoprecipitate: 365 days @ ≤-18°C, Whole Blood: 28-35 days).
2. `wastage_records`: Granular discard tracking by reason (`EXPIRY`, `TTI_REACTIVE`, `DAMAGED`, `QUALITY_CONTROL`, `OTHER`).
3. `hospital_blood_requests`: Hospital-to-Hospital peer-sharing requests with lifecycle (`PENDING`, `SEARCHING`, `MATCH_FOUND`, `VERIFICATION_REQUIRED`, `ACCEPTED`, `REJECTED`, `CONFIRMED`, `FULFILLED`, `CANCELLED`).
4. `hospital_request_messages`: Inter-hospital clinical communication audit thread.
5. `system_configurations`: Dynamic admin configuration parameters for thresholds (stale inventory, expiry warning days, shortage safety stock, wastage risk).

### New Backend Services & APIs:
1. `FEFOService` (`app/services/fefo_service.py`): Prioritizes units with earliest expiry date, computes `days_to_expiry`, and assigns `SAFE`, `APPROACHING_EXPIRY`, `HIGH_EXPIRY_RISK`, `EXPIRED`.
2. `WastageEngine` (`app/services/wastage_engine.py`): Calculates utilization rate ($\frac{\text{Issued}}{\text{Collected}}$), wastage rate ($\frac{\text{Discarded}}{\text{Collected}}$), and generates proactive wastage reduction advisories (`PRIORITIZE_UTILIZATION`, `MONITOR`, `HIGH_EXPIRY_RISK`, `CONSIDER_AUTHORIZED_REDISTRIBUTION`, `URGENT_REVIEW`).
3. `WastagePredictionModel` (`ml/prediction/wastage_model.py`): Baseline risk classifier evaluating current inventory, days to expiry, historical utilization, and predicted demand, reporting transparent metrics without inventing accuracy.
4. `HospitalNetworkService` (`app/services/hospital_network.py`): Manages H2H blood requisitions, acceptance, clinical verification, fulfillment, and message audit threads.
5. `IntelligentSourceRankingService` (`app/services/source_ranking.py`): Unified multi-source ranking combining blood banks, peer hospitals, donor pool, GIS transit, and ML demand projections into a single clinical decision-support recommendation.
6. New API routers:
   - `GET /api/inventory/fefo`
   - `GET /api/expiry-risk`
   - `GET /api/wastage/analytics`
   - `POST /api/wastage/record`
   - `GET /api/wastage/recommendations`
   - `POST /api/hospital-requests`
   - `GET /api/hospital-requests`
   - `GET /api/hospital-requests/{id}`
   - `POST /api/hospital-requests/{id}/accept`
   - `POST /api/hospital-requests/{id}/reject`
   - `POST /api/hospital-requests/{id}/confirm`
   - `POST /api/hospital-requests/{id}/fulfill`
   - `GET /api/hospital-communications/{request_id}`
   - `POST /api/hospital-communications/{request_id}/message`
   - `GET /api/admin/configuration`
   - `PUT /api/admin/configuration`
   - `POST /api/shelf-life-rules`
   - `GET /api/shelf-life-rules`

### New Frontend Pages / Modules:
1. `ExpiryRiskDashboard.tsx` (`/expiry-risk`): KPIs (Total, Expiring Soon, High Risk, Expired), Recharts risk breakdown charts, and FEFO priority table.
2. `WastageAnalyticsPage.tsx` (`/wastage-analytics`): Collection vs issue vs discard curves, utilization rate, wastage rate, discard reason filters, and research reference section with explicit citations.
3. `HospitalNetworkPage.tsx` (`/hospital-network`): Peer hospital discovery, reported vs confirmed availability matrix, active incoming/outgoing requisitions.
4. `HospitalCommunicationsPage.tsx` (`/hospital-communications`): Secure inter-facility clinical communication thread with audit trail and zero PII exposure.
5. `AdminConfigurationPage.tsx` (`/admin/configuration`): Admin slider and threshold configurator for system safety stock, expiry windows, and alert sensitivity.
6. Updated `MainDashboard`: Integrated status widgets for expiry risk, wastage risk, hospital requests, and unified AI recommendations.
7. Updated `LiveDemoSimulator`: End-to-end 19-step scenario showcasing Hospital A request, H2H discovery, FEFO triage, donor match, GIS routing, authorized acceptance, fulfillment, and inventory update.
