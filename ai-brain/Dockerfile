# ═══════════════════════════════════════════════════════════════
# 🧠 MUNDIAL-OPS 2030 — Cerveau IA
# ═══════════════════════════════════════════════════════════════

FROM python:3.11-slim

LABEL maintainer="Equipe MUNDIAL-OPS 2030"
LABEL service="ai-brain"
LABEL component="anomaly-detection-llm"

WORKDIR /app

# Installation des dépendances système nécessaires pour scikit-learn
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY *.py ./

EXPOSE 8004

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8004/health')" || exit 1

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8004"]