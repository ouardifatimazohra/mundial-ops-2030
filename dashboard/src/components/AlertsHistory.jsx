/**
 * 📜 AlertsHistory — Liste des dernières alertes du Cerveau IA
 * Cliquer sur une alerte la place dans le panel principal
 */

import { History, ChevronRight } from 'lucide-react'

export default function AlertsHistory({ alerts, selectedId, onSelectAlert }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="glass-card p-5">
        <div className="flex items-center gap-3 mb-3">
          <History className="w-4 h-4 text-text-muted" />
          <h3 className="text-sm font-medium text-text-secondary tracking-wide">
            HISTORIQUE · Alertes
          </h3>
        </div>
        <p className="text-xs text-text-muted py-4 text-center">
          Aucune alerte pour le moment. <br/>
          Le Cerveau IA surveille en continu.
        </p>
      </div>
    )
  }
  
  return (
    <div className="glass-card">
      <div className="px-5 pt-4 pb-3 border-b border-border-default flex items-center justify-between">
        <div className="flex items-center gap-3">
          <History className="w-4 h-4 text-gold-400" />
          <h3 className="text-sm font-medium text-gold-400 tracking-wide">
            HISTORIQUE
          </h3>
        </div>
        <span className="text-[10px] font-mono text-text-muted">
          {alerts.length} alerte{alerts.length > 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {alerts.map((alert, index) => (
          <AlertRow
            key={alert.id || index}
            alert={alert}
            isSelected={alert.id === selectedId}
            onClick={() => onSelectAlert(alert)}
          />
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Composant : une ligne d'alerte cliquable
// ═══════════════════════════════════════════════════════════
function AlertRow({ alert, isSelected, onClick }) {
  const severity = alert.severity || 'medium'
  const colors = {
    low:      '#5DCAA5',
    medium:   '#F4C842',
    high:     '#FF8C42',
    critical: '#FF3B30',
  }
  const color = colors[severity] || colors.medium
  
  return (
    <button
      onClick={onClick}
      className={`
        w-full px-5 py-3 flex items-center gap-3 border-b border-border-subtle
        transition-all duration-150 group
        ${isSelected ? 'bg-bg-tertiary' : 'hover:bg-bg-tertiary/50'}
      `}
    >
      {/* Indicateur de sévérité */}
      <div 
        className="w-1.5 h-8 rounded-full flex-shrink-0"
        style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
      />
      
      {/* Contenu */}
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-text-primary truncate">
            {alert.service || 'Service inconnu'}
          </span>
          <span 
            className="text-[9px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider"
            style={{ 
              backgroundColor: `${color}20`,
              color: color,
            }}
          >
            {severity}
          </span>
        </div>
        <p className="text-[11px] text-text-muted mt-0.5 font-mono truncate">
          {alert.metric} · valeur {alert.value?.toFixed(2)}
        </p>
      </div>
      
      {/* Horodatage + flèche */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[10px] text-text-muted font-mono">
          {formatTime(alert.timestamp)}
        </span>
        <ChevronRight 
          className={`w-3.5 h-3.5 text-text-muted transition-transform ${isSelected ? 'translate-x-0.5 text-gold-400' : 'group-hover:translate-x-0.5'}`}
        />
      </div>
    </button>
  )
}

// ═══════════════════════════════════════════════════════════
// Helper
// ═══════════════════════════════════════════════════════════
function formatTime(timestamp) {
  if (!timestamp) return '--:--'
  try {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour:   '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '--:--'
  }
}