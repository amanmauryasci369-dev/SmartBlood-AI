"""Root system integration and end-to-end tests for SmartBlood AI."""
import pytest
from ml.prediction.inference import MLInferenceEngine


def test_ml_inference_subsystem():
    # Verify 1d, 3d, 7d, 30d demand prediction
    pred = MLInferenceEngine.predict_demand(
        day_of_week=2,
        month=9,
        component_code=1,
        blood_group_code=6,
        has_trauma=True,
        bed_capacity=1000,
        seasonal_dengue_index=1.0
    )
    assert pred["forecast_7_day"] > 0
    assert pred["forecast_1_day"] > 0
    assert pred["forecast_30_day"] > pred["forecast_7_day"]
    assert "mean_absolute_error" in pred["model_metrics"]

    # Verify FEFO expiry classification
    expiry = MLInferenceEngine.classify_expiry(
        days_remaining=2,
        total_shelf_days=5,
        comp_code=3,
        units_available=10,
        temperature_celsius=22.0
    )
    assert expiry["risk_tier"] in ["LOW_RISK", "MEDIUM_RISK", "HIGH_RISK"]

    # Verify Anomaly detection
    anomaly = MLInferenceEngine.detect_anomaly(units_consumed=120, seasonal_index=2.5)
    assert "is_anomaly" in anomaly
    assert "anomaly_score" in anomaly
