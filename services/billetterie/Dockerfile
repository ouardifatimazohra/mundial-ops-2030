# ═══════════════════════════════════════════════════════════════
# 🎫 MUNDIAL-OPS 2030 — Service Billetterie (Casablanca 🇲🇦)
# Image Docker basée sur Python 3.11 slim (légère et rapide)
# ═══════════════════════════════════════════════════════════════

FROM python:3.11-slim

# Métadonnées
LABEL maintainer="Equipe MUNDIAL-OPS 2030"
LABEL service="billetterie"
LABEL region="casablanca"

# Dossier de travail dans le conteneur
WORKDIR /app

# Optimisation : on copie d'abord requirements.txt seul
# pour profiter du cache Docker si on ne change que le code
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie du code de l'application
COPY app.py .

# Port exposé par le service
EXPOSE 8001

# Healthcheck : Docker vérifie automatiquement que le service répond
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8001/health')" || exit 1

# Commande de démarrage
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8001"]