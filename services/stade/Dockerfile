# ═══════════════════════════════════════════════════════════════
# 🏟️ MUNDIAL-OPS 2030 — Service Stade (Lisbonne 🇵🇹)
# ═══════════════════════════════════════════════════════════════

FROM python:3.11-slim

LABEL maintainer="Equipe MUNDIAL-OPS 2030"
LABEL service="stade"
LABEL region="lisbonne"

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

EXPOSE 8003

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8003/health')" || exit 1

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8003"]