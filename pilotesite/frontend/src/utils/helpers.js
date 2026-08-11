import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

/** Formate une date Notion (YYYY-MM-DD) en texte lisible */
export function formatDate(dateStr) {
  if (!dateStr) return null
  const date = parseISO(dateStr)
  if (isToday(date)) return "Aujourd'hui"
  if (isTomorrow(date)) return 'Demain'
  return format(date, 'd MMM', { locale: fr })
}

/** Retourne true si la deadline est dépassée ou aujourd'hui */
export function isDeadlineUrgente(dateStr) {
  if (!dateStr) return false
  const date = parseISO(dateStr)
  return isToday(date) || isPast(date)
}

/** Mappe une priorité Notion vers une classe CSS */
export function getPriorityClass(priorite) {
  const map = {
    URGENTE: 'badge-urgente',
    HAUTE:   'badge-haute',
    NORMALE: 'badge-normale',
    BASSE:   'badge-basse',
  }
  return map[priorite] || 'badge-basse'
}

/** Mappe une catégorie Notion vers une classe CSS */
export function getCategoryClass(categorie) {
  const map = {
    ADMINISTRATIF:   'badge-admin',
    FINANCIER:       'badge-finance',
    PLANNING:        'badge-planning',
    DOCUMENT:        'badge-document',
    MAIL_GROUPEMENT: 'badge-groupement',
    MEMO:            'badge-memo',
  }
  return map[categorie] || 'badge-memo'
}

/** Mappe une catégorie vers un label français */
export function getCategoryLabel(categorie) {
  const map = {
    ADMINISTRATIF:   'Administratif',
    FINANCIER:       'Financier',
    PLANNING:        'Planning',
    DOCUMENT:        'Document',
    MAIL_GROUPEMENT: 'Groupement',
    MEMO:            'Mémo',
  }
  return map[categorie] || categorie
}

/** Tronque un texte à N caractères */
export function truncate(str, n = 80) {
  if (!str) return ''
  return str.length > n ? str.slice(0, n) + '…' : str
}

/** Couleur du point de priorité */
export function getPriorityDotColor(priorite) {
  const map = {
    URGENTE: 'bg-red-500',
    HAUTE:   'bg-orange-400',
    NORMALE: 'bg-blue-500',
    BASSE:   'bg-gray-400',
  }
  return map[priorite] || 'bg-gray-400'
}
