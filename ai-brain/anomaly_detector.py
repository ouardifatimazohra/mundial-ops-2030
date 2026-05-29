"""
🧠 MUNDIAL-OPS 2030 — Détecteur d'anomalies
Utilise un Isolation Forest pour détecter les comportements anormaux
sur les métriques des 3 microservices.
"""

import numpy as np
from sklearn.ensemble import IsolationForest
from collections import deque
from datetime import datetime
from typing import Dict, List, Optional


class MetricsAnomalyDetector:
    """
    Détecteur d'anomalies basé sur Isolation Forest.
    
    Principe :
    - On garde une fenêtre glissante des 60 dernières mesures (5 min à 5s/scrape)
    - Quand on a assez de données (>= 20 points), on entraîne le modèle
    - Pour chaque nouvelle mesure, on prédit : -1 = anomalie, 1 = normal
    """

    def __init__(self, contamination: float = 0.1, window_size: int = 60):
        """
        :param contamination: proportion attendue d'anomalies (10% par défaut)
        :param window_size: nombre de points dans la fenêtre glissante
        """
        self.window_size = window_size
        self.contamination = contamination
        self.history: Dict[str, deque] = {}
        self.models: Dict[str, IsolationForest] = {}
        self.min_samples_to_train = 20

    def _ensure_metric(self, metric_name: str):
        """Initialise les structures pour une nouvelle métrique"""
        if metric_name not in self.history:
            self.history[metric_name] = deque(maxlen=self.window_size)
            self.models[metric_name] = None

    def add_observation(self, metric_name: str, value: float) -> Optional[Dict]:
        """
        Ajoute une nouvelle observation et détecte si c'est une anomalie.
        
        Retourne :
        - None si pas assez de données pour entraîner
        - Dict avec {'is_anomaly': bool, 'score': float, ...} sinon
        """
        self._ensure_metric(metric_name)
        self.history[metric_name].append(value)

        # Pas assez de données pour entraîner le modèle
        if len(self.history[metric_name]) < self.min_samples_to_train:
            return {
                'metric': metric_name,
                'value': value,
                'is_anomaly': False,
                'reason': 'collecting_data',
                'samples_collected': len(self.history[metric_name]),
                'samples_needed': self.min_samples_to_train,
            }

        # Entraînement / ré-entraînement du modèle
        data = np.array(list(self.history[metric_name])).reshape(-1, 1)
        model = IsolationForest(
            contamination=self.contamination,
            random_state=42,
            n_estimators=50,
        )
        model.fit(data)
        self.models[metric_name] = model

        # Prédiction sur la dernière observation
        prediction = model.predict([[value]])[0]
        score = model.score_samples([[value]])[0]
        is_anomaly = (prediction == -1)

        # Calcul de statistiques pour donner du contexte
        mean = float(np.mean(data))
        std = float(np.std(data))
        deviation_pct = ((value - mean) / mean * 100) if mean != 0 else 0

        return {
            'metric': metric_name,
            'value': float(value),
            'is_anomaly': bool(is_anomaly),
            'anomaly_score': float(score),
            'mean': mean,
            'std': std,
            'deviation_pct': float(deviation_pct),
            'timestamp': datetime.now().isoformat(),
        }

    def get_stats(self) -> Dict:
        """Statistiques globales du détecteur"""
        return {
            'metrics_tracked': list(self.history.keys()),
            'total_observations': sum(len(h) for h in self.history.values()),
            'models_trained': sum(1 for m in self.models.values() if m is not None),
        }