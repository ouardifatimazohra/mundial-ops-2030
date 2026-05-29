"""
🧪 Tests unitaires — Service Stade
"""

from fastapi.testclient import TestClient
from app import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "Stade"
    assert "Lisbonne" in data["region"]


def test_health():
    response = client.get("/health")
    assert response.status_code == 200


def test_list_stadiums():
    response = client.get("/stadiums")
    assert response.status_code == 200
    data = response.json()
    assert "HASSAN-II" in data["stadiums"]
    assert "BERNABEU" in data["stadiums"]
    assert "LUZ" in data["stadiums"]


def test_sensor_temperature():
    """Lecture capteur température du Grand Stade Hassan II"""
    response = client.get("/sensor/HASSAN-II/temperature")
    assert response.status_code == 200
    data = response.json()
    assert data["unit"] == "°C"
    assert isinstance(data["value"], (int, float))


def test_invalid_stadium():
    response = client.get("/sensor/FAKE-STADIUM/temperature")
    assert response.status_code == 404


def test_security_scan():
    response = client.get("/security/scan/LUZ")
    assert response.status_code == 200
    data = response.json()
    assert data["scan_status"] == "completed"


def test_metrics_endpoint():
    response = client.get("/metrics")
    assert response.status_code == 200