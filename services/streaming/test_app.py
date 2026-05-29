"""
🧪 Tests unitaires — Service Streaming
"""

from fastapi.testclient import TestClient
from app import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "Streaming"
    assert "Madrid" in data["region"]


def test_health():
    response = client.get("/health")
    assert response.status_code == 200


def test_list_matches():
    response = client.get("/matches")
    assert response.status_code == 200
    assert "qualities" in response.json()


def test_start_stream_4k():
    """Démarrage d'un stream 4K"""
    payload = {"match_id": "MAR-BRA", "quality": "4K"}
    response = client.post("/start-stream", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["quality"] == "4K"
    assert data["estimated_bitrate_mbps"] == 25


def test_invalid_quality():
    payload = {"match_id": "MAR-BRA", "quality": "16K"}
    response = client.post("/start-stream", json=payload)
    assert response.status_code == 400


def test_metrics_endpoint():
    response = client.get("/metrics")
    assert response.status_code == 200