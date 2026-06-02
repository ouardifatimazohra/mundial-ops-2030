/**
 * 🧠 AIBrainPanel — Panel complet du Cerveau IA
 * + Bouton "Démo IA" pour générer une alerte à la demande (jury)
 */

import { useState, useEffect } from 'react'
import { Brain, Sparkles, Zap } from 'lucide-react'
import { fetchAlerts, requestExplanation } from '../services/api'
import AIAlertCard from './AIAlertCard'
import AlertsHistory from './AlertsHistory'

// Scénarios de démo prédéfinis (pour le jury)
const DEMO_SCENARIOS = [
  {
    label:    'Pic Maroc-Brésil',
    metric:   'billetterie_sales_rate',
    value:    250,
    deviation_pct: 340,
    service:  'Billetterie (Casablanca 🇲🇦)',
    severity: 'high',
  },
  {
    label:    'Saturation Madrid 8K',
    metric:   'streaming_buffering_rate',
    value:    45,
    deviation_pct: 180,
    service:  'Streaming (Madrid 🇪🇸)',
    severity: 'critical',
  },
  {
    label:    'Capteur Lisbonne HS',
    metric:   'stade_security_rate',
    value:    8,
    deviation_pct: 220,
    service:  'Stade (Lisbonne 🇵🇹)',
    severity: 'high',
  },
]

export default function AIBrainPanel() {
  const [alerts, setAlerts] = useState([])
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [fastMode, setFastMode] = useState(false)
  const [lastFetch, setLastFetch] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  
  // 🔄 Polling toutes les 5 secondes
  useEffect(() => {
    let isMounted = true
    
    const loadAlerts = async () => {
      const result = await fetchAlerts(10)
      if (!isMounted || !result.success) return
      
      const newAlerts = result.data.alerts || []
      setAlerts(newAlerts)
      setLastFetch(new Date())
      
      setSelectedAlert(prev => {
        if (!prev && newAlerts.length > 0) return newAlerts[0]
        if (newAlerts.length === 0) return null
        if (newAlerts[0]?.id !== prev?.id && newAlerts[0]?.id) {
          const wasViewingLatest = newAlerts.slice(1).some(a => a.id === prev?.id)
          return wasViewingLatest ? prev : newAlerts[0]
        }
        return prev
      })
    }
    
    loadAlerts()
    const interval = setInterval(loadAlerts, 5000)
    return () => { isMounted = false; clearInterval(interval) }
  }, [])
  
  // ⭐ Générer une alerte démo à la demande
  const generateDemoAlert = async (scenario) => {
    setIsGenerating(true)
    
    const result = await requestExplanation({
      metric:        scenario.metric,
      value:         scenario.value,
      deviation_pct: scenario.deviation_pct,
      service:       scenario.service,
    })
    
    if (result.success) {
      // Crée une alerte synthétique compatible avec l'affichage
      const demoAlert = {
        id:             `demo-${Date.now()}`,
        timestamp:      new Date().toISOString(),
        service:        scenario.service,
        metric:         scenario.metric,
        value:          scenario.value,
        severity:       scenario.severity,
        ai_explanation: result.data.explanation || result.data.fallback_explanation,
        anomaly_data:   {
          metric:        scenario.metric,
          value:         scenario.value,
          deviation_pct: scenario.deviation_pct,
        },
      }
      
      setSelectedAlert(demoAlert)
      // On l'ajoute aussi en tête de l'historique local
      setAlerts(prev => [demoAlert, ...prev].slice(0, 10))
    }
    
    setIsGenerating(false)
  }
  
  const handleApprove = () => {
    alert(`✅ Action approuvée pour ${selectedAlert?.service}\n\nActions déclenchées :\n• Scaling horizontal du service\n• Activation du cache distribué\n• Notification équipe SRE`)
  }
  
  const handleIgnore = () => {
    console.log('⏸ Alerte ignorée :', selectedAlert?.id)
  }
  
  return (
    <section>
      {/* En-tête avec boutons démo */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-3 flex-1">
          <Brain className="w-4 h-4 text-gold-400" />
          <h2 className="label-section">Cerveau IA · Analyses & décisions</h2>
          <div className="hidden sm:block flex-1 h-px bg-border-default" />
        </div>
        
        {/* Boutons démo (pour la présentation jury) */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
            Démo :
          </span>
          {DEMO_SCENARIOS.map((scenario, idx) => (
            <button
              key={idx}
              onClick={() => generateDemoAlert(scenario)}
              disabled={isGenerating}
              className="btn-demo"
              title={`Injecter le scénario : ${scenario.label}`}
            >
              {isGenerating ? (
                <Sparkles className="w-3 h-3 animate-pulse-soft" />
              ) : (
                <Zap className="w-3 h-3" />
              )}
              <span>{scenario.label}</span>
            </button>
          ))}
        </div>
        
        {lastFetch && (
          <span className="text-[10px] text-text-muted font-mono ml-auto">
            Sync : {lastFetch.toLocaleTimeString('fr-FR')}
          </span>
        )}
      </div>
      
      {/* Grid : alerte principale + historique */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <AIAlertCard
            alert={selectedAlert}
            fastMode={fastMode}
            onToggleFast={() => setFastMode(f => !f)}
            onApprove={handleApprove}
            onIgnore={handleIgnore}
          />
        </div>
        
        <div>
          <AlertsHistory
            alerts={alerts}
            selectedId={selectedAlert?.id}
            onSelectAlert={setSelectedAlert}
          />
        </div>
      </div>
    </section>
  )
}