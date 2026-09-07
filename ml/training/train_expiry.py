import json
from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib

DATA_DIR = Path(__file__).parent.parent.parent / "data"
MODELS_DIR = Path(__file__).parent.parent / "models"


def train_expiry_risk_pipeline():
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    inv_csv = DATA_DIR / "inventory.csv"
    if not inv_csv.exists():
        raise FileNotFoundError("inventory.csv not found.")

    df_inv = pd.read_csv(inv_csv)
    today = pd.to_datetime("today")
    df_inv["collected_date"] = pd.to_datetime(df_inv["collected_date"])
    df_inv["expiry_date"] = pd.to_datetime(df_inv["expiry_date"])
    
    df_inv["days_remaining"] = (df_inv["expiry_date"] - today).dt.days
    df_inv["total_shelf_days"] = (df_inv["expiry_date"] - df_inv["collected_date"]).dt.days
    
    component_map = {
        "WHOLE_BLOOD": 0, "PACKED_RED_BLOOD_CELLS": 1,
        "FRESH_FROZEN_PLASMA": 2, "PLATELET_CONCENTRATE": 3
    }
    df_inv["comp_code"] = df_inv["component"].map(component_map).fillna(0)

    # 3-tier risk:
    # High: days <= 2 for platelets or days <= 5 for PRBC
    conditions = [
        (df_inv["days_remaining"] <= 3),
        (df_inv["days_remaining"] > 3) & (df_inv["days_remaining"] <= 8),
        (df_inv["days_remaining"] > 8)
    ]
    choices = [2, 1, 0]  # 2: High Risk, 1: Medium Risk, 0: Low Risk
    df_inv["risk_tier"] = np.select(conditions, choices, default=0)

    features = ["days_remaining", "total_shelf_days", "comp_code", "units_available", "temperature_celsius"]
    X = df_inv[features]
    y = df_inv["risk_tier"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    acc = float(accuracy_score(y_test, preds))
    prec = float(precision_score(y_test, preds, average="macro"))
    rec = float(recall_score(y_test, preds, average="macro"))
    f1 = float(f1_score(y_test, preds, average="macro"))

    metrics = {
        "model_name": "FEFO Expiry Spoilage Risk Classifier",
        "model_type": "RandomForestClassifier",
        "classes": ["LOW_RISK", "MEDIUM_RISK", "HIGH_RISK"],
        "n_samples": len(df_inv),
        "evaluation_metrics": {
            "accuracy": round(acc, 4),
            "macro_precision": round(prec, 4),
            "macro_recall": round(rec, 4),
            "macro_f1": round(f1, 4)
        },
        "features": features,
        "feature_importances": {
            k: round(float(v), 4) for k, v in zip(features, model.feature_importances_)
        }
    }

    joblib.dump(model, MODELS_DIR / "expiry_model.joblib")
    with open(MODELS_DIR / "expiry_metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"Expiry model trained! Accuracy: {acc:.4f}, F1: {f1:.4f}")
    return metrics


if __name__ == "__main__":
    train_expiry_risk_pipeline()
