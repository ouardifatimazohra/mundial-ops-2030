"""
🧠 MUNDIAL-OPS 2030 — Client Prometheus
Récupère les métriques live des 3 microservices via l'API Prometheus.
"""

import os
import requests
from typing import Optional


class PrometheusMetricsClient:
    """Client minimaliste pour requêter Prometheus en mode instantané."""

    def __init__(self, prometheus_url: Optional[str] = None):
        self.url = prometheus_url or os.getenv('PROMETHEUS_URL', 'http://prometheus:9090')

    def query(self, promql: str) -> Optional[float]:
        """
        Exécute une requête PromQL instantanée et retourne la première valeur.
        Retourne None si pas de données ou erreur.
        """
        try:
            response = requests.get(
                f"{self.url}/api/v1/query",
                params={'query': promql},
                timeout=3,
            )
            response.raise_for_status()
            data = response.json()

            if data['status'] != 'success':
                return None

            results = data['data']['result']
            if not results:
                return None

            # On récupère la valeur du premier résultat
            return float(results[0]['value'][1])

        except Exception:
            return None

    def get_metrics_snapshot(self) -> dict:
        """
        Récupère un snapshot des métriques clés des 3 services.
        Retourne un dict métrique → valeur.
        """
        queries = {
            # 🎫 Billetterie — taux de ventes (req/sec sur 1 min)
            'billetterie_sales_rate': 'sum(rate(billetterie_tickets_sold_total[1m]))',

            # 🎫 Billetterie — taux d'erreurs
            'billetterie_error_rate': 'sum(rate(billetterie_errors_total[1m]))',

            # 📺 Streaming — taux de démarrages
            'streaming_starts_rate': 'sum(rate(streaming_starts_total[1m]))',

            # 📺 Streaming — taux de buffering
            'streaming_buffering_rate': 'sum(rate(streaming_buffering_events_total[1m]))',

            # 🏟️ Stade — taux de lectures capteurs
            'stade_sensor_rate': 'sum(rate(stade_sensor_readings_total[1m]))',

            # 🏟️ Stade — taux d'incidents sécurité
            'stade_security_rate': 'sum(rate(stade_security_incidents_total[1m]))',
        }

        snapshot = {}
        for name, query in queries.items():
            value = self.query(query)
            snapshot[name] = value if value is not None else 0.0

        return snapshot

    def health_check(self) -> bool:
        """Vérifie que Prometheus est joignable"""
        try:
            response = requests.get(f"{self.url}/-/healthy", timeout=2)
            return response.status_code == 200
        except Exception:
            return False