/**
 * 🟢 SystemStatus — Statut live du système global
 * Affiche : uptime · observations · anomalies détectées · santé Prometheus
 * Mise à jour automatique toutes les 5 secondes
 */

import { useState, useEffect } from 'react'
import { Brain, Activity, AlertTriangle, Eye, Zap } from 'lucide-react'
import { fetchBrainStats } from '../services/api'

export default function SystemStatus() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  
  // 🔄 Polling toutes les 5 secondes
  useEffect(() => {
    let isMounted = true
    
    const loadStats = async () => {
      const result = await fetchBrainStats()
      
      if (!isMounted) return
      
      if (result.success) {
        setStats(result.data)
        setError(null)
        setLastUpdate(new Date())
      } else {
        setError(result.error)
      }
      setLoading(false)
    }
    
    // 1er appel immédiat
    loadStats()
    
    // Puis toutes les 5 secondes
    const interval = setInterval(loadStats, 5000)
    
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])
  
  // Formatage de l'uptime en heures/minutes/secondes
  const formatUptime = (seconds) => {
    if (!seconds || seconds < 1) return '0s'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    if (h > 0) return `${h}h ${m}m ${s}s`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
  }
  
  // État de chargement initial
  if (loading) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-gold-400 animate-pulse-soft" />
          <span className="text-sm text-text-secondary">
            Connexion au Cerveau IA...
          </span>
        </div>
      </div>
    )
  }
  
  // État d'erreur (Cerveau IA inaccessible)
  if (error) {
    return (
      <div className="glass-card p-6 border-critical/40">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-critical" />
          <div className="flex-1">
            <p className="text-sm text-critical font-medium">
              Cerveau IA inaccessible
            </p>
            <p className="text-xs text-text-muted mt-1 font-mono">
              {error}
            </p>
          </div>
        </div>
        <p className="text-[11px] text-text-muted mt-3">
          💡 Vérifie que <span className="font-mono text-info">mundial-ai-brain</span> tourne dans Docker
        </p>
      </div>
    )
  }
  
  // ═══════════════════════════════════════════════════════════
  // Rendu principal — Tout va bien
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="glass-card p-6 animate-fade-in">
      
      {/* En-tête */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Brain className="w-5 h-5 text-gold-400" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-ok rounded-full animate-pulse-soft shadow-[0_0_6px_rgba(93,202,165,0.8)]" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gold-400 tracking-wide">
              CERVEAU IA · État Système
            </h3>
            <p className="text-[11px] text-text-muted font-mono">
              Llama 3.3 70B · Isolation Forest
            </p>
          </div>
        </div>
        
        {/* Indicateur "live" */}
        <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
          <span className="status-dot status-ok" />
          <span className="font-mono">LIVE</span>
        </div>
      </div>
      
      {/* Grille de métriques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        
        <MetricBox
          icon={<Activity className="w-4 h-4" />}
          label="Uptime"
          value={formatUptime(stats.uptime_seconds)}
          color="ok"
        />
        
        <MetricBox
          icon={<Eye className="w-4 h-4" />}
          label="Observations"
          value={stats.total_observations.toLocaleString('fr-FR')}
          color="info"
        />
        
        <MetricBox
          icon={<AlertTriangle className="w-4 h-4" />}
          label="Anomalies"
          value={stats.total_anomalies_detected}
          color={stats.total_anomalies_detected > 0 ? 'warning' : 'ok'}
        />
        
        <MetricBox
          icon={<Zap className="w-4 h-4" />}
          label="Taux Anomalies"
          value={`${stats.anomaly_rate_pct.toFixed(1)}%`}
          color={stats.anomaly_rate_pct > 5 ? 'warning' : 'ok'}
        />
        
      </div>
      
      {/* Footer : dernière MAJ */}
      <div className="mt-4 pt-3 border-t border-border-default flex items-center justify-between text-[10px] text-text-muted">
        <span className="font-mono">
          Prometheus : {stats.prometheus_healthy ? (
            <span className="text-ok">● connecté</span>
          ) : (
            <span className="text-critical">● déconnecté</span>
          )}
        </span>
        <span className="font-mono">
          Dernière MAJ : {lastUpdate?.toLocaleTimeString('fr-FR')}
        </span>
      </div>
      
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Composant interne : Box pour une métrique
// ═══════════════════════════════════════════════════════════
function MetricBox({ icon, label, value, color }) {
  const colorClasses = {
    ok:       'text-ok',
    warning:  'text-warning',
    critical: 'text-critical',
    info:     'text-info',
  }
  
  return (
    <div className="bg-bg-tertiary border border-border-subtle rounded-md p-3">
      <div className="flex items-center gap-2 mb-1.5">
        <span className={colorClasses[color]}>{icon}</span>
        <span className="text-[10px] text-text-muted uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className={`text-xl font-mono font-medium ${colorClasses[color]}`}>
        {value}
      </p>
    </div>
  )
}