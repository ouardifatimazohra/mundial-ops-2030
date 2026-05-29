"""
🧠 MUNDIAL-OPS 2030 — Agent IA via Groq (Llama 3.3 70B)
Transforme les anomalies brutes en explications cinématiques en français.
"""

import os
from groq import Groq
from typing import Dict, Optional


class GroqIncidentExplainer:
    """
    Agent IA qui explique les incidents en langage naturel français,
    avec un raisonnement structuré : Observation → Hypothèse → Décision.
    """

    SYSTEM_PROMPT = """Tu es le Cerveau IA de MUNDIAL-OPS 2030, la plateforme \
d'orchestration de la Coupe du Monde 2030 (Maroc 🇲🇦, Espagne 🇪🇸, Portugal 🇵🇹).

Tu es un expert SRE (Site Reliability Engineer) qui analyse les incidents \
en temps réel sur 3 microservices :
- 🎫 Billetterie (Casablanca) — vente de billets
- 📺 Streaming (Madrid) — diffusion vidéo des matchs
- 🏟️ Stade (Lisbonne) — capteurs IoT des stades

Quand on te donne une anomalie détectée, tu réponds TOUJOURS en français, \
TOUJOURS dans ce format strict (raisonnement cinématique structuré) :

🔍 OBSERVATION
[Décris en 1 phrase concrète ce qui se passe, avec les chiffres clés]

🧠 HYPOTHÈSE
[Explique en 1-2 phrases la cause probable, contextualisée Coupe du Monde]

⚡ DÉCISION
[Recommande 1 action technique précise, prête à exécuter]

📊 IMPACT BUSINESS
[1 phrase quantifiée : revenus protégés, spectateurs maintenus, etc.]

Sois CONCIS (max 80 mots total), TECHNIQUE et CINÉMATIQUE. \
Utilise le présent de l'indicatif. Pas de "je pense que", sois affirmatif."""

    def __init__(self):
        api_key = os.getenv('GROQ_API_KEY')
        if not api_key:
            raise ValueError("GROQ_API_KEY manquante dans les variables d'environnement")

        self.client = Groq(api_key=api_key)
        self.model = os.getenv('GROQ_MODEL', 'llama-3.3-70b-versatile')

    def explain_anomaly(self, anomaly_data: Dict, service_context: Optional[str] = None) -> Dict:
        """
        Génère une explication cinématique de l'anomalie.

        :param anomaly_data: dict avec metric, value, deviation_pct, etc.
        :param service_context: nom du service concerné (billetterie, streaming, stade)
        :return: dict avec l'explication structurée
        """
        # Préparation du contexte pour le LLM
        user_prompt = f"""ANOMALIE DÉTECTÉE :

Service concerné : {service_context or 'inconnu'}
Métrique : {anomaly_data.get('metric', 'N/A')}
Valeur actuelle : {anomaly_data.get('value', 'N/A')}
Moyenne historique : {anomaly_data.get('mean', 'N/A'):.2f}
Déviation : {anomaly_data.get('deviation_pct', 0):.1f}% par rapport à la normale
Score d'anomalie : {anomaly_data.get('anomaly_score', 0):.3f}

Génère ton analyse cinématique."""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.5,
                max_tokens=300,
                top_p=0.9,
            )

            explanation = response.choices[0].message.content

            return {
                'success': True,
                'explanation': explanation,
                'model_used': self.model,
                'tokens_used': response.usage.total_tokens,
                'service': service_context,
                'anomaly_data': anomaly_data,
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'fallback_explanation': self._fallback_explanation(anomaly_data, service_context),
            }

    def _fallback_explanation(self, anomaly_data: Dict, service_context: Optional[str]) -> str:
        """Explication de secours si l'API Groq échoue (réseau, quota, etc.)"""
        return f"""🔍 OBSERVATION
Anomalie détectée sur {service_context or 'service inconnu'} : métrique \
{anomaly_data.get('metric', 'N/A')} à {anomaly_data.get('value', 'N/A')}, \
soit {anomaly_data.get('deviation_pct', 0):.1f}% d'écart.

🧠 HYPOTHÈSE
Cause probable : pic de charge non anticipé ou défaillance d'un composant amont.

⚡ DÉCISION
Lancer un scaling horizontal du service et vérifier les dépendances.

📊 IMPACT BUSINESS
Service critique de la Coupe du Monde 2030 — action immédiate requise."""