/**
 * 🎬 AIAlertCard — Scène principale d'analyse IA
 * Affiche la dernière alerte du Cerveau IA avec effet typewriter
 * Format : Observation → Hypothèse → Décision → Impact Business
 */

import { useState, useEffect } from 'react'
import { 
  AlertTriangle, Brain, Eye, Lightbulb, Zap, TrendingUp,
  CheckCircle, XCircle, FastForward, Sparkles 
} from 'lucide-react'
import { useTypewriter } from '../hooks/useTypewriter'

export default function AIAlertCard({ alert, fastMode, onToggleFast, onApprove, onIgnore }) {
  
  // Si pas d'alerte, on affiche l'état "veille"
  if (!alert) {
    return (
      <div className="glass-card p-6 border-border-default">
        <div className="flex items-center gap-3 mb-3">
          <Brain className="w-5 h-5 text-gold-400 animate-pulse-soft" />
          <h3 className="text-sm font-medium text-gold-400 tracking-wide">
            CERVEAU IA · En veille active
          </h3>
        </div>
        <div className="flex items-center gap-4 py-6">
          <Sparkles className="w-8 h-8 text-text-muted animate-pulse-soft" />
          <div>
            <p className="text-sm text-text-secondary">
              Le système est stable. Aucune anomalie détectée.
            </p>
            <p className="text-xs text-text-muted mt-1">
              Le Cerveau IA scanne les métriques toutes les 10 secondes.
            </p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <AlertContent 
      alert={alert} 
      fastMode={fastMode} 
      onToggleFast={onToggleFast}
      onApprove={onApprove} 
      onIgnore={onIgnore} 
    />
  )
}

// ═══════════════════════════════════════════════════════════
// Contenu de l'alerte (séparé pour reset de l'effet à chaque nouvelle alerte)
// ═══════════════════════════════════════════════════════════
function AlertContent({ alert, fastMode, onToggleFast, onApprove, onIgnore }) {
  const explanation = alert.ai_explanation || 'Analyse non disponible'
  const [isNew, setIsNew] = useState(false)
  
  // 🎬 Animation flash quand une nouvelle alerte arrive
  useEffect(() => {
    setIsNew(true)
    const timer = setTimeout(() => setIsNew(false), 1200)
    return () => clearTimeout(timer)
  }, [alert.id])
  
  // Effet typewriter
  const { displayed, isComplete } = useTypewriter(explanation, {
    enabled: !fastMode,
    speed:   18,
  })
  
  // Parsing du texte structuré
  const sections = parseExplanation(displayed)
  
  // Calcul de la sévérité (couleurs)
  const severity = alert.severity || 'medium'
  const colors = SEVERITY_COLORS[severity] || SEVERITY_COLORS.medium
  
  return (
    <div 
      className={`glass-card overflow-hidden animate-scale-in transition-all duration-300 ${isNew ? 'new-alert-flash' : ''}`}
      style={{ 
        borderLeft: `4px solid ${colors.border}`,
      }}
    >
      
      {/* ═══════ EN-TÊTE DE L'ALERTE ═══════ */}
      <div 
        className="px-5 py-3 border-b border-border-default flex items-center justify-between"
        style={{ backgroundColor: `${colors.border}10` }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center animate-pulse-glow"
            style={{ backgroundColor: `${colors.border}30` }}
          >
            <AlertTriangle 
              className="w-4 h-4" 
              style={{ color: colors.border }}
              strokeWidth={2.5} 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-text-primary">
                Anomalie détectée
              </p>
              <span 
                className="text-[10px] px-2 py-0.5 rounded font-mono font-medium uppercase tracking-wider"
                style={{ 
                  backgroundColor: `${colors.border}25`,
                  color: colors.border,
                  border: `1px solid ${colors.border}50`,
                }}
              >
                {severity}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              {alert.service}
            </p>
          </div>
        </div>
        
        {/* Toggle Fast Mode + Timestamp */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleFast}
            className={`
              flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono
              transition-all duration-200
              ${fastMode 
                ? 'bg-gold-400/20 text-gold-400 border border-gold-400/40' 
                : 'bg-bg-tertiary text-text-muted border border-border-default hover:border-border-accent'
              }
            `}
            title="Activer/désactiver l'effet typewriter"
          >
            <FastForward className="w-3 h-3" />
            {fastMode ? 'INSTANT' : 'CINEMATIC'}
          </button>
          
          <span className="text-[11px] text-text-muted font-mono">
            {formatTime(alert.timestamp)}
          </span>
        </div>
      </div>
      
      {/* ═══════ CORPS — Analyse structurée du Cerveau IA ═══════ */}
      <div className="px-5 py-4 space-y-3">
        
        <Section
          icon={<Eye className="w-3.5 h-3.5" />}
          label="OBSERVATION"
          content={sections.observation}
          color="#5DCAA5"
        />
        
        <Section
          icon={<Brain className="w-3.5 h-3.5" />}
          label="HYPOTHÈSE"
          content={sections.hypothese}
          color="#F4C842"
        />
        
        <Section
          icon={<Lightbulb className="w-3.5 h-3.5" />}
          label="DÉCISION"
          content={sections.decision}
          color="#00D9FF"
        />
        
        <Section
          icon={<TrendingUp className="w-3.5 h-3.5" />}
          label="IMPACT BUSINESS"
          content={sections.impact}
          color="#D4AF37"
        />
        
        {/* Cursor blinking pendant la frappe */}
        {!isComplete && !fastMode && (
          <span className="inline-block w-2 h-4 bg-gold-400 animate-blink" />
        )}
      </div>
      
      {/* ═══════ ACTIONS ═══════ */}
      <div className="px-5 py-3 border-t border-border-default bg-bg-tertiary/50 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] text-text-muted">
          <Zap className="w-3 h-3" />
          <span className="font-mono">
            Métrique : {alert.metric} · Valeur : {alert.value?.toFixed(2)}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onIgnore}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs text-text-secondary border border-border-default hover:border-border-accent hover:text-text-primary transition-all"
          >
            <XCircle className="w-3.5 h-3.5" />
            Ignorer
          </button>
          
          <button
            onClick={onApprove}
            disabled={!isComplete}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium
              transition-all duration-200
              ${isComplete
                ? 'bg-ok text-bg-primary hover:bg-morocco-accent shadow-[0_0_12px_rgba(93,202,165,0.3)]'
                : 'bg-bg-tertiary text-text-muted cursor-not-allowed'
              }
            `}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Approuver l'action
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Composant : section structurée (Observation, Hypothèse, etc.)
// ═══════════════════════════════════════════════════════════
function Section({ icon, label, content, color }) {
  return (
    <div className="animate-slide-in">
      <div className="flex items-center gap-2 mb-1">
        <span style={{ color }}>{icon}</span>
        <span 
          className="text-[10px] font-mono font-bold tracking-wider"
          style={{ color }}
        >
          {label}
        </span>
      </div>
      <p className="text-sm text-text-primary leading-relaxed ml-5">
        {content || <span className="text-text-muted italic">...</span>}
      </p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════
const SEVERITY_COLORS = {
  low:      { border: '#5DCAA5', label: 'Faible'   },
  medium:   { border: '#F4C842', label: 'Moyenne'  },
  high:     { border: '#FF8C42', label: 'Élevée'   },
  critical: { border: '#FF3B30', label: 'Critique' },
}

function formatTime(timestamp) {
  if (!timestamp) return ''
  try {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour:   '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return ''
  }
}

/**
 * Parse l'explication structurée renvoyée par le Cerveau IA.
 * Format attendu :
 *   🔍 OBSERVATION
 *   [texte]
 *   
 *   🧠 HYPOTHÈSE
 *   [texte]
 *   
 *   ⚡ DÉCISION
 *   [texte]
 *   
 *   📊 IMPACT BUSINESS
 *   [texte]
 */
function parseExplanation(text) {
  if (!text) return { observation: '', hypothese: '', decision: '', impact: '' }
  
  const sections = {
    observation: '',
    hypothese:   '',
    decision:    '',
    impact:      '',
  }
  
  // Regex robustes — capturent même avec emoji ou sans, en majuscules
  const patterns = {
    observation: /(?:🔍\s*)?OBSERVATION\s*\n([\s\S]*?)(?=(?:🧠\s*)?HYPOTH[ÈE]SE|$)/i,
    hypothese:   /(?:🧠\s*)?HYPOTH[ÈE]SE\s*\n([\s\S]*?)(?=(?:⚡\s*)?D[ÉE]CISION|$)/i,
    decision:    /(?:⚡\s*)?D[ÉE]CISION\s*\n([\s\S]*?)(?=(?:📊\s*)?IMPACT|$)/i,
    impact:      /(?:📊\s*)?IMPACT(?:\s*BUSINESS)?\s*\n([\s\S]*?)$/i,
  }
  
  for (const [key, regex] of Object.entries(patterns)) {
    const match = text.match(regex)
    if (match) {
      sections[key] = match[1].trim()
    }
  }
  
  // Fallback : si rien n'a matché, on met tout en observation
  if (!sections.observation && !sections.hypothese) {
    sections.observation = text
  }
  
  return sections
}