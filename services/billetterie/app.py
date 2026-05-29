"""
🎫 MUNDIAL-OPS 2030 — Service Billetterie
Région : Casablanca, Maroc 🇲🇦
Rôle : Gérer les ventes de billets pour les matchs de la Coupe du Monde
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from fastapi.responses import Response
from datetime import datetime
import random
import time

# ═══════════════════════════════════════════════════════════════
# Configuration de l'application
# ═══════════════════════════════════════════════════════════════
app = FastAPI(
    title="MUNDIAL-OPS 2030 — Billetterie",
    description="Service de billetterie — Région Casablanca 🇲🇦",
    version="1.0.0"
)

# ═══════════════════════════════════════════════════════════════
# Métriques Prometheus (pour l'observabilité)
# ═══════════════════════════════════════════════════════════════
tickets_sold = Counter(
    "billetterie_tickets_sold_total",
    "Nombre total de billets vendus",
    ["match", "category"]
)

request_duration = Histogram(
    "billetterie_request_duration_seconds",
    "Durée des requêtes de billetterie"
)

errors_counter = Counter(
    "billetterie_errors_total",
    "Nombre total d'erreurs",
    ["error_type"]
)

# ═══════════════════════════════════════════════════════════════
# Données simulées : matchs de la Coupe du Monde
# ═══════════════════════════════════════════════════════════════
MATCHES = {
    "MAR-BRA": {"home": "Maroc 🇲🇦", "away": "Brésil 🇧🇷", "stadium": "Grand Stade Hassan II", "date": "2030-06-15"},
    "ESP-FRA": {"home": "Espagne 🇪🇸", "away": "France 🇫🇷", "stadium": "Santiago Bernabéu", "date": "2030-06-16"},
    "POR-ARG": {"home": "Portugal 🇵🇹", "away": "Argentine 🇦🇷", "stadium": "Estádio da Luz", "date": "2030-06-17"},
}

CATEGORIES = {
    "VIP": 5000,
    "Cat1": 1500,
    "Cat2": 800,
    "Cat3": 400,
}


# ═══════════════════════════════════════════════════════════════
# Modèles Pydantic
# ═══════════════════════════════════════════════════════════════
class TicketRequest(BaseModel):
    match_id: str
    category: str
    quantity: int = 1


# ═══════════════════════════════════════════════════════════════
# Routes
# ═══════════════════════════════════════════════════════════════
@app.get("/")
async def root():
    """Page d'accueil du service"""
    return {
        "service": "Billetterie",
        "region": "Casablanca 🇲🇦",
        "status": "operational",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/health")
async def health():
    """Endpoint de santé pour Docker / Kubernetes"""
    return {"status": "healthy", "service": "billetterie", "region": "Casablanca"}


@app.get("/matches")
async def list_matches():
    """Liste tous les matchs disponibles"""
    return {"matches": MATCHES, "categories": CATEGORIES}


@app.post("/buy")
async def buy_ticket(request: TicketRequest):
    """Achat de billet — c'est ICI que se passe la magie de la simulation"""
    start = time.time()
    
    # Validation
    if request.match_id not in MATCHES:
        errors_counter.labels(error_type="match_not_found").inc()
        raise HTTPException(status_code=404, detail="Match non trouvé")
    
    if request.category not in CATEGORIES:
        errors_counter.labels(error_type="invalid_category").inc()
        raise HTTPException(status_code=400, detail="Catégorie invalide")
    
    # Simulation d'un délai de traitement (paiement, etc.)
    processing_time = random.uniform(0.05, 0.3)
    time.sleep(processing_time)
    
    # Simulation d'une erreur aléatoire (1% du temps) - réaliste !
    if random.random() < 0.01:
        errors_counter.labels(error_type="payment_failed").inc()
        raise HTTPException(status_code=503, detail="Paiement échoué (simulation)")
    
    # Succès — on enregistre la vente
    tickets_sold.labels(match=request.match_id, category=request.category).inc(request.quantity)
    
    total_price = CATEGORIES[request.category] * request.quantity
    
    duration = time.time() - start
    request_duration.observe(duration)
    
    return {
        "success": True,
        "match": MATCHES[request.match_id],
        "category": request.category,
        "quantity": request.quantity,
        "total_price_mad": total_price,
        "processing_time_ms": round(duration * 1000, 2),
        "ticket_id": f"MAR-{random.randint(100000, 999999)}"
    }


@app.get("/metrics")
async def metrics():
    """Endpoint Prometheus — c'est ce que le Cerveau IA va surveiller"""
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


# ═══════════════════════════════════════════════════════════════
# Démarrage
# ═══════════════════════════════════════════════════════════════
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)