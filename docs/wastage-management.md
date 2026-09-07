# Blood Wastage Management, Analytics & Proactive Reduction

## 1. Multi-Cause Discard Tracking
Blood discard cannot be treated as exclusively expiry-driven. To ensure hemovigilance accuracy, the `wastage_records` table tracks distinct clinical reasons:
1. `EXPIRY`: Unit reached approved shelf-life boundary without compatible transfusion.
2. `TTI_REACTIVE`: Serological reactive result for HIV 1/2, Hepatitis B (HBsAg), Hepatitis C (HCV), Syphilis (VDRL), or Malaria.
3. `DAMAGED`: Mechanical port puncture, bag leakage, or freezer container break during transit.
4. `QUALITY_CONTROL`: Sub-standard collection volume (<315 ml), lipemic plasma, or severe hemolysis.
5. `OTHER`: Cold-chain excursion, transport delay, or non-transfused operating theater returns exceeding 30-minute rule.

## 2. Core Hemovigilance Equations
$$\text{Utilization Rate} = \frac{\text{Total Units Issued}}{\text{Total Units Collected}} \times 100$$

$$\text{Wastage Rate} = \frac{\text{Total Units Discarded}}{\text{Total Units Collected}} \times 100$$

## 3. Proactive Spoilage Reduction Engine
When inventory batches enter the $\le 7\text{ day}$ window, the engine analyzes:
$$\text{Current Stock} + \text{Days Remaining} + \text{Utilization Velocity} + \text{Forecasted Demand} + \text{Apex Trauma Absorption}$$

Recommendations emitted:
- `PRIORITIZE_UTILIZATION`: Accelerate issuance for elective schedules.
- `MONITOR`: Stable buffer covers projected demand.
- `HIGH_EXPIRY_RISK`: Projected consumption insufficient to absorb stock before expiry.
- `CONSIDER_AUTHORIZED_REDISTRIBUTION`: Recommend transfer to high-consumption trauma center.
- `URGENT_REVIEW`: High-fragility component (e.g. Platelets) expiring in <72 hours.

## 4. Transparent Baseline Spoilage Model
Labeled transparently as **"Baseline Risk Model"** (`WastageRiskPredictor`):
- Evaluates physical decay rates and expected consumption window.
- Eliminates invented accuracy metrics.
- Provides plain-English clinical explainability for every advisory.
