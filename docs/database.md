# Database Design & Schema Documentation

## Entity-Relationship Overview
The SmartBlood AI database manages the complete lifecycle of blood components, facilities, requests, predictive analytics, and compliance audit trails.

### Core Tables & Relationships
- **`users`**: System accounts with role-based access (`ADMIN`, `BLOOD_BANK`, `HOSPITAL`, `DONOR`, `PATIENT`). Phone numbers are masked for privacy compliance.
- **`blood_banks`**: Licensed transfusion centers with geocoded coordinates, storage capacity, and cold-chain certification.
- **`hospitals`**: Healthcare facilities with trauma center indicators and bed capacities.
- **`donors`**: Privacy-preserving donor profiles with anonymized public tags, last donation dates, eligibility status, and emergency opt-ins.
- **`blood_inventory`**: Individual blood component batches with collection date, expiry date, status (`REPORTED`, `CONFIRMED`, `RESERVED`), and storage temperature.
- **`blood_requests`**: Emergency and planned clinical requests with triage urgency (`CRITICAL_IMMEDIATE`, `URGENT_UNDER_4H`, `ELECTIVE`).
- **`demand_history`**: Longitudinal daily consumption records used for training forecasting models.
- **`forecasts`**: 1-day, 3-day, 7-day, and 30-day predicted demand outputs.
- **`shortage_predictions`**: Calculated risk levels (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) using the balance formula.
- **`donor_matches`**: Ranked compatible donor candidates with transparent score breakdowns.
- **`redistribution_recommendations`**: Inter-facility balancing proposals to prevent blood wastage before expiration.
- **`alerts`**: Smart notifications for predicted shortages, critical stock, and anomalies.
- **`audit_logs`**: Immutable audit records for authentication, inventory confirmations, and dispatches.
