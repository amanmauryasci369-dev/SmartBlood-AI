# SmartBlood AI Architecture & System Specification

## SIH Problem Statement: 26202
**Theme**: Smart Automation  
**Category**: Student Innovation — Intelligent use of resources combining AI, multiple data sources, and actionable insights.

---

## 1. High-Level Architecture

SmartBlood AI acts as an **intelligent decision-support and resource-optimization layer** around national blood infrastructure (such as e-RaktKosh):

```
+----------------------------------------------------------------------------------+
|                              MULTI-SOURCE INGESTION                              |
|   e-RaktKosh Feed   |  Blood Banks  |  Hospitals  |  Donors  |  Historical / GIS  |
+----------------------------------------------------------------------------------+
                                        |
                                        v
+----------------------------------------------------------------------------------+
|                            DATA ADAPTER LAYER (ETL)                              |
|       DataSourceAdapter (MockERaktKosh, BloodBank, Hospital, Donor, GIS)          |
|    Schema Normalization, Provenance Tagging & PII Sanitization (Rule 7 & 8)      |
+----------------------------------------------------------------------------------+
                                        |
                                        v
+----------------------------------------------------------------------------------+
|                           CENTRAL DATABASE (PostgreSQL)                          |
|   Facilities, Inventory, Requests, Forecasts, Shortage, Donors, Audit Logs       |
+----------------------------------------------------------------------------------+
                                        |
                                        v
+----------------------------------------------------------------------------------+
|                              AI & DECISION ENGINES                               |
|  - 1d/3d/7d/30d Demand Forecasting (Random Forest / Gradient Boosting)           |
|  - Stock Shortage Equation: Projected = Current + Inflow - Demand - Expiry Loss  |
|  - FEFO (First-Expire-First-Out) Spoilage Prevention Engine                      |
|  - Transparent Donor Matcher: Score = Compatibility+Eligibility+Dist+Availability|
|  - Statistical & Isolation-based Outlier / Anomaly Detection                     |
+----------------------------------------------------------------------------------+
                                        |
                                        v
+----------------------------------------------------------------------------------+
|                        ACTIONABLE OUTPUTS & DISPATCH                             |
|  Role Dashboards (Admin, Bank, Hosp, Donor, Patient) | Smart Alerts | 1-Click SOS |
+----------------------------------------------------------------------------------+
```

---

## 2. Core Taxonomy of Availability (Rule 10)

To avoid false patient expectations and maintain clinical integrity, the system strictly separates availability into four explicit statuses:

1. **`REPORTED_AVAILABILITY`**:
   - Raw feed batch records submitted by a blood bank or synced through an external adapter.
   - Distinctly labeled; does not guarantee physical availability.
2. **`CONFIRMED_AVAILABILITY`**:
   - Physically verified, certified, and reserved by an authorized laboratory technician with a timestamp and technician ID.
3. **`PREDICTED_AVAILABILITY`**:
   - Forward-looking supply projected by trained Scikit-Learn models using consumption burn rates and seasonal factors.
4. **`RECOMMENDED_ACTION`**:
   - Advisory proposal computed by the multi-criteria optimization engine (e.g. emergency dispatch corridor or proactive inter-bank transfer).

---

## 3. Medical Safety & Decision Boundaries (Rule 9)
SmartBlood AI is strictly a **Clinical Decision Support (CDS)** platform:
- It does **not** diagnose medical conditions.
- It does **not** make autonomous clinical transfusion approvals.
- It does **not** override licensed medical officers.
- It protects donor privacy by never exposing sensitive personal contact numbers publicly.
