/**
 * 🌍 RegionCard — Carte d'une région (Casablanca, Madrid, Lisbonne)
 * Affiche : drapeau, nom du service, métrique principale live, sparkline
 */

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { queryPrometheus } from '../services/api'

export default function RegionCard({ 
  countryCode,        // 'MA', 'ES', 'PT'
  countryName,        // 'Maroc', 'Espagne', 'Portugal'
  city,               // 'Casablanca', 'Madrid', 'Lisbonne'
  serviceName,        // 'Billetterie', 'Streaming', 'Stade'
  serviceIcon,        // emoji
  promqlQuery,        // requête Prometheus
  promqlTotal,        // requête pour le total cumulé
  unit,               // '/s', 'viewers', 'capteurs'
  primaryColor,       // couleur drapeau (HEX)
  accentColor,        // couleur d'accent (HEX)
}) {
  const [currentRate, setCurrentRate] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [history, setHistory] = useState([])  // pour le sparkline
  const [trend, setTrend] = useState(null)    // 'up' | 'down' | null
  
  // 🔄 Polling toutes les 3 secondes
  useEffect(() => {
    let isMounted = true
    
    const loadData = async () => {
      const [rateResult, totalResult] = await Promise.all([
        queryPrometheus(promqlQuery),
        queryPrometheus(promqlTotal),
      ])
      
      if (!isMounted) return
      
      const newRate = rateResult.value || 0
      const newTotal = totalResult.value || 0
      
      setCurrentRate(newRate)
      setTotalCount(newTotal)
      
      // Mise à jour de l'historique pour le sparkline (20 derniers points)
      setHistory(prev => {
        const updated = [...prev, newRate].slice(-20)
        
        // Calcul de tendance (3 derniers points vs 3 d'avant)
        if (updated.length >= 6) {
          const recent  = updated.slice(-3).reduce((a, b) => a + b, 0) / 3
          const earlier = updated.slice(-6, -3).reduce((a, b) => a + b, 0) / 3
          if (recent > earlier * 1.1)       setTrend('up')
          else if (recent < earlier * 0.9)  setTrend('down')
          else                              setTrend(null)
        }
        
        return updated
      })
    }
    
    loadData()
    const interval = setInterval(loadData, 3000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [promqlQuery, promqlTotal])
  
  // Sparkline : on construit le path SVG à partir de l'historique
  const sparklinePath = buildSparklinePath(history)
  
  return (
    <div 
      className="glass-card-hover relative overflow-hidden transition-all duration-300"
      style={{ borderTopWidth: '3px', borderTopColor: primaryColor }}
    >
      {/* Bandeau supérieur avec pays */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-md flex items-center justify-center text-base font-bold"
            style={{ 
              backgroundColor: `${primaryColor}20`,
              color: primaryColor,
              border: `1px solid ${primaryColor}40`,
            }}
          >
            {countryCode}
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider">
              {city}
            </p>
            <p className="text-sm font-medium text-text-primary">
              {serviceIcon} {serviceName}
            </p>
          </div>
        </div>
        
        {/* Indicateur live */}
        <span 
          className="status-dot animate-pulse-soft"
          style={{ backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}` }}
        />
      </div>
      
      {/* Métrique principale */}
      <div className="px-5 pb-3">
        <div className="flex items-baseline gap-2">
          <span 
            className="text-3xl font-mono font-medium"
            style={{ color: accentColor }}
          >
            {formatValue(currentRate)}
          </span>
          <span className="text-xs text-text-muted">{unit}</span>
          
          {/* Indicateur de tendance */}
          {trend === 'up' && (
            <TrendingUp className="w-4 h-4 text-ok ml-1" strokeWidth={2.5} />
          )}
          {trend === 'down' && (
            <TrendingDown className="w-4 h-4 text-warning ml-1" strokeWidth={2.5} />
          )}
        </div>
        
        <p className="text-[11px] text-text-muted mt-1 font-mono">
          Total : <span className="text-text-secondary">{formatTotal(totalCount)}</span>
        </p>
      </div>
      
      {/* Sparkline (mini-graphique de tendance) */}
      <div className="h-12 px-2">
        <svg width="100%" height="48" viewBox="0 0 200 48" preserveAspectRatio="none">
          {/* Zone remplie sous la courbe */}
          {history.length > 1 && (
            <path
              d={`${sparklinePath} L 200 48 L 0 48 Z`}
              fill={accentColor}
              opacity="0.1"
            />
          )}
          {/* Ligne de la courbe */}
          {history.length > 1 && (
            <path
              d={sparklinePath}
              fill="none"
              stroke={accentColor}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════
function formatValue(value) {
  if (value === 0) return '0.00'
  if (value < 1)   return value.toFixed(2)
  if (value < 100) return value.toFixed(1)
  return Math.round(value).toLocaleString('fr-FR')
}

function formatTotal(value) {
  if (value === 0)    return '0'
  if (value < 1000)   return Math.round(value).toString()
  if (value < 1e6)    return `${(value / 1000).toFixed(1)}k`
  return `${(value / 1e6).toFixed(1)}M`
}

function buildSparklinePath(history) {
  if (history.length < 2) return ''
  
  const width  = 200
  const height = 48
  const padding = 4
  
  const max = Math.max(...history, 1)
  const min = Math.min(...history, 0)
  const range = max - min || 1
  
  const points = history.map((value, index) => {
    const x = (index / (history.length - 1)) * width
    const y = height - padding - ((value - min) / range) * (height - padding * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  
  return `M ${points.join(' L ')}`
}