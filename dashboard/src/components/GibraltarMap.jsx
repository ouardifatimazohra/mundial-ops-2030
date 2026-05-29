/**
 * 🗺️ GibraltarMap — Carte interactive du Détroit de Gibraltar
 * 3 nœuds régionaux : Casablanca (commandement), Madrid, Lisbonne
 * Animations : pulse, flux de données, onde de scan
 */

import { useState, useEffect } from 'react'
import { Radio, MapPin } from 'lucide-react'
import { fetchBrainStats } from '../services/api'

export default function GibraltarMap() {
  const [activeNode, setActiveNode] = useState(null)
  const [systemHealthy, setSystemHealthy] = useState(true)
  
  // Polling du statut système
  useEffect(() => {
    const checkStatus = async () => {
      const result = await fetchBrainStats()
      if (result.success) {
        setSystemHealthy(result.data.prometheus_healthy)
      }
    }
    checkStatus()
    const interval = setInterval(checkStatus, 5000)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="glass-card p-6">
      
      {/* En-tête */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Radio className="w-5 h-5 text-gold-400" />
          <div>
            <h3 className="text-sm font-medium text-gold-400 tracking-wide">
              DÉTROIT DE GIBRALTAR · CARTE LIVE
            </h3>
            <p className="text-[11px] text-text-muted font-mono">
              3 régions synchronisées · Commandement Casablanca
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-[11px]">
          <span className={`status-dot ${systemHealthy ? 'status-ok' : 'status-critical'}`} />
          <span className={`font-mono ${systemHealthy ? 'text-ok' : 'text-critical'}`}>
            {systemHealthy ? 'NETWORK SYNC' : 'CONNECTION LOST'}
          </span>
        </div>
      </div>
      
      {/* SVG de la carte */}
      <div className="relative bg-bg-primary rounded-lg overflow-hidden border border-border-subtle" 
           style={{ aspectRatio: '16 / 9' }}>
        
        <svg 
          viewBox="0 0 800 450" 
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Définitions : dégradés, filtres, animations */}
          <defs>
            {/* Gradient océan */}
            <linearGradient id="ocean" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="#0A1530" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#050818" stopOpacity="1" />
            </linearGradient>
            
            {/* Gradient terre Maroc */}
            <linearGradient id="morocco-land" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#0F2419" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#1A3A2A" stopOpacity="0.7" />
            </linearGradient>
            
            {/* Gradient terre Europe */}
            <linearGradient id="europe-land" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#1A1F30" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#2A2F44" stopOpacity="0.7" />
            </linearGradient>
            
            {/* Glow pour les nœuds */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            {/* Grille de coordonnées */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1F2740" strokeWidth="0.5" opacity="0.4" />
            </pattern>
          </defs>
          
          {/* Fond océan + grille */}
          <rect width="800" height="450" fill="url(#ocean)" />
          <rect width="800" height="450" fill="url(#grid)" />
          
          {/* ═══ EUROPE (Espagne + Portugal, partie haute) ═══ */}
          <path 
            d="M 0 0 L 800 0 L 800 180 
               C 700 200, 600 210, 500 195
               C 400 180, 300 195, 200 180
               C 100 170, 50 175, 0 165 Z"
            fill="url(#europe-land)"
            stroke="#2A3144"
            strokeWidth="1"
          />
          
          {/* ═══ MAROC (partie basse) ═══ */}
          <path 
            d="M 0 450 L 800 450 L 800 290
               C 700 270, 600 285, 500 270
               C 400 255, 300 270, 200 290
               C 120 305, 50 310, 0 320 Z"
            fill="url(#morocco-land)"
            stroke="#16804F"
            strokeWidth="1"
            opacity="0.8"
          />
          
          {/* Légende régions */}
          <text x="100" y="50" fill="#3A4660" fontSize="11" fontFamily="monospace">EUROPE</text>
          <text x="100" y="430" fill="#16804F" fontSize="11" fontFamily="monospace" opacity="0.7">MAROC</text>
          
          {/* ═══ Liaisons inter-nœuds (flux de données) ═══ */}
          <g className="data-flows">
            {/* Casablanca → Madrid */}
            <line 
              x1="220" y1="370" x2="580" y2="110"
              stroke="#00D9FF" strokeWidth="1" opacity="0.4"
              strokeDasharray="4 4"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0" to="-16" dur="1s" repeatCount="indefinite"
              />
            </line>
            
            {/* Casablanca → Lisbonne */}
            <line 
              x1="220" y1="370" x2="180" y2="130"
              stroke="#00D9FF" strokeWidth="1" opacity="0.4"
              strokeDasharray="4 4"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0" to="-16" dur="1.3s" repeatCount="indefinite"
              />
            </line>
            
            {/* Madrid → Lisbonne */}
            <line 
              x1="580" y1="110" x2="180" y2="130"
              stroke="#00D9FF" strokeWidth="0.8" opacity="0.3"
              strokeDasharray="3 3"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0" to="-12" dur="1.5s" repeatCount="indefinite"
              />
            </line>
          </g>
          
          {/* ═══ NŒUDS RÉGIONAUX ═══ */}
          
          {/* 🇲🇦 CASABLANCA — Centre de Commandement (le plus gros) */}
          <Node
            x={220} y={370}
            color="#006233"
            accentColor="#5DCAA5"
            label="CASABLANCA"
            subLabel="● COMMANDEMENT PRINCIPAL"
            radius={16}
            isPrimary={true}
            onClick={() => setActiveNode('casablanca')}
          />
          
          {/* 🇪🇸 MADRID */}
          <Node
            x={580} y={110}
            color="#AA151B"
            accentColor="#F4C842"
            label="MADRID"
            subLabel="○ Nœud satellite"
            radius={11}
            onClick={() => setActiveNode('madrid')}
          />
          
          {/* 🇵🇹 LISBONNE */}
          <Node
            x={180} y={130}
            color="#046A38"
            accentColor="#97C459"
            label="LISBONNE"
            subLabel="○ Nœud satellite"
            radius={11}
            onClick={() => setActiveNode('lisbonne')}
          />
          
          {/* ═══ Onde de scan radar ═══ */}
          <circle cx="220" cy="370" r="0" fill="none" stroke="#5DCAA5" strokeWidth="1" opacity="0">
            <animate attributeName="r"       from="0" to="450" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.6" to="0" dur="4s" repeatCount="indefinite" />
          </circle>
          
          {/* Coordonnées radar (déco) */}
          <text x="10" y="20"   fill="#3A4660" fontSize="9" fontFamily="monospace">35°N · 5°W</text>
          <text x="730" y="20"  fill="#3A4660" fontSize="9" fontFamily="monospace">37°N · 3°W</text>
          <text x="10" y="445"  fill="#3A4660" fontSize="9" fontFamily="monospace">RADAR · LIVE FEED</text>
          <text x="710" y="445" fill="#3A4660" fontSize="9" fontFamily="monospace">v1.0.0</text>
        </svg>
        
        {/* Overlay info au survol d'un nœud */}
        {activeNode && (
          <div className="absolute bottom-3 left-3 right-3 bg-bg-secondary/95 backdrop-blur-sm border border-border-default rounded-md p-3 animate-fade-in">
            <NodeInfo node={activeNode} onClose={() => setActiveNode(null)} />
          </div>
        )}
      </div>
      
      {/* Footer : légende */}
      <div className="mt-4 flex items-center justify-between text-[11px] text-text-muted">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-morocco" />
            Commandement
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-spain" />
            Satellite Madrid
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-portugal" />
            Satellite Lisbonne
          </span>
        </div>
        <span className="font-mono">3 nœuds · 6 microservices</span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Composant interne : Nœud (point sur la carte)
// ═══════════════════════════════════════════════════════════
function Node({ x, y, color, accentColor, label, subLabel, radius, isPrimary, onClick }) {
  return (
    <g 
      style={{ cursor: 'pointer' }}
      onClick={onClick}
    >
      {/* Halo extérieur pulsant */}
      <circle cx={x} cy={y} r={radius + 6} fill={accentColor} opacity="0.15">
        <animate attributeName="r" 
          values={`${radius + 4};${radius + 12};${radius + 4}`} 
          dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity"
          values="0.3;0;0.3"
          dur="2s" repeatCount="indefinite" />
      </circle>
      
      {/* Cercle principal */}
      <circle cx={x} cy={y} r={radius} fill={color} stroke={accentColor} strokeWidth="2" filter="url(#glow)" />
      
      {/* Point central */}
      <circle cx={x} cy={y} r={radius / 3} fill={accentColor}>
        <animate attributeName="opacity"
          values="1;0.4;1"
          dur="1.5s" repeatCount="indefinite" />
      </circle>
      
      {/* Étoile si primary (Casablanca) */}
      {isPrimary && (
        <text x={x} y={y + 5} textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="bold">★</text>
      )}
      
      {/* Label */}
      <text 
        x={x} 
        y={y + radius + 20} 
        textAnchor="middle" 
        fill={accentColor} 
        fontSize={isPrimary ? "13" : "11"} 
        fontFamily="monospace" 
        fontWeight={isPrimary ? "bold" : "normal"}
      >
        {label}
      </text>
      
      <text 
        x={x} 
        y={y + radius + 33} 
        textAnchor="middle" 
        fill="#8B92A8" 
        fontSize="9" 
        fontFamily="monospace"
      >
        {subLabel}
      </text>
    </g>
  )
}

// ═══════════════════════════════════════════════════════════
// Composant interne : Info Box d'un nœud
// ═══════════════════════════════════════════════════════════
function NodeInfo({ node, onClose }) {
  const data = {
    casablanca: {
      title:    'Casablanca · Centre de Commandement Principal 🇲🇦',
      service:  'Billetterie + Hub Central',
      info:     'Gestion centralisée des opérations · Pilote les nœuds satellites',
      port:     '8001',
      color:    'text-morocco-accent',
    },
    madrid: {
      title:    'Madrid · Nœud Satellite 🇪🇸',
      service:  'Streaming · Diffusion vidéo',
      info:     'Streaming multi-qualité (SD/HD/4K/8K)',
      port:     '8002',
      color:    'text-spain-accent',
    },
    lisbonne: {
      title:    'Lisbonne · Nœud Satellite 🇵🇹',
      service:  'Stade IoT · Capteurs',
      info:     'Capteurs température, humidité, sécurité',
      port:     '8003',
      color:    'text-portugal-accent',
    },
  }
  
  const item = data[node]
  if (!item) return null
  
  return (
    <div className="flex items-start gap-3">
      <MapPin className={`w-5 h-5 mt-0.5 ${item.color}`} />
      <div className="flex-1">
        <p className={`text-sm font-medium ${item.color}`}>
          {item.title}
        </p>
        <p className="text-xs text-text-secondary mt-1">
          {item.service}
        </p>
        <p className="text-[11px] text-text-muted mt-1">
          {item.info} · Port :8{item.port.slice(1)}
        </p>
      </div>
      <button 
        onClick={onClose}
        className="text-text-muted hover:text-text-primary text-xs"
      >
        ✕
      </button>
    </div>
  )
}