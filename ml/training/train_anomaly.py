import json
from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import joblib

DATA_DIR = Path(__file__).parent.parent.parent / "data"
MODELS_DIR = Path(__file__).parent.parent / "models"


def train_anomaly_detector():
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    demand_csv = DATA_DIR / "demand_history.csv"
    if not demand_csv.exists():
        raise FileNotFoundError("demand_history.csv not found.")

    df = pd.read_csv(demand_csv)
    features = ["units_consumed", "seasonal_dengue_index"]
    X = df[features]

    iso = IsolationForest(contamination=0.03, random_state=42)
    iso.fit(X)

    anomalies = iso.predict(X)
    n_anomalies = int(np.sum(anomalies == -1))

    metrics = {
        "model_name": "Transfusion Consumption & Inventory Drop Anomaly Detector",
        "model_type": "IsolationForest",
        "contamination_rate": 0.03,
        "n_samples_analyzed": len(df),
        "detected_historical_anomalies": n_anomalies,
        "features": features,
        "use_case": "Detect unseasonal surges, sudden mass casualty spikes, and abnormal inventory drop rates"
    }

    joblib.dump(iso, MODELS_DIR / "anomaly_model.joblib")
    with open(MODELS_DIR / "anomaly_metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"Anomaly detector trained! Detected {n_anomalies} anomalies across {len(df)} records.")
    return metrics


if __name__ == "__main__":
    train_anomaly_detector()
