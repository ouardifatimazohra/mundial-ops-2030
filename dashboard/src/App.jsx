/**
 * 🏆 MUNDIAL-OPS 2030 — Application principale
 */

import Header from './components/Header'
import SystemStatus from './components/SystemStatus'
import RegionCard from './components/RegionCard'
import GibraltarMap from './components/GibraltarMap'
import AIBrainPanel from './components/AIBrainPanel'

function App() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <Header />
      
      <main className="container mx-auto px-6 py-8 max-w-7xl space-y-6">
        
        {/* 🧠 État du Cerveau IA */}
        <SystemStatus />
        
        {/* 🌍 3 Régions hôtes */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="label-section">Régions hôtes · Trafic temps réel</h2>
            <div className="flex-1 h-px bg-border-default" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RegionCard
              countryCode="MA" countryName="Maroc" city="Casablanca"
              serviceName="Billetterie" serviceIcon="🎫"
              promqlQuery="sum(rate(billetterie_tickets_sold_total[30s]))"
              promqlTotal="sum(billetterie_tickets_sold_total)"
              unit="ventes/sec" primaryColor="#006233" accentColor="#5DCAA5"
            />
            <RegionCard
              countryCode="ES" countryName="Espagne" city="Madrid"
              serviceName="Streaming" serviceIcon="📺"
              promqlQuery="sum(rate(streaming_starts_total[30s]))"
              promqlTotal="sum(streaming_starts_total)"
              unit="streams/sec" primaryColor="#AA151B" accentColor="#F4C842"
            />
            <RegionCard
              countryCode="PT" countryName="Portugal" city="Lisbonne"
              serviceName="Stade IoT" serviceIcon="🏟️"
              promqlQuery="sum(rate(stade_sensor_readings_total[30s]))"
              promqlTotal="sum(stade_sensor_readings_total)"
              unit="capteurs/sec" primaryColor="#046A38" accentColor="#97C459"
            />
          </div>
        </section>
        
        {/* 🗺️ Carte du Détroit de Gibraltar */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="label-section">Topologie · Vue géographique</h2>
            <div className="flex-1 h-px bg-border-default" />
          </div>
          
          <GibraltarMap />
        </section>
        
        {/* 🧠 PANEL CERVEAU IA — Le moment WOW */}
        <AIBrainPanel />
        
      </main>
    </div>
  )
}

export default App