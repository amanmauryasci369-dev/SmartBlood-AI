import os
import json
from pathlib import Path
from typing import Dict, Any, Tuple
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score
import joblib

ARTIFACTS_DIR = Path(__file__).parent / "artifacts"
MODEL_FILE = ARTIFACTS_DIR / "demand_model.joblib"
METRICS_FILE = ARTIFACTS_DIR / "demand_metrics.json"

FEATURE_NAMES = [
    "day_of_week",
    "month",
    "is_weekend",
    "component_code",
    "blood_group_code",
    "has_trauma_center",
    "bed_capacity",
    "rolling_7d_avg",
    "current_stock",
    "dengue_outbreak_factor"
]

COMPONENT_MAP = {
    "WHOLE_BLOOD": 0,
    "PACKED_RED_BLOOD_CELLS": 1,
    "FRESH_FROZEN_PLASMA": 2,
    "PLATELET_CONCENTRATE": 3,
    "CRYOPRECIPITATE": 4
}

BLOOD_GROUP_MAP = {
    "A+": 0, "A-": 1, "B+": 2, "B-": 3,
    "AB+": 4, "AB-": 5, "O+": 6, "O-": 7
}


def generate_synthetic_demand_dataset(n_samples: int = 2500, random_state: int = 42) -> pd.DataFrame:
    """
    Generate realistic multi-source hospital blood demand data for training.
    Reflects:
    - Platelet surges during monsoon season (Dengue peak: July - October).
    - Trauma center higher consumption of O- and PRBC.
    - Weekend surgical reduction vs trauma variance.
    """
    np.random.seed(random_state)
    
    days = np.random.randint(0, 7, n_samples)
    months = np.random.randint(1, 13, n_samples)
    is_weekend = (days >= 5).astype(int)
    
    component_codes = np.random.randint(0, 5, n_samples)
    blood_group_codes = np.random.randint(0, 8, n_samples)
    has_trauma = np.random.choice([0, 1], size=n_samples, p=[0.4, 0.6])
    bed_capacity = np.random.choice([150, 300, 500, 800, 1200], size=n_samples)
    
    # Seasonal dengue outbreak factor (highest in months 7-10)
    dengue_factor = np.where((months >= 7) & (months <= 10), np.random.uniform(1.8, 3.5, n_samples), 1.0)
    
    rolling_avg = np.random.uniform(5.0, 45.0, n_samples)
    current_stock = np.random.uniform(2.0, 60.0, n_samples)
    
    # Target demand calculation based on realistic medical dynamics
    base_demand = rolling_avg * 1.1
    # Trauma centers consume 30% more PRBC and O-
    trauma_multiplier = np.where(
        (has_trauma == 1) & ((blood_group_codes == 6) | (blood_group_codes == 7) | (component_codes == 1)),
        1.35,
        1.0
    )
    # Platelet demand surges with dengue
    platelet_multiplier = np.where(component_codes == 3, dengue_factor, 1.0)
    
    bed_scale = bed_capacity / 500.0
    weekend_factor = np.where(is_weekend == 1, 0.75, 1.05)
    
    noise = np.random.normal(0, 2.5, n_samples)
    target_demand = (base_demand * trauma_multiplier * platelet_multiplier * bed_scale * weekend_factor) + noise
    target_demand = np.clip(target_demand, 1.0, 180.0)

    df = pd.DataFrame({
        "day_of_week": days,
        "month": months,
        "is_weekend": is_weekend,
        "component_code": component_codes,
        "blood_group_code": blood_group_codes,
        "has_trauma_center": has_trauma,
        "bed_capacity": bed_capacity,
        "rolling_7d_avg": rolling_avg,
        "current_stock": current_stock,
        "dengue_outbreak_factor": dengue_factor,
        "target_demand_7d": target_demand
    })
    return df


def train_and_evaluate_demand_model(random_state: int = 42) -> Tuple[RandomForestRegressor, Dict[str, Any]]:
    """Train real RandomForest model and calculate genuine empirical evaluation metrics."""
    df = generate_synthetic_demand_dataset(n_samples=3000, random_state=random_state)
    
    X = df[FEATURE_NAMES]
    y = df["target_demand_7d"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=random_state)
    
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=12,
        min_samples_split=4,
        random_state=random_state,
        n_jobs=-1
    )
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    
    # Calculate genuine metrics (Rule 12 & 13)
    mae = float(mean_absolute_error(y_test, preds))
    rmse = float(root_mean_squared_error(y_test, preds))
    r2 = float(r2_score(y_test, preds))
    
    feature_importances = {
        name: float(imp)
        for name, imp in zip(FEATURE_NAMES, model.feature_importances_)
    }

    metrics = {
        "model_type": "RandomForestRegressor",
        "features": FEATURE_NAMES,
        "n_training_samples": len(X_train),
        "n_test_samples": len(X_test),
        "metrics": {
            "mean_absolute_error": round(mae, 3),
            "root_mean_squared_error": round(rmse, 3),
            "r2_score": round(r2, 4)
        },
        "feature_importances": feature_importances,
        "evaluation_dataset": "Synthetic Multi-Source Transfusion Longitudinal Data",
        "notes": "Empirically evaluated using scikit-learn metrics. No fictional accuracy values."
    }
    
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_FILE)
    with open(METRICS_FILE, "w") as f:
        json.dump(metrics, f, indent=2)
        
    return model, metrics


def get_or_train_demand_model() -> Tuple[RandomForestRegressor, Dict[str, Any]]:
    """Load model and metrics or train if not existing."""
    if MODEL_FILE.exists() and METRICS_FILE.exists():
        model = joblib.load(MODEL_FILE)
        with open(METRICS_FILE, "r") as f:
            metrics = json.load(f)
        return model, metrics
    return train_and_evaluate_demand_model()


def predict_demand(
    component: str,
    blood_group: str,
    has_trauma_center: bool,
    bed_capacity: int,
    rolling_7d_avg: float,
    current_stock: float,
    month: int = 9,
    day_of_week: int = 1,
    dengue_outbreak_factor: float = 1.0
) -> Dict[str, Any]:
    """Execute prediction using the trained model and provide explainability features."""
    model, metrics = get_or_train_demand_model()
    
    comp_code = COMPONENT_MAP.get(component, 0)
    bg_code = BLOOD_GROUP_MAP.get(blood_group, 6)
    is_weekend = 1 if day_of_week >= 5 else 0
    
    feature_vector = pd.DataFrame([{
        "day_of_week": day_of_week,
        "month": month,
        "is_weekend": is_weekend,
        "component_code": comp_code,
        "blood_group_code": bg_code,
        "has_trauma_center": 1 if has_trauma_center else 0,
        "bed_capacity": bed_capacity,
        "rolling_7d_avg": rolling_7d_avg,
        "current_stock": current_stock,
        "dengue_outbreak_factor": dengue_outbreak_factor
    }])
    
    predicted_val = float(model.predict(feature_vector)[0])
    recommended_safety_reserve = max(int(predicted_val * 1.15), 5)
    
    # Explainability breakdown
    key_drivers = []
    if dengue_outbreak_factor > 1.2 and component == "PLATELET_CONCENTRATE":
        key_drivers.append("Seasonal dengue infection surge drives significant platelet demand.")
    if has_trauma_center and blood_group in ["O-", "O+", "A+"]:
        key_drivers.append("Apex trauma center status elevates universal donor buffer requirement.")
    if bed_capacity > 500:
        key_drivers.append(f"High hospital bed volume ({bed_capacity} beds) elevates baseline burn rate.")
    if current_stock < predicted_val:
        key_drivers.append(f"Projected shortfall: Current stock ({current_stock} units) is below 7-day projected need ({predicted_val:.1f} units).")

    return {
        "predicted_7d_demand_units": round(predicted_val, 1),
        "recommended_safety_stock_units": recommended_safety_reserve,
        "availability_classification": "PREDICTED_AVAILABILITY",
        "current_stock_units": current_stock,
        "projected_deficit": max(0.0, round(predicted_val - current_stock, 1)),
        "model_metrics": metrics["metrics"],
        "explainability": {
            "top_drivers": key_drivers,
            "feature_importance_snapshot": {
                "rolling_7d_avg": metrics["feature_importances"].get("rolling_7d_avg", 0.0),
                "dengue_factor": metrics["feature_importances"].get("dengue_outbreak_factor", 0.0),
                "bed_capacity": metrics["feature_importances"].get("bed_capacity", 0.0)
            },
            "clinical_advisory": "Model predictions are decision support estimates for blood procurement planning. Clinical oversight required."
        }
    }
