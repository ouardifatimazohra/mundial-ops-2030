/**
 * 🔌 MUNDIAL-OPS 2030 — Service API centralisé
 * Tous les appels vers les microservices et le Cerveau IA passent par ici.
 */

import axios from 'axios'

// ═══════════════════════════════════════════════════════════════
// Configuration des endpoints
// ═══════════════════════════════════════════════════════════════
const ENDPOINTS = {
  billetterie: 'http://localhost:8001',
  streaming:   'http://localhost:8002',
  stade:       'http://localhost:8003',
  aiBrain:     'http://localhost:8004',
  prometheus:  'http://localhost:9090',
}

// Configuration axios avec timeout court (pour des fallbacks rapides)
const apiClient = axios.create({
  timeout: 4000,
  headers: { 'Content-Type': 'application/json' },
})

// ═══════════════════════════════════════════════════════════════
// 🧠 CERVEAU IA
// ═══════════════════════════════════════════════════════════════

/** Statistiques globales du Cerveau IA */
export async function fetchBrainStats() {
  try {
    const { data } = await apiClient.get(`${ENDPOINTS.aiBrain}/stats`)
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/** Health check du Cerveau IA */
export async function fetchBrainHealth() {
  try {
    const { data } = await apiClient.get(`${ENDPOINTS.aiBrain}/health`)
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/** Récupérer les N dernières alertes générées par le Cerveau IA */
export async function fetchAlerts(limit = 10) {
  try {
    const { data } = await apiClient.get(`${ENDPOINTS.aiBrain}/alerts?limit=${limit}`)
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/** Demande au Cerveau IA d'expliquer une anomalie (utilisé pour les démos jury) */
export async function requestExplanation(payload) {
  try {
    const { data } = await apiClient.post(
      `${ENDPOINTS.aiBrain}/test-explanation`,
      payload
    )
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ═══════════════════════════════════════════════════════════════
// 🎫 BILLETTERIE — Casablanca 🇲🇦
// ═══════════════════════════════════════════════════════════════
export async function fetchBilletterieRoot() {
  try {
    const { data } = await apiClient.get(`${ENDPOINTS.billetterie}/`)
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ═══════════════════════════════════════════════════════════════
// 📺 STREAMING — Madrid 🇪🇸
// ═══════════════════════════════════════════════════════════════
export async function fetchStreamingRoot() {
  try {
    const { data } = await apiClient.get(`${ENDPOINTS.streaming}/`)
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ═══════════════════════════════════════════════════════════════
// 🏟️ STADE — Lisbonne 🇵🇹
// ═══════════════════════════════════════════════════════════════
export async function fetchStadeRoot() {
  try {
    const { data } = await apiClient.get(`${ENDPOINTS.stade}/`)
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ═══════════════════════════════════════════════════════════════
// 📊 PROMETHEUS — Requête PromQL générique
// ═══════════════════════════════════════════════════════════════
export async function queryPrometheus(promql) {
  try {
    const { data } = await apiClient.get(
      `${ENDPOINTS.prometheus}/api/v1/query`,
      { params: { query: promql } }
    )
    if (data.status === 'success' && data.data.result.length > 0) {
      return { success: true, value: parseFloat(data.data.result[0].value[1]) }
    }
    return { success: true, value: 0 }
  } catch (error) {
    return { success: false, error: error.message, value: 0 }
  }
}

// Helper : récupérer le snapshot global des métriques clés
export async function fetchMetricsSnapshot() {
  const queries = {
    billetterie_sales_rate:    'sum(rate(billetterie_tickets_sold_total[1m]))',
    billetterie_errors:        'sum(billetterie_errors_total)',
    streaming_starts_rate:     'sum(rate(streaming_starts_total[1m]))',
    streaming_buffering:       'sum(streaming_buffering_events_total)',
    stade_sensor_rate:         'sum(rate(stade_sensor_readings_total[1m]))',
    stade_security_incidents:  'sum(stade_security_incidents_total)',
  }
  
  const snapshot = {}
  await Promise.all(
    Object.entries(queries).map(async ([key, promql]) => {
      const result = await queryPrometheus(promql)
      snapshot[key] = result.value || 0
    })
  )
  
  return snapshot
}

export { ENDPOINTS }