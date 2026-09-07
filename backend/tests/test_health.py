def test_health_check_returns_ok_and_compliance(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "SmartBlood AI"
    assert data["compliance"]["real_patient_data"] is False
    assert data["compliance"]["masked_donor_pii"] is True
    assert data["compliance"]["clinical_decision_support_only"] is True
