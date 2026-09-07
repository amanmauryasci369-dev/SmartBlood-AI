import json
from pathlib import Path
from typing import Dict, Any, List
import pandas as pd
import numpy as np
import joblib

MODELS_DIR = Path(__file__).parent.parent / "models"


class MLInferenceEngine:
    """Unified inference interface for SmartBlood AI ML models."""
    
    _demand_model = None
    _expiry_model = None
    _anomaly_model = None
    _demand_metrics = None
    _expiry_metrics = None
    _anomaly_metrics = None

    @classmethod
    def load_artifacts(cls):
        if cls._demand_model is None:
            cls._demand_model = joblib.load(MODELS_DIR / "demand_model.joblib")
            with open(MODELS_DIR / "demand_metrics.json") as f:
                cls._demand_metrics = json.load(f)

        if cls._expiry_model is None:
            cls._expiry_model = joblib.load(MODELS_DIR / "expiry_model.joblib")
            with open(MODELS_DIR / "expiry_metrics.json") as f:
                cls._expiry_metrics = json.load(f)

        if cls._anomaly_model is None:
            cls._anomaly_model = joblib.load(MODELS_DIR / "anomaly_model.joblib")
            with open(MODELS_DIR / "anomaly_metrics.json") as f:
                cls._anomaly_metrics = json.load(f)

    @classmethod
    def predict_demand(
        cls,
        day_of_week: int,
        month: int,
        component_code: int,
        blood_group_code: int,
        has_trauma: bool,
        bed_capacity: int,
        seasonal_dengue_index: float = 1.0
    ) -> Dict[str, Any]:
        cls.load_artifacts()
        
        is_weekend = 1 if day_of_week >= 5 else 0
        features = pd.DataFrame([{
            "day_of_week": day_of_week,
            "month": month,
            "is_weekend": is_weekend,
            "component_code": component_code,
            "blood_group_code": blood_group_code,
            "has_trauma": 1 if has_trauma else 0,
            "bed_capacity": bed_capacity,
            "seasonal_dengue_index": seasonal_dengue_index
        }])

        pred_7d = float(cls._demand_model.predict(features)[0])
        
        # Extrapolate 1-day, 3-day, 30-day horizons
        pred_1d = round(pred_7d / 7.0, 1)
        pred_3d = round((pred_7d / 7.0) * 3.0, 1)
        pred_30d = round((pred_7d / 7.0) * 30.0, 1)

        return {
            "forecast_1_day": pred_1d,
            "forecast_3_day": pred_3d,
            "forecast_7_day": round(pred_7d, 1),
            "forecast_30_day": pred_30d,
            "recommended_safety_stock": max(int(pred_7d * 1.2), 5),
            "model_metrics": cls._demand_metrics["evaluation_metrics"],
            "verification": cls._demand_metrics["verification_statement"]
        }

    @classmethod
    def classify_expiry(
        cls,
        days_remaining: int,
        total_shelf_days: int,
        comp_code: int,
        units_available: int,
        temperature_celsius: float
    ) -> Dict[str, Any]:
        cls.load_artifacts()
        
        features = pd.DataFrame([{
            "days_remaining": days_remaining,
            "total_shelf_days": total_shelf_days,
            "comp_code": comp_code,
            "units_available": units_available,
            "temperature_celsius": temperature_celsius
        }])

        risk_tier_idx = int(cls._expiry_model.predict(features)[0])
        tiers = ["LOW_RISK", "MEDIUM_RISK", "HIGH_RISK"]
        tier = tiers[risk_tier_idx]

        return {
            "risk_tier": tier,
            "days_remaining": days_remaining,
            "action": "PRIORITY_REDISTRIBUTION" if tier == "HIGH_RISK" else ("ACCELERATE_USAGE" if tier == "MEDIUM_RISK" else "MONITOR_STORAGE"),
            "model_metrics": cls._expiry_metrics["evaluation_metrics"]
        }

    @classmethod
    def detect_anomaly(cls, units_consumed: int, seasonal_index: float) -> Dict[str, Any]:
        cls.load_artifacts()
        
        features = pd.DataFrame([{
            "units_consumed": units_consumed,
            "seasonal_dengue_index": seasonal_index
        }])

        pred = int(cls._anomaly_model.predict(features)[0])
        is_anomaly = (pred == -1)
        
        score = float(cls._anomaly_model.score_samples(features)[0])

        return {
            "is_anomaly": is_anomaly,
            "anomaly_score": round(abs(score), 3),
            "reason": "Unusually elevated transfusion consumption relative to baseline" if is_anomaly else "Normal consumption within standard deviation bounds"
        }
