# ═══════════════════════════════════════════════════════════════
# 📺 MUNDIAL-OPS 2030 — Service Streaming (Madrid 🇪🇸)
# ═══════════════════════════════════════════════════════════════

FROM python:3.11-slim

LABEL maintainer="Equipe MUNDIAL-OPS 2030"
LABEL service="streaming"
LABEL region="madrid"

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

EXPOSE 8002

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8002/health')" || exit 1

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8002"]