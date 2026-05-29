/**
 * 🏆 Header MUNDIAL-OPS 2030
 * Bandeau supérieur fixe : Logo + statut système + horloge live
 */

import { useState, useEffect } from 'react'
import { Trophy, Activity, Clock } from 'lucide-react'

export default function Header() {
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // ⏱️ Horloge live (mise à jour toutes les secondes)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  
  // Formatage de l'heure
  const formattedTime = currentTime.toLocaleTimeString('fr-FR', {
    hour:   '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Africa/Casablanca',
  })
  
  const formattedDate = currentTime.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
    year:    'numeric',
  })
  
  return (
    <header className="border-b border-border-default bg-bg-secondary/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          
          {/* ═══════ Logo + Titre ═══════ */}
          <div className="flex items-center gap-4">
            
            {/* Icône trophée doré */}
            <div className="relative">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-400/20">
                <Trophy className="w-7 h-7 text-bg-primary" strokeWidth={2.5} />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-ok rounded-full animate-pulse-soft shadow-[0_0_8px_rgba(93,202,165,0.8)]" />
            </div>
            
            {/* Texte logo */}
            <div>
              <h1 className="text-xl font-bold text-gold-400 tracking-tight font-mono">
                MUNDIAL-OPS <span className="text-text-primary">2030</span>
              </h1>
              <p className="text-xs text-text-secondary tracking-wide">
                Mission Control · Salle de Contrôle Coupe du Monde
              </p>
            </div>
          </div>
          
          {/* ═══════ Drapeaux des 3 pays hôtes ═══════ */}
          <div className="hidden md:flex items-center gap-2">
            <FlagBadge country="MA" color="#006233" label="Maroc" />
            <FlagBadge country="ES" color="#AA151B" label="Espagne" />
            <FlagBadge country="PT" color="#046A38" label="Portugal" />
          </div>
          
          {/* ═══════ Statut + Horloge ═══════ */}
          <div className="flex items-center gap-3">
            
            {/* Badge statut système */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-bg-tertiary border border-border-default">
              <Activity className="w-3.5 h-3.5 text-ok" strokeWidth={2.5} />
              <span className="status-dot status-ok" />
              <span className="text-xs text-ok font-medium">Opérationnel</span>
            </div>
            
            {/* Horloge live */}
            <div className="hidden sm:flex flex-col items-end px-3 py-1.5 rounded-md bg-bg-tertiary border border-border-default">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-text-muted" />
                <span className="text-sm font-mono text-text-primary">
                  {formattedTime}
                </span>
              </div>
              <span className="text-[10px] text-text-muted mt-0.5 capitalize">
                {formattedDate}
              </span>
            </div>
            
          </div>
        </div>
      </div>
    </header>
  )
}

// ═════════════════════════════════════════════════════════
// Composant interne : badge drapeau d'un pays
// ═════════════════════════════════════════════════════════
function FlagBadge({ country, color, label }) {
  return (
    <div 
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border-default bg-bg-tertiary"
      title={label}
    >
      <span 
        className="w-2 h-2 rounded-full" 
        style={{ backgroundColor: color }}
      />
      <span className="text-[11px] font-mono text-text-secondary tracking-wider">
        {country}
      </span>
    </div>
  )
}