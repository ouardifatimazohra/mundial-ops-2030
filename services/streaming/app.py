"""
📺 MUNDIAL-OPS 2030 — Service Streaming
Région : Madrid, Espagne 🇪🇸
Rôle : Diffuser les matchs de la Coupe du Monde en direct
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from fastapi.responses import Response
from datetime import datetime
import random
import time

# ═══════════════════════════════════════════════════════════════
# Configuration de l'application
# ═══════════════════════════════════════════════════════════════
app = FastAPI(
    title="MUNDIAL-OPS 2030 — Streaming",
    description="Service de streaming vidéo — Région Madrid 🇪🇸",
    version="1.0.0"
)

# ═══════════════════════════════════════════════════════════════
# Métriques Prometheus
# ═══════════════════════════════════════════════════════════════
active_viewers = Gauge(
    "streaming_active_viewers",
    "Nombre de spectateurs actifs en streaming",
    ["match", "quality"]
)

stream_starts = Counter(
    "streaming_starts_total",
    "Nombre total de démarrages de stream",
    ["match", "quality"]
)

buffering_events = Counter(
    "streaming_buffering_events_total",
    "Nombre total d'évènements de buffering",
    ["match"]
)

stream_latency = Histogram(
    "streaming_request_duration_seconds",
    "Latence des requêtes de streaming"
)

# ═══════════════════════════════════════════════════════════════
# Données simulées
# ═══════════════════════════════════════════════════════════════
LIVE_MATCHES = {
    "MAR-BRA": {"home": "Maroc 🇲🇦", "away": "Brésil 🇧🇷", "status": "scheduled", "kickoff": "2030-06-15T20:00"},
    "ESP-FRA": {"home": "Espagne 🇪🇸", "away": "France 🇫🇷", "status": "scheduled", "kickoff": "2030-06-16T20:00"},
    "POR-ARG": {"home": "Portugal 🇵🇹", "away": "Argentine 🇦🇷", "status": "scheduled", "kickoff": "2030-06-17T20:00"},
}

QUALITIES = ["SD", "HD", "4K", "8K"]


# ═══════════════════════════════════════════════════════════════
# Modèles Pydantic
# ═══════════════════════════════════════════════════════════════
class StreamRequest(BaseModel):
    match_id: str
    quality: str = "HD"


# ═══════════════════════════════════════════════════════════════
# Routes
# ═══════════════════════════════════════════════════════════════
@app.get("/")
async def root():
    return {
        "service": "Streaming",
        "region": "Madrid 🇪🇸",
        "status": "operational",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "streaming", "region": "Madrid"}


@app.get("/matches")
async def list_matches():
    """Liste tous les matchs disponibles en streaming"""
    return {"matches": LIVE_MATCHES, "qualities": QUALITIES}


@app.post("/start-stream")
async def start_stream(request: StreamRequest):
    """Démarrer un stream pour un utilisateur"""
    start = time.time()

    if request.match_id not in LIVE_MATCHES:
        raise HTTPException(status_code=404, detail="Match non trouvé")

    if request.quality not in QUALITIES:
        raise HTTPException(status_code=400, detail="Qualité invalide")

    # Délai de connexion au stream
    time.sleep(random.uniform(0.1, 0.5))

    # Simulation buffering aléatoire (3% du temps en HD, 8% en 4K, 15% en 8K)
    buffering_rates = {"SD": 0.01, "HD": 0.03, "4K": 0.08, "8K": 0.15}
    if random.random() < buffering_rates[request.quality]:
        buffering_events.labels(match=request.match_id).inc()

    # Compteurs
    stream_starts.labels(match=request.match_id, quality=request.quality).inc()
    active_viewers.labels(match=request.match_id, quality=request.quality).inc()

    duration = time.time() - start
    stream_latency.observe(duration)

    return {
        "success": True,
        "match": LIVE_MATCHES[request.match_id],
        "quality": request.quality,
        "stream_url": f"https://stream.mundial2030.com/{request.match_id}/{request.quality.lower()}",
        "session_id": f"ESP-{random.randint(100000, 999999)}",
        "estimated_bitrate_mbps": {"SD": 2, "HD": 5, "4K": 25, "8K": 80}[request.quality]
    }


@app.post("/stop-stream")
async def stop_stream(request: StreamRequest):
    """Arrêter un stream"""
    if request.match_id in LIVE_MATCHES:
        active_viewers.labels(match=request.match_id, quality=request.quality).dec()
    return {"success": True, "message": "Stream arrêté"}


@app.get("/stats")
async def stats():
    """Statistiques globales du streaming"""
    return {
        "service": "streaming",
        "region": "Madrid 🇪🇸",
        "matches_available": len(LIVE_MATCHES),
        "qualities_supported": QUALITIES,
        "infrastructure": "CDN multi-régional",
    }


@app.get("/metrics")
async def metrics():
    """Endpoint Prometheus"""
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


# ═══════════════════════════════════════════════════════════════
# Démarrage
# ═══════════════════════════════════════════════════════════════
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)