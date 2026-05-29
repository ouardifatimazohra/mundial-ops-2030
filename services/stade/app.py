"""
🏟️ MUNDIAL-OPS 2030 — Service Stade
Région : Lisbonne, Portugal 🇵🇹
Rôle : Gérer les capteurs IoT et la sécurité des stades
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from prometheus_client import Counter, Gauge, Histogram, generate_latest, CONTENT_TYPE_LATEST
from fastapi.responses import Response
from datetime import datetime
import random
import time

# ═══════════════════════════════════════════════════════════════
# Configuration
# ═══════════════════════════════════════════════════════════════
app = FastAPI(
    title="MUNDIAL-OPS 2030 — Stade",
    description="Service de gestion des stades — Région Lisbonne 🇵🇹",
    version="1.0.0"
)

# ═══════════════════════════════════════════════════════════════
# Métriques Prometheus
# ═══════════════════════════════════════════════════════════════
stadium_occupancy = Gauge(
    "stade_occupancy_current",
    "Occupation actuelle du stade",
    ["stadium"]
)

sensor_readings = Counter(
    "stade_sensor_readings_total",
    "Nombre total de lectures de capteurs",
    ["stadium", "sensor_type"]
)

security_incidents = Counter(
    "stade_security_incidents_total",
    "Nombre total d'incidents de sécurité",
    ["stadium", "severity"]
)

response_time = Histogram(
    "stade_request_duration_seconds",
    "Latence des requêtes du service stade"
)

# ═══════════════════════════════════════════════════════════════
# Données simulées
# ═══════════════════════════════════════════════════════════════
STADIUMS = {
    "HASSAN-II": {"name": "Grand Stade Hassan II", "city": "Casablanca 🇲🇦", "capacity": 115000},
    "BERNABEU": {"name": "Santiago Bernabéu", "city": "Madrid 🇪🇸", "capacity": 85000},
    "LUZ": {"name": "Estádio da Luz", "city": "Lisbonne 🇵🇹", "capacity": 65000},
}

SENSOR_TYPES = ["temperature", "humidity", "air_quality", "noise_level", "crowd_density"]


# ═══════════════════════════════════════════════════════════════
# Modèles Pydantic
# ═══════════════════════════════════════════════════════════════
class SensorReading(BaseModel):
    stadium_id: str
    sensor_type: str


# ═══════════════════════════════════════════════════════════════
# Routes
# ═══════════════════════════════════════════════════════════════
@app.get("/")
async def root():
    return {
        "service": "Stade",
        "region": "Lisbonne 🇵🇹",
        "status": "operational",
        "version": "1.0.0",
        "stadiums_monitored": len(STADIUMS),
        "timestamp": datetime.now().isoformat()
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "stade", "region": "Lisbonne"}


@app.get("/stadiums")
async def list_stadiums():
    """Liste de tous les stades monitorés"""
    return {"stadiums": STADIUMS, "sensor_types": SENSOR_TYPES}


@app.get("/sensor/{stadium_id}/{sensor_type}")
async def read_sensor(stadium_id: str, sensor_type: str):
    """Lecture d'un capteur IoT"""
    start = time.time()

    if stadium_id not in STADIUMS:
        raise HTTPException(status_code=404, detail="Stade non trouvé")

    if sensor_type not in SENSOR_TYPES:
        raise HTTPException(status_code=400, detail="Type de capteur invalide")

    time.sleep(random.uniform(0.02, 0.1))

    # Génération de valeurs simulées réalistes
    values = {
        "temperature": round(random.uniform(18, 32), 1),       # °C
        "humidity": round(random.uniform(40, 80), 1),           # %
        "air_quality": random.randint(20, 150),                 # AQI
        "noise_level": round(random.uniform(60, 120), 1),       # dB
        "crowd_density": round(random.uniform(0, 100), 1),      # %
    }

    units = {
        "temperature": "°C",
        "humidity": "%",
        "air_quality": "AQI",
        "noise_level": "dB",
        "crowd_density": "%",
    }

    sensor_readings.labels(stadium=stadium_id, sensor_type=sensor_type).inc()

    duration = time.time() - start
    response_time.observe(duration)

    return {
        "stadium": STADIUMS[stadium_id],
        "sensor_type": sensor_type,
        "value": values[sensor_type],
        "unit": units[sensor_type],
        "timestamp": datetime.now().isoformat(),
        "status": "normal" if values[sensor_type] < 100 else "alert"
    }


@app.post("/check-in")
async def check_in_fan(stadium_id: str, count: int = 1):
    """Enregistrement de l'entrée de spectateurs"""
    if stadium_id not in STADIUMS:
        raise HTTPException(status_code=404, detail="Stade non trouvé")

    stadium_occupancy.labels(stadium=stadium_id).inc(count)

    return {
        "success": True,
        "stadium": STADIUMS[stadium_id],
        "fans_checked_in": count,
        "timestamp": datetime.now().isoformat()
    }


@app.get("/security/scan/{stadium_id}")
async def security_scan(stadium_id: str):
    """Scan de sécurité du stade"""
    if stadium_id not in STADIUMS:
        raise HTTPException(status_code=404, detail="Stade non trouvé")

    # Simulation d'incident léger (2% du temps)
    severity = "none"
    if random.random() < 0.02:
        severity = random.choice(["low", "medium"])
        security_incidents.labels(stadium=stadium_id, severity=severity).inc()

    return {
        "stadium": STADIUMS[stadium_id],
        "scan_status": "completed",
        "incidents_detected": severity if severity != "none" else 0,
        "severity": severity,
        "timestamp": datetime.now().isoformat()
    }


@app.get("/metrics")
async def metrics():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


# ═══════════════════════════════════════════════════════════════
# Démarrage
# ═══════════════════════════════════════════════════════════════
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)