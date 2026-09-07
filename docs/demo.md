# SIH 2026 Demonstration Guide: SmartBlood AI

## Executive Summary for Judges
- **Problem Statement ID**: 26202
- **Theme**: Smart Automation
- **Core Pitch**: SmartBlood AI transforms fragmented blood logistics into an intelligent, proactive, and predictive coordination network. It prevents wastage, predicts acute shortages days in advance, and coordinates life-saving emergency dispatches with complete explainability.

---

## Pre-Configured Demo Personas
Judges can instantly evaluate all 5 roles using the top navigation role switcher:

| Role | Demo Email | Password | Key Showcase |
|---|---|---|---|
| **Regional Admin** | `admin@smartblood.gov` | `AdminPassword123!` | Command hub, e-RaktKosh adapter sync, proactive wastage balancing proposals |
| **Blood Bank Officer** | `bloodbank@redcross.org` | `BankPassword123!` | Inventory certification, physical verification workflow, cold chain audit |
| **Hospital / Trauma** | `trauma@aiims.edu` | `HospitalPassword123!` | Emergency Blood SOS trigger, 7-day demand ML simulator, active transit tracking |
| **Verified Donor** | `donor.priya@example.com` | `DonorPassword123!` | Privacy-masked identity (`DONOR-DL-0004`), emergency opt-in, donation impact |
| **Patient / Seeker** | `patient.rahul@example.com` | `PatientPassword123!` | Ethical verified blood search (no raw donor phone exposure), 24x7 helplines |

---

## 15-Step SIH Live Demonstration Scenario
1. Switch role to **Trauma & Hospital** (`trauma@aiims.edu`).
2. Click **"Trigger Emergency Blood SOS"**.
3. Select **Blood Group: O- (Universal RBC)**, **Quantity: 4 Units**, **Urgency: Critical Immediate**.
4. Click **"Execute Emergency AI Routing"**.
5. Observe the AI scoring candidates using confirmed stock, Haversine distance, and cold chain.
6. Note that **Safdarjung Regional Blood Centre** ranks #1 because it has confirmed O- stock only 0.4 km away.
7. Expand the **AI Explainability Card** to show the judges the transparent decision-support reasoning (Rule 14).
8. Point out the **Clinical Advisory Disclaimer** (Rule 9).
9. Click **"Authorize & Dispatch 4 Units Now"**.
10. Notice the emergency dispatch corridor polyline appearing live on the Leaflet OpenStreetMap!
11. Switch to **Regional Admin** and click **"Sync e-RaktKosh Synthetic Feed"** to demonstrate multi-source ingestion.
12. Inspect the **"Proactive Inter-Facility Balancing Engine"** showing units expiring in <5 days transferred to trauma centers to prevent spoilage.
13. Switch to **Blood Bank Officer** and demonstrate certifying an unconfirmed batch into `CONFIRMED_AVAILABILITY`.
14. Open **"AI Model Metrics"** in the top navigation to verify authentic Scikit-Learn evaluation scores (MAE, RMSE, Accuracy).
15. Conclude with the **"Why SmartBlood AI?"** differentiation overview.
