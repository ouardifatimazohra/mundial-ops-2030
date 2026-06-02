/**
 * 📈 TrafficChart — Graphique temps réel multi-services
 * Affiche les courbes superposées des 3 services régionaux
 * Mise à jour toutes les 5 secondes
 */

import { useState, useEffect } from 'react'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Area, AreaChart 
} from 'recharts'
import { Activity, TrendingUp } from 'lucide-react'
import { queryPrometheus } from '../services/api'

// Configuration des séries
const SERIES = [
  {
    key:          'billetterie',
    label:        '🎫 Billetterie',
    city:         'Casablanca',
    country:      'MA',
    color:        '#5DCAA5',  // Vert Maroc accent
    promql:       'sum(rate(billetterie_tickets_sold_total[15s]))',
  },
  {
    key:          'streaming',
    label:        '📺 Streaming',
    city:         'Madrid',
    country:      'ES',
    color:        '#F4C842',  // Jaune Espagne accent
    promql:       'sum(rate(streaming_starts_total[15s]))',
  },
  {
    key:          'stade',
    label:        '🏟️ Stade IoT',
    city:         'Lisbonne',
    country:      'PT',
    color:        '#97C459',  // Vert Portugal accent
    promql:       'sum(rate(stade_sensor_readings_total[15s]))',
  },
]

const MAX_POINTS = 30  // 30 points × 5s = 2.5 min d'historique

export default function TrafficChart() {
  const [history, setHistory] = useState([])
  const [activeSeries, setActiveSeries] = useState({
    billetterie: true,
    streaming:   true,
    stade:       true,
  })
  
  // 🔄 Polling toutes les 5 secondes
  useEffect(() => {
    let isMounted = true
    
    const loadDataPoint = async () => {
      // On lance les 3 requêtes en parallèle
      const results = await Promise.all(
        SERIES.map(s => queryPrometheus(s.promql))
      )
      
      if (!isMounted) return
      
      const newPoint = {
        time: new Date().toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit',
        }),
        billetterie: parseFloat((results[0].value || 0).toFixed(2)),
        streaming:   parseFloat((results[1].value || 0).toFixed(2)),
        stade:       parseFloat((results[2].value || 0).toFixed(2)),
      }
      
      setHistory(prev => [...prev, newPoint].slice(-MAX_POINTS))
    }
    
    loadDataPoint()
    const interval = setInterval(loadDataPoint, 5000)
    return () => { 
      isMounted = false
      clearInterval(interval) 
    }
  }, [])
  
  // Toggle d'une série (clic sur la légende)
  const toggleSeries = (key) => {
    setActiveSeries(prev => ({ ...prev, [key]: !prev[key] }))
  }
  
  // Calcul des moyennes pour la légende
  const computeAverage = (key) => {
    if (history.length === 0) return 0
    const sum = history.reduce((acc, point) => acc + (point[key] || 0), 0)
    return (sum / history.length).toFixed(2)
  }
  
  const lastPoint = history[history.length - 1]
  
  return (
    <div className="glass-card p-6">
      
      {/* En-tête */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Activity className="w-5 h-5 text-gold-400" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-info rounded-full animate-pulse-soft" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gold-400 tracking-wide">
              TRAFIC TEMPS RÉEL · VUE GLOBALE
            </h3>
            <p className="text-[11px] text-text-muted font-mono">
              {history.length} points · Fenêtre 2.5 min · MAJ toutes les 5s
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
          <span className="status-dot status-ok" />
          <span className="font-mono">STREAMING LIVE</span>
        </div>
      </div>
      
      {/* Légende interactive (clic pour activer/désactiver) */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {SERIES.map(s => (
          <button
            key={s.key}
            onClick={() => toggleSeries(s.key)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-mono
              border transition-all duration-200
              ${activeSeries[s.key]
                ? 'bg-bg-tertiary border-border-default'
                : 'bg-transparent border-border-subtle opacity-40 hover:opacity-70'
              }
            `}
            title={`${activeSeries[s.key] ? 'Masquer' : 'Afficher'} ${s.label}`}
          >
            <span 
              className="w-2.5 h-2.5 rounded-full" 
              style={{ 
                backgroundColor: s.color,
                boxShadow: activeSeries[s.key] ? `0 0 6px ${s.color}` : 'none',
              }}
            />
            <span className="text-text-primary">
              {s.label}
            </span>
            <span className="text-text-muted">·</span>
            <span style={{ color: s.color }}>
              {lastPoint?.[s.key]?.toFixed(2) || '0.00'}
            </span>
            <span className="text-text-muted">/sec</span>
          </button>
        ))}
      </div>
      
      {/* Graphique */}
      <div className="h-72 -mx-2">
        {history.length === 0 ? (
          <LoadingState />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={history}
              margin={{ top: 10, right: 16, left: -10, bottom: 0 }}
            >
              {/* Définitions des dégradés pour chaque série */}
              <defs>
                {SERIES.map(s => (
                  <linearGradient 
                    key={`gradient-${s.key}`} 
                    id={`gradient-${s.key}`} 
                    x1="0" y1="0" x2="0" y2="1"
                  >
                    <stop offset="0%"   stopColor={s.color} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              
              {/* Grille */}
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#2A3144" 
                opacity={0.4} 
                vertical={false}
              />
              
              {/* Axe X */}
              <XAxis 
                dataKey="time" 
                tick={{ fill: '#5A6178', fontSize: 10, fontFamily: 'monospace' }}
                axisLine={{ stroke: '#2A3144' }}
                tickLine={{ stroke: '#2A3144' }}
                interval="preserveStartEnd"
                minTickGap={50}
              />
              
              {/* Axe Y */}
              <YAxis 
                tick={{ fill: '#5A6178', fontSize: 10, fontFamily: 'monospace' }}
                axisLine={{ stroke: '#2A3144' }}
                tickLine={{ stroke: '#2A3144' }}
                tickFormatter={(value) => value.toFixed(1)}
              />
              
              {/* Tooltip custom */}
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#0F1525',
                  border: '1px solid #2A3144',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}
                labelStyle={{ color: '#D4AF37', fontWeight: 'bold' }}
                itemStyle={{ padding: '2px 0' }}
                formatter={(value, name) => {
                  const series = SERIES.find(s => s.key === name)
                  return [
                    `${value.toFixed(2)} /sec`, 
                    series ? `${series.label}` : name,
                  ]
                }}
              />
              
              {/* 3 séries en aires superposées */}
              {SERIES.map(s => (
                activeSeries[s.key] && (
                  <Area
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    stroke={s.color}
                    strokeWidth={2}
                    fill={`url(#gradient-${s.key})`}
                    dot={false}
                    activeDot={{ 
                      r: 5, 
                      fill: s.color, 
                      stroke: '#0A0E1A', 
                      strokeWidth: 2 
                    }}
                    isAnimationActive={false}  // pour fluidité du live
                  />
                )
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
      
      {/* Footer : statistiques */}
      <div className="mt-4 pt-3 border-t border-border-default grid grid-cols-3 gap-3 text-[11px]">
        {SERIES.map(s => (
          <div key={s.key} className="flex items-center gap-2">
            <span 
              className="w-1.5 h-6 rounded-full" 
              style={{ backgroundColor: s.color }}
            />
            <div>
              <p className="text-text-muted font-mono">
                {s.country} · Moyenne
              </p>
              <p style={{ color: s.color }} className="font-mono font-medium">
                {computeAverage(s.key)} /sec
              </p>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// État de chargement
// ═══════════════════════════════════════════════════════════
function LoadingState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-text-muted">
      <Activity className="w-8 h-8 animate-pulse-soft mb-2" />
      <p className="text-sm">Collecte des premiers points de mesure...</p>
      <p className="text-[11px] mt-1 font-mono">Premier point dans 5 secondes</p>
    </div>
  )
}