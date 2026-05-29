/**
 * 🧠 AIBrainPanel — Panel complet du Cerveau IA
 * Scène principale (dernière alerte avec typewriter) + Historique cliquable
 * Polling automatique toutes les 5 secondes pour récupérer les nouvelles alertes
 */

import { useState, useEffect } from 'react'
import { Brain } from 'lucide-react'
import { fetchAlerts } from '../services/api'
import AIAlertCard from './AIAlertCard'
import AlertsHistory from './AlertsHistory'

export default function AIBrainPanel() {
  const [alerts, setAlerts] = useState([])
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [fastMode, setFastMode] = useState(false)
  const [lastFetch, setLastFetch] = useState(null)
  
  // 🔄 Polling des alertes toutes les 5 secondes
  useEffect(() => {
    let isMounted = true
    
    const loadAlerts = async () => {
      const result = await fetchAlerts(10)
      
      if (!isMounted || !result.success) return
      
      const newAlerts = result.data.alerts || []
      setAlerts(newAlerts)
      setLastFetch(new Date())
      
      // Si pas encore de sélection ET il y a des alertes → on prend la plus récente
      // Si nouvelle alerte arrive ET on n'a pas changé manuellement la sélection → on bascule
      setSelectedAlert(prev => {
        // Première charge
        if (!prev && newAlerts.length > 0) return newAlerts[0]
        // Pas d'alerte
        if (newAlerts.length === 0) return null
        // Une nouvelle alerte est arrivée en première position (id différent)
        if (newAlerts[0]?.id !== prev?.id && newAlerts[0]?.id) {
          // On bascule SEULEMENT si l'utilisateur était sur la dernière alerte
          // (pas s'il a manuellement cliqué sur une plus ancienne)
          const wasViewingLatest = newAlerts.slice(1).some(a => a.id === prev?.id)
          return wasViewingLatest ? prev : newAlerts[0]
        }
        return prev
      })
    }
    
    loadAlerts()
    const interval = setInterval(loadAlerts, 5000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])
  
  const handleApprove = () => {
    // Simulation d'action : dans une vraie infra on déclencherait le scaling
    console.log('✅ Action approuvée pour :', selectedAlert?.id)
    // Petite animation visuelle simple : on pourrait ajouter un toast
    alert(`✅ Action approuvée pour ${selectedAlert?.service}\n\nDans un système réel, cette action déclencherait :\n• Scaling horizontal du service\n• Mise en route du cache distribué\n• Notification équipe SRE`)
  }
  
  const handleIgnore = () => {
    console.log('⏸ Alerte ignorée :', selectedAlert?.id)
  }
  
  return (
    <section>
      {/* En-tête de section */}
      <div className="flex items-center gap-3 mb-4">
        <Brain className="w-4 h-4 text-gold-400" />
        <h2 className="label-section">Cerveau IA · Analyses & décisions</h2>
        <div className="flex-1 h-px bg-border-default" />
        {lastFetch && (
          <span className="text-[10px] text-text-muted font-mono">
            Sync : {lastFetch.toLocaleTimeString('fr-FR')}
          </span>
        )}
      </div>
      
      {/* Grid : alerte principale (large) + historique (côté) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Colonne principale : scène d'analyse */}
        <div className="lg:col-span-2">
          <AIAlertCard
            alert={selectedAlert}
            fastMode={fastMode}
            onToggleFast={() => setFastMode(f => !f)}
            onApprove={handleApprove}
            onIgnore={handleIgnore}
          />
        </div>
        
        {/* Colonne secondaire : historique */}
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