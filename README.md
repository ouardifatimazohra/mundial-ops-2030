# 🏆 MUNDIAL-OPS 2030

[![CI/CD Pipeline](https://github.com/ouardifatimazohra/mundial-ops-2030/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/ouardifatimazohra/mundial-ops-2030/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11](https://img.shields.io/badge/python-3.11-blue.svg)](https://www.python.org/downloads/release/python-3119/)
[![Docker](https://img.shields.io/badge/docker-ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?logo=fastapi)](https://fastapi.tiangolo.com)

> **Plateforme DevOps intelligente d'orchestration de la Coupe du Monde 2030**
> Une infrastructure auto-pilotée par IA qui orchestre les services numériques critiques de la Coupe du Monde 2030, hébergée sur les 3 pays co-organisateurs.

🇲🇦 **Maroc** &nbsp;·&nbsp; 🇪🇸 **Espagne** &nbsp;·&nbsp; 🇵🇹 **Portugal**

---

## 🎯 Vision

MUNDIAL-OPS 2030 simule la **salle de contrôle numérique** de la Coupe du Monde 2030. Elle pilote en temps réel les services critiques (billetterie, streaming, capteurs IoT des stades) répartis sur 3 régions, avec :

- 🤖 **Détection automatique d'anomalies** par IA
- 📊 **Observabilité industrielle** (Prometheus + Grafana)
- ⚙️ **Pipeline CI/CD automatisé** (GitHub Actions)
- 🌍 **Multi-région** simulée Maroc-Espagne-Portugal

---

## 🏗️ Architecture

| Couche | Composant | Technologie | Région |
|--------|-----------|-------------|--------|
| 🎫 Service | Billetterie | FastAPI · Python 3.11 | Casablanca 🇲🇦 |
| 📺 Service | Streaming | FastAPI · Python 3.11 | Madrid 🇪🇸 |
| 🏟️ Service | Stade (IoT) | FastAPI · Python 3.11 | Lisbonne 🇵🇹 |
| 🌊 Charge | Simulateur de trafic | Python · Rich | — |
| 📊 Métriques | Prometheus | TSDB | — |
| 🎨 Dashboards | Grafana | Provisioning auto | — |
| 🧠 IA | Cerveau IA | Scikit-learn + Claude API | — |
| ⚙️ CI/CD | Pipeline | GitHub Actions | — |
| 🎯 Frontend | Mission Control | React | — |

---

## 🚀 Démarrage rapide

### Prérequis
- Docker Desktop · Python 3.11 · Git · Node.js 18+

### Lancement
```bash
git clone https://github.com/ouardifatimazohra/mundial-ops-2030.git
cd mundial-ops-2030
docker compose up -d --build
```

### Services accessibles
| Service | URL | Description |
|---------|-----|-------------|
| 🎫 Billetterie | http://localhost:8001/docs | API de vente de billets |
| 📺 Streaming | http://localhost:8002/docs | API de diffusion vidéo |
| 🏟️ Stade | http://localhost:8003/docs | API capteurs IoT |
| 📊 Prometheus | http://localhost:9090 | Métriques temps réel |
| 🎨 Grafana | http://localhost:3000 | Dashboards (admin / mundial2030) |

### Simulateur de trafic
```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r traffic-simulator/requirements.txt
python traffic-simulator/simulator.py peak
```

---

## 👥 Équipe

| Membre | Rôle |
|--------|------|
| **Fati Ouardi** | Tech Lead · IA · Architecture |
| **Asmae** | DevOps · Automatisation · CI/CD |
| **Meryem** | Microservices · Observabilité |

---

## 📅 Projet académique

- **Cours** : Industrie Logicielle — Automatisation
- **Date de livraison** : 03 juin 2026
- **Établissement** : Génie Informatique, Maroc

---

🏆 **Fait avec passion pour la Coupe du Monde 2030.** 🇲🇦🇪🇸🇵🇹