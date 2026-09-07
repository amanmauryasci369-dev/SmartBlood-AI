# SmartBlood AI REST API Reference

All endpoints are prefixed with `/api/v1` and protected via JWT Bearer authentication where appropriate.

## 1. Authentication & RBAC
- `POST /api/v1/auth/register`: Register user with role (`ADMIN`, `BLOOD_BANK`, `HOSPITAL`, `DONOR`, `PATIENT`). Phone numbers are automatically masked.
- `POST /api/v1/auth/login`: Authenticate and receive JWT token with role claims.
- `GET /api/v1/auth/me`: Fetch current authenticated profile.

## 2. Facilities
- `GET /api/v1/facilities/blood-banks`: List accredited blood banks (filter by district).
- `POST /api/v1/facilities/blood-banks`: Add blood bank facility (Admin only).
- `GET /api/v1/facilities/hospitals`: List hospitals with trauma center capability flags.
- `POST /api/v1/facilities/hospitals`: Add hospital facility (Admin only).

## 3. Inventory & Adapters
- `GET /api/v1/inventory`: Retrieve stock with status filters (`REPORTED_AVAILABILITY` vs `CONFIRMED_AVAILABILITY`).
- `POST /api/v1/inventory/sync-eraktkosh`: Ingest synthetic e-RaktKosh compatible batch feed.
- `POST /api/v1/inventory/{id}/confirm`: Lab technician physical stock certification and reserve.
- `GET /api/v1/inventory/summary`: Total confirmed units, reported units, and units expiring within 48h.

## 4. Emergency Coordination & Routing
- `POST /api/v1/emergency/sos`: Hospital creates urgent blood request; triggers AI routing engine and returns ranked recommendations with explainability.
- `POST /api/v1/emergency/{id}/accept`: Authorize transfer and generate emergency transit ticket.
- `GET /api/v1/emergency/active-sos`: Retrieve active emergency tickets.

## 5. Predictive Analytics & Machine Learning
- `GET /api/v1/predictions/demand`: Scikit-Learn 7-day demand forecast with seasonal dengue outbreak multiplier.
- `GET /api/v1/predictions/expiry-risk`: Shelf-life FEFO risk assessment.
- `GET /api/v1/predictions/model-metrics`: Genuine test evaluation metrics (MAE, RMSE, R², Accuracy, F1).

## 6. Resource Optimization & Rebalancing
- `GET /api/v1/transfers/rebalance-proposals`: Inter-facility balancing proposals to prevent blood wastage.
- `GET /api/v1/transfers/logs`: Historical and in-transit transfer records.
