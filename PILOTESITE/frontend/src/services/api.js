import axios from 'axios'

// URL du backend (définie dans .env.local)
const BASE_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Intercepteur global : log les erreurs en console
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('[API Error]', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// ─────────────────────────────────────────
// TÂCHES
// ─────────────────────────────────────────

/** Récupère toutes les tâches d'un chantier */
export function getTaches(chantierId) {
  return api.get(`/api/taches?chantier=${chantierId}`)
}

/** Met à jour le statut d'une tâche */
export function updateTacheStatut(pageId, statut) {
  return api.patch(`/api/taches/${pageId}`, { statut })
}

/** Crée une tâche manuellement */
export function createTache(data) {
  return api.post('/api/taches', data)
}

// ─────────────────────────────────────────
// MAILS
// ─────────────────────────────────────────

/** Récupère les mails en attente de validation (Brouillon prêt) */
export function getMails(chantierId) {
  return api.get(`/api/mails?chantier=${chantierId}`)
}

/** Récupère tous les mails du chantier */
export function getAllMails(chantierId) {
  return api.get(`/api/mails?chantier=${chantierId}&tous=1`)
}

/** Valide et envoie un mail préparé par l'IA */
export function validerMail(pageId) {
  return api.post(`/api/mails/${pageId}/envoyer`)
}

/** Demande une modification du brouillon via l'agent */
export function modifierMail(pageId, instruction) {
  return api.post(`/api/mails/${pageId}/modifier`, { instruction })
}

/** Rejette un mail (archive sans envoyer) */
export function rejeterMail(pageId) {
  return api.patch(`/api/mails/${pageId}`, { statut: 'Rejeté' })
}

// ─────────────────────────────────────────
// PLANNING
// ─────────────────────────────────────────

/** Récupère les événements de planning d'un chantier */
export function getPlanning(chantierId) {
  return api.get(`/api/planning?chantier=${chantierId}`)
}

/** Crée un événement manuellement */
export function createEvenement(data) {
  return api.post('/api/planning', data)
}

// ─────────────────────────────────────────
// CHAT avec l'agent IA
// ─────────────────────────────────────────

/** Envoie un message à l'agent n8n et reçoit sa réponse */
export function sendChatMessage(message, chantierId, stList = [], currentDoc = null) {
  return api.post('/api/chat', { message, chantierId, stList, currentDoc })
}

// ─────────────────────────────────────────
// STATS dashboard
// ─────────────────────────────────────────

/** Récupère les compteurs du tableau de bord */
export function getStats(chantierId) {
  return api.get(`/api/stats?chantier=${chantierId}`)
}
