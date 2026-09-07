# Blood Shelf-Life Management & Regulatory Standards

## 1. Overview
Blood and blood components have strictly bounded physical viability. SmartBlood AI implements a configurable, regulatory-grounded shelf-life management system that rejects hard-coded ad-hoc values and references official standards.

## 2. Regulatory Source of Truth
The baseline specifications in `component_shelf_life_rules` reflect:
- **DGHS (Directorate General of Health Services) Technical Manual (3rd Edition)**
- **National AIDS Control Organisation (NACO) Standards**
- **Drugs and Cosmetics Act, 1940 (Rules 122F-122P)**
- **CDSCO Blood Bank Licensing Guidelines**

### Standard Shelf-Life Matrix:
| Component | Approved Shelf Life | Storage Temperature | Storage Methodology | Regulatory Standard |
| :--- | :--- | :--- | :--- | :--- |
| **Packed Red Blood Cells (PRBC)** | 42 Days | 2°C to 6°C | Specialized blood bank refrigerator with continuous digital temperature log | DGHS / NACO Technical Manual; CPDA-1/SAGM anticoagulant solution |
| **Platelet Concentrates** | 5 Days | 20°C to 24°C | Platelet incubator with continuous horizontal agitation (60 RPM) | DGHS Standards for Blood Transfusion Services |
| **Fresh Frozen Plasma (FFP)** | 365 Days | ≤ -18°C | Ultra-low deep plasma freezer with continuous alarm monitor | DGHS National Blood Policy; CDSCO Form 28-C |
| **Cryoprecipitate** | 365 Days | ≤ -18°C | Frozen at ≤ -18°C; thawed at 37°C in temperature-controlled water bath | DGHS Blood Transfusion Regulations |
| **Whole Blood** | 35 Days | 2°C to 6°C | Cold storage in CPDA-1 preservative solution | Drugs & Cosmetics Act, 1940 |

## 3. Dynamic Calculation & Tiers
For every unit/lot:
$$\text{days\_to\_expiry} = \text{expiry\_date} - \text{current\_date}$$

The system assigns actionable clinical status tiers:
1. **`SAFE`** ($> 7\text{ days}$): Optimal buffer; routine cross-matching and storage.
2. **`APPROACHING_EXPIRY`** ($4 \text{ to } 7\text{ days}$): Prioritized for planned elective procedures under FEFO.
3. **`HIGH_EXPIRY_RISK`** ($0 \text{ to } 3\text{ days}$): Immediate clinical prioritization or inter-facility transfer candidate.
4. **`EXPIRED`** ($< 0\text{ days}$): Quarantined for authorized biohazard disposal per protocol.

## 4. Administrative Configuration
System administrators can update storage methods, regulatory references, or shelf-life values through:
- `POST /api/shelf-life-rules`
- Frontend Portal: `/expiry-risk` & `/admin/configuration`
