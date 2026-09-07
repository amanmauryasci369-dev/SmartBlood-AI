from datetime import datetime, timezone
from typing import Dict, Any, List


class WastageRiskPredictor:
    """
    Transparent Baseline Risk Model for Blood Wastage Prediction.
    Evaluates current inventory pressure, days remaining, historical velocity,
    and forecasted demand to predict clinical wastage risk tier.
    Clearly labeled as 'Baseline Risk Model' (Zero Invented Accuracy).
    """

    MODEL_NAME = "Baseline Multi-Factor Spoilage Risk Model"
    MODEL_VERSION = "v1.0.0-baseline"

    @classmethod
    def predict_risk(
        cls,
        current_inventory: int,
        days_to_expiry: int,
        daily_utilization_velocity: float,
        predicted_7d_demand: float,
        component: str
    ) -> Dict[str, Any]:
        """
        Computes quantifiable risk score using empirical physical decay and utilization constraints:
        - Ratio of inventory to expected utilization during remaining shelf life.
        - Component sensitivity weighting (Platelets have highest urgency).
        """
        now = datetime.now(timezone.utc)

        # Baseline expected consumption over remaining days
        daily_expected = (predicted_7d_demand / 7.0) if predicted_7d_demand > 0 else max(daily_utilization_velocity, 0.5)
        expected_consumption_before_expiry = max(0, days_to_expiry) * daily_expected

        surplus_units = current_inventory - expected_consumption_before_expiry

        # Component shelf-life fragility weight
        fragility_weights = {
            "PLATELETS": 1.5,
            "WHOLE_BLOOD": 1.2,
            "PRBC": 1.0,
            "FFP": 0.6,
            "CRYOPRECIPITATE": 0.6
        }
        weight = fragility_weights.get(component.upper(), 1.0)

        if days_to_expiry <= 0:
            risk = "HIGH_WASTAGE_RISK"
            score = 1.0
            explanation = "Batch has already expired. 100% spoilage occurred unless quarantined."
            recommendation = "URGENT_REVIEW"
        elif days_to_expiry <= 3 and surplus_units > 0:
            risk = "HIGH_WASTAGE_RISK"
            score = min(1.0, 0.75 + (surplus_units / max(current_inventory, 1)) * 0.25 * weight)
            explanation = f"Critical expiry window ({days_to_expiry}d). Current inventory ({current_inventory} units) exceeds expected local absorption ({expected_consumption_before_expiry:.1f} units)."
            recommendation = "CONSIDER_AUTHORIZED_REDISTRIBUTION"
        elif days_to_expiry <= 7 and surplus_units > (current_inventory * 0.3):
            risk = "MEDIUM_WASTAGE_RISK"
            score = min(0.74, 0.40 + (surplus_units / max(current_inventory, 1)) * 0.3 * weight)
            explanation = f"Approaching expiry ({days_to_expiry}d). Inventory pace suggests a potential surplus of {surplus_units:.1f} units before expiration."
            recommendation = "PRIORITIZE_UTILIZATION"
        else:
            risk = "LOW_WASTAGE_RISK"
            score = max(0.05, min(0.39, (current_inventory / max(expected_consumption_before_expiry + 1, 1)) * 0.2))
            explanation = f"Adequate buffer ({days_to_expiry}d remaining). Expected demand of {expected_consumption_before_expiry:.1f} units safely covers current stock."
            recommendation = "MONITOR"

        return {
            "model_type": "Baseline Risk Model",
            "model_version": cls.MODEL_VERSION,
            "prediction_timestamp": now.isoformat(),
            "risk": risk,
            "risk_score": round(score, 3),
            "current_inventory": current_inventory,
            "days_to_expiry": days_to_expiry,
            "expected_absorption": round(expected_consumption_before_expiry, 1),
            "surplus_units": round(max(0, surplus_units), 1),
            "explanation": explanation,
            "recommendation": recommendation,
            "methodology_disclaimer": "Transparent deterministic baseline evaluation; no synthetic or unvalidated accuracy claimed."
        }
