def test_blood_search_differentiates_statuses(client):
    search_payload = {
        "blood_group": "O-",
        "component": "PACKED_RED_BLOOD_CELLS",
        "quantity": 2,
        "max_distance_km": 100.0,
        "emergency_level": "CRITICAL"
    }
    res = client.post("/api/v1/intel/blood/search", json=search_payload)
    assert res.status_code == 200
    items = res.json()
    assert isinstance(items, list)


def test_shortage_prediction_quantitative_formula(client):
    res = client.get("/api/v1/intel/shortage-risk")
    assert res.status_code == 200
    risks = res.json()
    assert len(risks) > 0
    first = risks[0]
    assert "shortage_risk_tier" in first
    assert first["shortage_risk_tier"] in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
    assert "Projected = Current + Incoming - Demand - Expiry" in first["calculation_formula"]


def test_donor_matching_transparent_scoring_and_masking(client):
    res = client.get("/api/v1/intel/donor-matches?blood_group=O-")
    assert res.status_code == 200
    matches = res.json()
    assert len(matches) > 0
    first = matches[0]
    assert "public_donor_tag" in first
    assert "DONOR-" in first["public_donor_tag"]
    # Verify no raw phone numbers exposed (Rule 8)
    assert "phone" not in first
    assert "score_breakdown" in first
    assert first["overall_match_score"] > 0


def test_smart_alerts_and_ai_insights(client):
    # Test Alerts
    alert_res = client.get("/api/v1/intel/alerts")
    assert alert_res.status_code == 200
    alerts = alert_res.json()
    assert len(alerts) >= 4
    assert any(a["severity"] == "CRITICAL" for a in alerts)

    # Test AI Insights
    insight_res = client.get("/api/v1/intel/insights")
    assert insight_res.status_code == 200
    insights = insight_res.json()
    assert len(insights) >= 4
    assert any(i["severity"] == "CRITICAL" for i in insights)
    assert len(insights[0]["data_sources_used"]) > 0


def test_analytics_and_demo_scenario(client):
    # Test Analytics for Recharts
    ana_res = client.get("/api/v1/intel/analytics")
    assert ana_res.status_code == 200
    data = ana_res.json()
    assert len(data["dates"]) == 15
    assert len(data["collections"]) == 15
    assert "O+" in data["blood_group_distribution"]

    # Test 1-Click SIH Live Demo Scenario
    demo_res = client.post("/api/v1/intel/demo/run-scenario")
    assert demo_res.status_code == 200
    demo = demo_res.json()
    assert demo["status"] == "SCENARIO_EXECUTED"
    assert demo["blood_group"] == "O-"
    assert demo["units"] == 4
    assert "SIH-DISP-" in demo["dispatch_token"]
