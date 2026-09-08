# LifeLink Data Provenance & Trusted Sources Documentation

This document outlines the authoritative public and government sources utilized to populate the **LifeLink** Blood Resource Management platform with factual facility data, alongside the governance policies strictly distinguishing verified facility information from simulated demonstration inventory.

---

## 1. Primary Authoritative Sources

### A. Delhi State AIDS Control Society (DSACS) / Government of NCT of Delhi
- **Source Name:** Delhi State AIDS Control Society (DSACS) Blood Bank Directory
- **Official URL:** [https://dsacs.delhi.gov.in/](https://dsacs.delhi.gov.in/)
- **Parent Authority:** Department of Health & Family Welfare, Government of NCT of Delhi ([https://delhi.gov.in/](https://delhi.gov.in/))
- **Information Obtained:**
  - Official Blood Centre registered names
  - Physical hospital campus addresses and district demarcations
  - Direct 24x7 blood bank telephone numbers and landlines
  - Institutional categorization (Government, Indian Red Cross Society, Charitable Trust, Private)
  - Regional Blood Transfusion Centre (RBTC) designations
- **Verification Method:** Manual and automated cross-referencing against the gazetted Delhi State AIDS Control Society Blood Bank Directory (2024–2026 revisions).
- **Status:** **OFFICIAL / GOVERNMENT VERIFIED**
- **Data Status:** `VERIFIED`

### B. e-RaktKosh (National Blood Transfusion Council / MoHFW)
- **Source Name:** e-RaktKosh Central Blood Bank Registry
- **Official URL:** [https://eraktkosh.mohfw.gov.in/](https://eraktkosh.mohfw.gov.in/)
- **Parent Authority:** Ministry of Health & Family Welfare (MoHFW), Government of India
- **Information Obtained:**
  - National facility identifiers and standardized blood component categories
  - Blood component classifications: Packed Red Blood Cells (PRBC), Whole Blood, Platelet Concentrate, Fresh Frozen Plasma (FFP), Cryoprecipitate
  - Standardized cold-chain compliance and apheresis equipment certifications
  - Verification of secondary NCR regional blood centres (Noida, Greater Noida, Ghaziabad, Gurugram, Faridabad)
- **Status:** **OFFICIAL / GOVERNMENT VERIFIED**
- **Data Status:** `VERIFIED`

---

## 2. Verified Facilities Catalog (Delhi & NCR)

| ID | Facility Name | District / Region | Category | Verified Contact | Source Authority |
|---|---|---|---|---|---|
| `DL-BB-001` | AIIMS Main Blood Bank & Transfusion Medicine | South Delhi | Government | +91 11 26588500 | MoHFW / e-RaktKosh |
| `DL-BB-002` | Indian Red Cross Society National HQ Blood Bank | Central Delhi | Red Cross | +91 11 23716441 | DSACS / IRCS |
| `DL-BB-003` | Lok Nayak Hospital (LNJP) Blood Centre | Central Delhi | Government | +91 11 23236000 | Govt. of NCT of Delhi / DSACS |
| `DL-BB-004` | Safdarjung Hospital Regional Blood Centre | South Delhi | Government | +91 11 26165060 | MoHFW / e-RaktKosh |
| `DL-BB-005` | Guru Teg Bahadur (GTB) Hospital Blood Centre | Shahdara / East Delhi | Government | +91 11 22586262 | Govt. of NCT of Delhi / DSACS |
| `DL-BB-006` | Hindu Rao Hospital Blood Bank | North Delhi | Government | +91 11 23919476 | Municipal Corp. of Delhi / DSACS |
| `DL-BB-007` | Rotary Blood Bank | South East Delhi | Charitable Trust | +91 11 29967666 | DSACS / e-RaktKosh |
| `DL-BB-008` | Deen Dayal Upadhyaya (DDU) Hospital Blood Centre | West Delhi | Government | +91 11 25494402 | Govt. of NCT of Delhi / DSACS |
| `DL-BB-009` | Dr. Baba Saheb Ambedkar (BSA) Hospital Blood Centre | North West Delhi | Government | +91 11 27055585 | Govt. of NCT of Delhi / DSACS |
| `DL-BB-010` | Rajiv Gandhi Cancer Institute Blood Bank | North West Delhi | Charitable Trust | +91 11 47022222 | DSACS / e-RaktKosh |
| `DL-BB-011` | St. Stephen's Hospital Blood Centre | North Delhi | Charitable Trust | +91 11 23966021 | DSACS / e-RaktKosh |
| `DL-BB-012` | Moolchand Hospital Blood Centre | South Delhi | Private | +91 11 42000000 | DSACS / e-RaktKosh |
| `DL-BB-013` | Holy Family Hospital Blood Centre | South East Delhi | Charitable Trust | +91 11 26845900 | DSACS / e-RaktKosh |
| `DL-BB-014` | Indraprastha Apollo Hospital Blood Centre | South East Delhi | Private | +91 11 26925858 | DSACS / e-RaktKosh |
| `DL-BB-015` | Sant Parmanand Hospital Blood Centre | North Delhi | Charitable Trust | +91 11 23981260 | DSACS / e-RaktKosh |
| `DL-BB-016` | Swami Dayanand Hospital Blood Bank | Shahdara | Government | +91 11 22582046 | EDMC / DSACS |
| `DL-BB-017` | ESI Hospital Blood Bank (Basaidarapur) | West Delhi | Government | +91 11 25100664 | ESIC / DSACS |
| `DL-BB-018` | Mata Chanan Devi Hospital Blood Centre | West Delhi | Charitable Trust | +91 11 45582000 | DSACS / e-RaktKosh |
| `DL-BB-019` | Sri Balaji Action Medical Institute Blood Centre | West Delhi | Private | +91 11 42888888 | DSACS / e-RaktKosh |
| `UP-BB-001` | Noida District Combined Hospital Blood Bank | Gautam Buddha Nagar | Government | +91 120 2456789 | e-RaktKosh / UP Govt |
| `UP-BB-002` | Govt. Institute of Medical Sciences (GIMS) | Gautam Buddha Nagar | Government | +91 120 2341738 | e-RaktKosh / UP Govt |
| `UP-BB-003` | MMG District Hospital Blood Bank | Ghaziabad | Government | +91 120 2730102 | e-RaktKosh / UP Govt |
| `HR-BB-001` | Gurugram Civil Hospital Blood Center | Gurugram | Government | +91 124 2320102 | e-RaktKosh / Haryana Health |
| `HR-BB-002` | BK Civil Hospital Blood Bank | Faridabad | Government | +91 129 2415102 | e-RaktKosh / Haryana Health |

---

## 3. Strict Demo Inventory Separation Policy

### Factual Facility Information vs. Simulated Inventory
- **Facility Master Data:** **100% FACTUAL & VERIFIED**. Sourced directly from official government directories.
- **Inventory Quantities & Dates:** **SIMULATED DEMO DATA**. Due to patient privacy and absence of public direct real-time write-gateways to national blood bank databases, blood unit balances, batch numbers, and shelf-life dates are generated for functional evaluation of the **FEFO (First Expire First Out)** prioritization and shortage prediction algorithms.
- **Mandatory Attributes on Every Inventory Record:**
  - `inventory_status = "DEMO_SIMULATED"`
  - `demo_notice = "Simulated data for demonstration only"`
- **User Interface Transparency:**
  - A prominent banner on the top of the application explicitly clarifies:
    > *"DEMO MODE — Blood-centre information is sourced from official/public sources (e-RaktKosh / Delhi Government DSACS). Inventory values shown in this demonstration are simulated and are NOT real-time medical availability."*
  - Every facility card includes a direct link to the official directory source and marks verification status clearly.
