"""
🧪 Tests unitaires — Service Billetterie
Vérifie que les endpoints critiques répondent correctement
"""

from fastapi.testclient import TestClient
from app import app

client = TestClient(app)


def test_root():
    """Le endpoint racine doit répondre 200 et identifier le service"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "Billetterie"
    assert "Casablanca" in data["region"]


def test_health():
    """Healthcheck pour Docker/K8s"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_list_matches():
    """La liste des matchs doit contenir les 3 matchs configurés"""
    response = client.get("/matches")
    assert response.status_code == 200
    data = response.json()
    assert "MAR-BRA" in data["matches"]
    assert "ESP-FRA" in data["matches"]
    assert "POR-ARG" in data["matches"]


def test_buy_ticket_success():
    """Achat valide doit fonctionner"""
    payload = {"match_id": "MAR-BRA", "category": "VIP", "quantity": 2}
    response = client.post("/buy", json=payload)
    # On accepte 200 (succès) ou 503 (erreur simulée aléatoire 1%)
    assert response.status_code in [200, 503]
    if response.status_code == 200:
        data = response.json()
        assert data["success"] is True
        assert data["total_price_mad"] == 10000  # VIP x 2 = 5000 x 2


def test_buy_invalid_match():
    """Match invalide doit retourner 404"""
    payload = {"match_id": "FAKE-MATCH", "category": "VIP", "quantity": 1}
    response = client.post("/buy", json=payload)
    assert response.status_code == 404


def test_metrics_endpoint():
    """Endpoint Prometheus doit exposer les métriques"""
    response = client.get("/metrics")
    assert response.status_code == 200
    # Vérifie que les métriques Prometheus sont bien exposées
    assert "billetterie_tickets_sold_total" in response.text or "python_info" in response.text