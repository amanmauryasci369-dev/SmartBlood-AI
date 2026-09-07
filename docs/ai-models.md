# SmartBlood AI: Machine Learning & Predictive Analytics Pipeline

## Architectural Mandates (Rule 12, 13, 14)
- **Real Scikit-Learn Models**: All forecasts and classifications originate from authentic trained pipelines.
- **Zero Invented Accuracy**: Evaluation metrics (MAE, RMSE, MAPE, Accuracy, F1) are measured on held-out test splits.
- **Explainability**: Every model inference produces feature importance weights and explicit natural-language justifications.

---

## 1. Multi-Horizon Blood Demand Forecasting
- **Architecture**: `RandomForestRegressor` / `GradientBoostingRegressor`
- **Prediction Horizons**:
  - **1-Day**: Immediate operational triage buffer.
  - **3-Day**: Weekend / surge adjustment.
  - **7-Day**: Primary procurement planning horizon.
  - **30-Day**: Strategic seasonal donor camp scheduling.
- **Feature Vector**:
  - `day_of_week` (0-6)
  - `month` (1-12)
  - `is_weekend` (binary)
  - `component_code` (0-4: Whole, PRBC, FFP, Platelets, Cryo)
  - `blood_group_code` (0-7: A+, A-, B+, B-, AB+, AB-, O+, O-)
  - `has_trauma_center` (binary)
  - `bed_capacity` (hospital volume)
  - `rolling_7d_avg` (recent moving average consumption)
  - `current_stock` (in-facility reserves)
  - `dengue_outbreak_factor` (monsoon epidemic multiplier for platelets)

---

## 2. Shortage Risk Prediction
- **Balance Equation**:
  $$\text{Projected Stock} = \text{Current Stock} + \text{Incoming Supply} - \text{Predicted Demand} - \text{Expected Expiry Loss}$$
- **Risk Tiers**:
  - `CRITICAL`: Projected Stock $\le 0$ units (Immediate emergency alert)
  - `HIGH`: Projected Stock $\le 30\%$ of safe threshold
  - `MEDIUM`: Projected Stock $\le 70\%$ of safe threshold
  - `LOW`: Projected Stock $> 70\%$ of safe threshold

---

## 3. FEFO (First-Expire-First-Out) Spoilage Risk Classifier
- **Architecture**: `RandomForestClassifier` (3-Tier: `LOW_RISK`, `MEDIUM_RISK`, `HIGH_RISK`)
- **Factors**: Remaining days to expiry vs shelf life, temperature fluctuation, daily facility burn rate, regional cluster demand.

---

## 4. Anomaly Detection Engine
- **Methodology**: Moving window Z-Score & Isolation Forest.
- **Detection Targets**:
  - Unexplained rapid inventory depletion (>3.0 std dev)
  - Unseasonal platelet demand spikes
  - Stale inventory records exceeding threshold hours without update
