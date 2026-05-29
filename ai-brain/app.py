"""
🧠 MUNDIAL-OPS 2030 — CERVEAU IA
═══════════════════════════════════════════════════════════════
Service intelligent qui surveille en continu les 3 microservices,
détecte les anomalies avec Scikit-learn (Isolation Forest),
et génère des explications cinématiques en français via Groq (Llama 3.3 70B).
"""

import os
import time
import asyncio
from datetime import datetime
from typing import Optional
from contextlib import asynccontextmanager
from collections import deque

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from anomaly_detector import MetricsAnomalyDetector
from groq_agent import GroqIncidentExplainer
from prometheus_client_local import PrometheusMetricsClient

# ═══════════════════════════════════════════════════════════════
# Chargement des variables d'environnement
# ═══════════════════════════════════════════════════════════════
load_dotenv()

# ═══════════════════════════════════════════════════════════════
# État global du Cerveau IA
# ═══════════════════════════════════════════════════════════════
class BrainState:
    """État partagé du Cerveau IA — singleton"""

    def __init__(self):
        self.detector = MetricsAnomalyDetector(contamination=0.1, window_size=60)
        self.explainer = None
        self.prometheus = PrometheusMetricsClient()
        self.alerts_history: deque = deque(maxlen=50)
        self.is_monitoring = False
        self.start_time = datetime.now()
        self.total_observations = 0
        self.total_anomalies = 0

        # Mapping métrique → service (pour donner du contexte au LLM)
        self.metric_to_service = {
            'billetterie_sales_rate':       'Billetterie (Casablanca 🇲🇦)',
            'billetterie_error_rate':       'Billetterie (Casablanca 🇲🇦)',
            'streaming_starts_rate':        'Streaming (Madrid 🇪🇸)',
            'streaming_buffering_rate':     'Streaming (Madrid 🇪🇸)',
            'stade_sensor_rate':            'Stade (Lisbonne 🇵🇹)',
            'stade_security_rate':          'Stade (Lisbonne 🇵🇹)',
        }


brain = BrainState()


# ═══════════════════════════════════════════════════════════════
# Boucle de monitoring (tâche d'arrière-plan)
# ═══════════════════════════════════════════════════════════════
async def monitoring_loop():
    """Boucle infinie qui scrape Prometheus et détecte les anomalies"""
    print("🧠 [CERVEAU IA] Boucle de monitoring démarrée")
    brain.is_monitoring = True

    while brain.is_monitoring:
        try:
            # 1. Récupération du snapshot des métriques
            snapshot = brain.prometheus.get_metrics_snapshot()

            # 2. Analyse de chaque métrique
            for metric_name, value in snapshot.items():
                result = brain.detector.add_observation(metric_name, value)
                brain.total_observations += 1

                # 3. Si anomalie détectée → on génère une explication
                if result and result.get('is_anomaly'):
                    brain.total_anomalies += 1
                    service = brain.metric_to_service.get(metric_name, 'Inconnu')

                    print(f"⚠️  [ANOMALIE] {metric_name} = {value:.2f} "
                          f"(déviation {result.get('deviation_pct', 0):.1f}%)")

                    # Génération de l'explication via Groq
                    if brain.explainer:
                        explanation = brain.explainer.explain_anomaly(result, service)
                        alert = {
                            'id': f"alert-{int(time.time() * 1000)}",
                            'timestamp': datetime.now().isoformat(),
                            'service': service,
                            'metric': metric_name,
                            'value': value,
                            'severity': _compute_severity(result.get('deviation_pct', 0)),
                            'anomaly_data': result,
                            'ai_explanation': explanation.get('explanation') or explanation.get('fallback_explanation'),
                            'model_used': explanation.get('model_used'),
                        }
                        brain.alerts_history.appendleft(alert)
                        print(f"💬 [IA] Explication générée pour {service}")

        except Exception as e:
            print(f"❌ [CERVEAU IA] Erreur dans la boucle : {e}")

        # Pause de 10 secondes entre chaque cycle
        await asyncio.sleep(10)


def _compute_severity(deviation_pct: float) -> str:
    """Détermine la sévérité en fonction de la déviation"""
    abs_dev = abs(deviation_pct)
    if abs_dev > 200:
        return 'critical'
    elif abs_dev > 100:
        return 'high'
    elif abs_dev > 50:
        return 'medium'
    return 'low'


# ═══════════════════════════════════════════════════════════════
# Lifecycle FastAPI (démarrage/arrêt propre)
# ═══════════════════════════════════════════════════════════════
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Démarrage
    print("🚀 [CERVEAU IA] Initialisation...")
    try:
        brain.explainer = GroqIncidentExplainer()
        print("✅ [CERVEAU IA] Agent Groq initialisé")
    except Exception as e:
        print(f"⚠️  [CERVEAU IA] Impossible d'initialiser Groq : {e}")
        print("    Le service tournera en mode dégradé (sans explications IA)")

    # Démarrage de la boucle de monitoring en arrière-plan
    task = asyncio.create_task(monitoring_loop())

    yield  # L'app tourne ici

    # Arrêt
    print("⏹  [CERVEAU IA] Arrêt en cours...")
    brain.is_monitoring = False
    task.cancel()


# ═══════════════════════════════════════════════════════════════
# Application FastAPI
# ═══════════════════════════════════════════════════════════════
app = FastAPI(
    title="MUNDIAL-OPS 2030 — Cerveau IA",
    description="🧠 Service de détection d'anomalies et explications intelligentes",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS pour le futur dashboard React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═══════════════════════════════════════════════════════════════
# Endpoints
# ═══════════════════════════════════════════════════════════════
@app.get("/")
async def root():
    return {
        "service": "Cerveau IA",
        "version": "1.0.0",
        "status": "operational",
        "components": {
            "anomaly_detector": "Isolation Forest (Scikit-learn)",
            "explainer": f"Groq · {os.getenv('GROQ_MODEL', 'llama-3.3-70b-versatile')}",
            "metrics_source": "Prometheus",
        },
        "uptime_seconds": (datetime.now() - brain.start_time).total_seconds(),
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "monitoring_active": brain.is_monitoring,
        "explainer_ready": brain.explainer is not None,
    }


@app.get("/stats")
async def stats():
    """Statistiques globales du Cerveau IA"""
    return {
        "uptime_seconds": (datetime.now() - brain.start_time).total_seconds(),
        "total_observations": brain.total_observations,
        "total_anomalies_detected": brain.total_anomalies,
        "anomaly_rate_pct": (brain.total_anomalies / max(brain.total_observations, 1)) * 100,
        "alerts_in_memory": len(brain.alerts_history),
        "detector_stats": brain.detector.get_stats(),
        "prometheus_healthy": brain.prometheus.health_check(),
    }


@app.get("/alerts")
async def get_alerts(limit: int = 10):
    """Retourne les N dernières alertes générées (pour le dashboard)"""
    return {
        "total": len(brain.alerts_history),
        "alerts": list(brain.alerts_history)[:limit],
    }


@app.get("/alerts/latest")
async def get_latest_alert():
    """La dernière alerte uniquement (utile pour notification temps réel)"""
    if not brain.alerts_history:
        return {"alert": None, "message": "Aucune alerte pour le moment"}
    return {"alert": brain.alerts_history[0]}


class TestAnomalyRequest(BaseModel):
    metric: str
    value: float
    deviation_pct: float = 150.0
    service: Optional[str] = "Service de test"


@app.post("/test-explanation")
async def test_explanation(req: TestAnomalyRequest):
    """
    Endpoint de test : on injecte manuellement une fausse anomalie
    et on récupère l'explication IA. Très utile pour la démo jury !
    """
    if not brain.explainer:
        return {"error": "Agent IA non disponible"}

    fake_anomaly = {
        'metric': req.metric,
        'value': req.value,
        'mean': req.value / (1 + req.deviation_pct / 100),
        'deviation_pct': req.deviation_pct,
        'anomaly_score': -0.5,
    }

    result = brain.explainer.explain_anomaly(fake_anomaly, req.service)
    return result


# ═══════════════════════════════════════════════════════════════
# Démarrage
# ═══════════════════════════════════════════════════════════════
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)