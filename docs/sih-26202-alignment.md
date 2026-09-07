# SIH Problem Statement 26202 Alignment

## Five Evaluation Pillars

### 1. INTELLIGENT USE OF RESOURCES
- **FEFO (First-Expire-First-Out)**: Prioritizes batches approaching expiry ($A \to B \to C$) over fresh stock, directly slashing preventable biological wastage.
- **Proactive Inter-Facility Rebalancing**: Automatically pairs expiring units at peripheral blood banks with high-consumption urban Level-1 trauma centers before outdating occurs.
- **Dynamic Safety Buffer Sizing**: Balances emergency safety stock with historical utilization velocities.

### 2. ARTIFICIAL INTELLIGENCE
- **Scikit-Learn Machine Learning Pipeline**: Authentic Random Forest demand regressor with empirical test metrics ($\text{MAE} = 7.73$, $\text{RMSE} = 9.71$, $R^2 = 0.342$) and multi-horizon forecasting (1d/3d/7d/30d).
- **Isolation Forest Anomaly Detection**: Detects atypical consumption spikes or hoarding behavior across transfusion centers.
- **Transparent Spoilage Risk Model**: Predicts wastage risk tiers (`LOW`, `MEDIUM`, `HIGH`) with plain-English clinical explanations.

### 3. MULTIPLE DATA SOURCES
- **e-RaktKosh Compatible Sandbox Feed**: Standardized schema ingestion mirroring national transfusion registry formats.
- **Direct Blood Bank LIS**: Cold-chain verified inventory records with real-time temperature logs.
- **Hospital HIS Emergency Queue**: Live acute polytrauma requisitions and surgical demand schedules.
- **Privacy-Masked Voluntary Donor Registry**: Anonymized public tags (`DONOR-DEL-0001`) with district-level matching.
- **Geospatial GIS Engine**: Haversine distance matrix with emergency speed models and Leaflet route visualization.

### 4. VALUABLE INSIGHTS
- **Multi-Etiology Discard Tracking**: Disaggregates expiry, TTI serological reactivity, bag rupture, and underfilled volume.
- **Executive AI Command Feed**: Synthesizes cross-facility patterns into severity-coded actionable alerts (`CRITICAL`, `HIGH`, `ATTENTION`, `OPPORTUNITY`).
- **Comprehensive Hemovigilance Metrics**: Live utilization rate vs wastage rate vs shelf-life decay curves.

### 5. SMART AUTOMATION
- **Autonomous Emergency Source Ranking**: Rapidly evaluates and ranks regional blood centers and peer hospitals in $< 200\text{ ms}$.
- **Hospital-to-Hospital Requisition Coordination**: State-machine-driven peer requisitioning with verification gates and delivery fulfillment.
- **End-to-End 19-Step SIH Demo Mode**: One-click autonomous simulation demonstrating the complete journey from emergency request to inventory update.
