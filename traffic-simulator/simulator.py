"""
🌊 MUNDIAL-OPS 2030 — Simulateur de Trafic
Simule le trafic réel sur les 3 microservices selon un calendrier de matchs.

Modes de trafic :
  - calm   : très peu de requêtes (entre les jours de match)
  - normal : trafic constant (avant-match, hors heure de pointe)
  - peak   : pic massif (30 min avant le coup d'envoi)
  - chaos  : injection d'anomalies (pour la démo Cerveau IA)
"""

import random
import time
import requests
from datetime import datetime
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.live import Live

# ═══════════════════════════════════════════════════════════════
# Configuration
# ═══════════════════════════════════════════════════════════════
console = Console()

SERVICES = {
    "billetterie": "http://localhost:8001",
    "streaming":   "http://localhost:8002",
    "stade":       "http://localhost:8003",
}

MATCHES = ["MAR-BRA", "ESP-FRA", "POR-ARG"]
CATEGORIES_BILLET = ["VIP", "Cat1", "Cat2", "Cat3"]
QUALITIES_STREAM = ["SD", "HD", "4K", "8K"]
STADIUMS = ["HASSAN-II", "BERNABEU", "LUZ"]
SENSORS = ["temperature", "humidity", "air_quality", "noise_level", "crowd_density"]

# Distribution des intensités selon le mode
TRAFFIC_PROFILES = {
    "calm":   {"requests_per_cycle": 2,  "delay": 3.0, "color": "blue"},
    "normal": {"requests_per_cycle": 8,  "delay": 1.0, "color": "green"},
    "peak":   {"requests_per_cycle": 25, "delay": 0.3, "color": "yellow"},
    "chaos":  {"requests_per_cycle": 50, "delay": 0.1, "color": "red"},
}

# Statistiques globales
stats = {
    "total_requests": 0,
    "successful":     0,
    "failed":         0,
    "by_service":     {"billetterie": 0, "streaming": 0, "stade": 0},
}


# ═══════════════════════════════════════════════════════════════
# Générateurs de requêtes par service
# ═══════════════════════════════════════════════════════════════
def hit_billetterie():
    """Simule un achat de billet"""
    try:
        payload = {
            "match_id": random.choice(MATCHES),
            "category": random.choice(CATEGORIES_BILLET),
            "quantity": random.randint(1, 4),
        }
        r = requests.post(f"{SERVICES['billetterie']}/buy", json=payload, timeout=5)
        return r.status_code, "billetterie", payload['match_id']
    except Exception as e:
        return 500, "billetterie", str(e)[:40]


def hit_streaming():
    """Simule un démarrage de stream"""
    try:
        payload = {
            "match_id": random.choice(MATCHES),
            "quality":  random.choice(QUALITIES_STREAM),
        }
        r = requests.post(f"{SERVICES['streaming']}/start-stream", json=payload, timeout=5)
        return r.status_code, "streaming", payload['quality']
    except Exception as e:
        return 500, "streaming", str(e)[:40]


def hit_stade():
    """Simule une lecture de capteur ou un check-in"""
    try:
        action = random.choice(["sensor", "checkin", "security"])
        stadium = random.choice(STADIUMS)

        if action == "sensor":
            sensor = random.choice(SENSORS)
            r = requests.get(f"{SERVICES['stade']}/sensor/{stadium}/{sensor}", timeout=5)
            return r.status_code, "stade", f"{stadium}/{sensor}"
        elif action == "checkin":
            r = requests.post(
                f"{SERVICES['stade']}/check-in",
                params={"stadium_id": stadium, "count": random.randint(1, 10)},
                timeout=5,
            )
            return r.status_code, "stade", f"check-in/{stadium}"
        else:
            r = requests.get(f"{SERVICES['stade']}/security/scan/{stadium}", timeout=5)
            return r.status_code, "stade", f"security/{stadium}"
    except Exception as e:
        return 500, "stade", str(e)[:40]


# ═══════════════════════════════════════════════════════════════
# Génération de trafic
# ═══════════════════════════════════════════════════════════════
def generate_traffic_cycle(mode: str):
    """Génère un cycle de trafic selon le mode"""
    profile = TRAFFIC_PROFILES[mode]
    results = []

    for _ in range(profile["requests_per_cycle"]):
        # Distribution réaliste : 40% billetterie, 35% streaming, 25% stade
        service_choice = random.choices(
            ["billetterie", "streaming", "stade"],
            weights=[0.40, 0.35, 0.25],
        )[0]

        if service_choice == "billetterie":
            status, svc, detail = hit_billetterie()
        elif service_choice == "streaming":
            status, svc, detail = hit_streaming()
        else:
            status, svc, detail = hit_stade()

        stats["total_requests"] += 1
        stats["by_service"][svc] += 1
        if 200 <= status < 300:
            stats["successful"] += 1
        else:
            stats["failed"] += 1

        results.append((datetime.now().strftime("%H:%M:%S"), svc, status, detail))

    return results


# ═══════════════════════════════════════════════════════════════
# Affichage temps réel (effet WOW console)
# ═══════════════════════════════════════════════════════════════
def render_dashboard(mode: str, recent: list):
    """Construit un dashboard console live"""
    profile = TRAFFIC_PROFILES[mode]

    # Header
    header = Panel(
        f"[bold {profile['color']}]🌊 MUNDIAL-OPS 2030 — Simulateur de Trafic[/]\n"
        f"[white]Mode actuel : [bold]{mode.upper()}[/] · "
        f"Cycles à {profile['requests_per_cycle']} req · "
        f"Délai {profile['delay']}s[/]",
        border_style=profile["color"],
    )

    # Tableau des stats
    stats_table = Table(title="📊 Statistiques globales", show_header=True, header_style="bold cyan")
    stats_table.add_column("Métrique", style="white")
    stats_table.add_column("Valeur", justify="right", style="green")
    stats_table.add_row("Total requêtes",        str(stats["total_requests"]))
    stats_table.add_row("✅ Succès",             str(stats["successful"]))
    stats_table.add_row("❌ Échecs",             str(stats["failed"]))
    stats_table.add_row("🎫 Billetterie (CAS)",  str(stats["by_service"]["billetterie"]))
    stats_table.add_row("📺 Streaming (MAD)",    str(stats["by_service"]["streaming"]))
    stats_table.add_row("🏟️  Stade (LIS)",       str(stats["by_service"]["stade"]))

    # Tableau des requêtes récentes
    recent_table = Table(title="🔥 Dernières requêtes", show_header=True, header_style="bold magenta")
    recent_table.add_column("Heure", style="dim", width=10)
    recent_table.add_column("Service", style="white", width=14)
    recent_table.add_column("Status", justify="center", width=8)
    recent_table.add_column("Détail", style="dim")

    for ts, svc, status, detail in recent[-10:]:
        status_color = "green" if 200 <= status < 300 else "red"
        recent_table.add_row(
            ts,
            svc,
            f"[{status_color}]{status}[/]",
            str(detail),
        )

    # Composition finale
    console.clear()
    console.print(header)
    console.print(stats_table)
    console.print(recent_table)


# ═══════════════════════════════════════════════════════════════
# Boucle principale
# ═══════════════════════════════════════════════════════════════
def run_simulator(mode: str = "normal", duration_seconds: int = 0):
    """Lance le simulateur. duration_seconds=0 → infini (Ctrl+C pour arrêter)"""
    console.print(Panel(
        f"[bold green]🚀 Démarrage du simulateur en mode [{mode.upper()}][/]\n"
        "[dim]Appuyez sur Ctrl+C pour arrêter[/]",
        border_style="green",
    ))

    recent_requests = []
    start = time.time()
    profile = TRAFFIC_PROFILES[mode]

    try:
        while True:
            cycle_results = generate_traffic_cycle(mode)
            recent_requests.extend(cycle_results)
            recent_requests = recent_requests[-20:]  # on garde les 20 derniers

            render_dashboard(mode, recent_requests)

            if duration_seconds > 0 and (time.time() - start) >= duration_seconds:
                break

            time.sleep(profile["delay"])

    except KeyboardInterrupt:
        console.print("\n[bold yellow]⏹  Simulateur arrêté par l'utilisateur[/]")
        console.print(f"[dim]Total : {stats['total_requests']} requêtes · "
                      f"Succès : {stats['successful']} · Échecs : {stats['failed']}[/]\n")


# ═══════════════════════════════════════════════════════════════
# Entrée du script
# ═══════════════════════════════════════════════════════════════
if __name__ == "__main__":
    import sys

    # Récupération du mode depuis la ligne de commande
    mode = sys.argv[1] if len(sys.argv) > 1 else "normal"

    if mode not in TRAFFIC_PROFILES:
        console.print(f"[red]❌ Mode inconnu : {mode}[/]")
        console.print(f"[white]Modes disponibles : {', '.join(TRAFFIC_PROFILES.keys())}[/]")
        sys.exit(1)

    run_simulator(mode=mode)