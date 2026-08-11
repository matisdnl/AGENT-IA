// PlanningWeek.jsx
import { format, parseISO, isToday, isTomorrow, addDays } from 'date-fns'
import { fr } from 'date-fns/locale'

const TYPE_COLORS = {
  REUNION:       'bg-primary-50 text-primary-700',
  INTERVENTION:  'bg-orange-50 text-orange-700',
  VISITE:        'bg-teal-50 text-teal-700',
  LIVRAISON:     'bg-gray-100 text-gray-600',
  ADMINISTRATIF: 'bg-red-50 text-red-700',
  URGENT:        'bg-red-100 text-red-800',
}

const DOT_COLORS = {
  REUNION:       'bg-primary-600',
  INTERVENTION:  'bg-orange-400',
  VISITE:        'bg-teal-500',
  LIVRAISON:     'bg-gray-400',
  ADMINISTRATIF: 'bg-red-400',
  URGENT:        'bg-red-600',
}

function dayLabel(dateStr) {
  if (!dateStr) return ''
  const date = parseISO(dateStr)
  if (isToday(date)) return "Aujourd'hui"
  if (isTomorrow(date)) return 'Demain'
  return format(date, 'EEEE d', { locale: fr })
}

export function PlanningWeek({ events }) {
  // Groupe les événements par date sur les 7 prochains jours
  const grouped = {}
  const now = new Date()

  events.forEach((ev) => {
    const dateStr = ev.properties?.Date?.date?.start
    if (!dateStr) return
    const date = parseISO(dateStr)
    if (date < now || date > addDays(now, 30)) return
    const key = dateStr.slice(0, 10)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(ev)
  })

  const days = Object.keys(grouped).sort()

  return (
    <div className="card">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Planning — 30 jours</h2>

      {days.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-3">
          Aucun événement dans les 30 prochains jours
        </p>
      )}

      <div className="flex flex-col gap-3">
        {days.map((day) => (
          <div key={day}>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              {dayLabel(day)}
            </p>
            <div className="flex flex-col gap-1.5">
              {grouped[day].map((ev) => {
                const titre = ev.properties?.Nom?.title?.[0]?.plain_text || 'Événement'
                const heure = ev.properties?.Heure?.rich_text?.[0]?.plain_text
                const type  = ev.properties?.Type?.select?.name
                const dot   = DOT_COLORS[type] || 'bg-gray-400'

                return (
                  <div key={ev.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5">
                    <span className="text-[11px] text-gray-400 w-9 flex-shrink-0">{heure || '--:--'}</span>
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
                    <span className="text-xs text-gray-700 truncate">{titre}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// DocumentsQuick.jsx
const DOCS = [
  { label: 'Avenant S.T',       icon: '📋' },
  { label: 'PPSPS',             icon: '📋' },
  { label: 'Plan prévention',   icon: '📋' },
  { label: 'Plan de levage',    icon: '📋' },
  { label: 'Mode opératoire',   icon: '📋' },
  { label: "Plan d'exé",        icon: '📋' },
]

export function DocumentsQuick() {
  return (
    <div className="card">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Documents types</h2>
      <div className="grid grid-cols-2 gap-1.5">
        {DOCS.map(({ label, icon }) => (
          <button
            key={label}
            className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-lg px-2 py-2 transition-colors text-left"
          >
            <span className="text-sm">{icon}</span>
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// IASuggestion.jsx
export function IASuggestion({ taches }) {
  // Trouve la tâche la plus urgente avec dépendance planning
  const suggestion = taches.find(
    (t) => t.properties?.Priorité?.select?.name === 'URGENTE'
      && t.properties?.Catégorie?.select?.name === 'PLANNING'
  )

  if (!suggestion) return null

  const titre = suggestion.properties?.Titre?.title?.[0]?.plain_text || ''

  return (
    <div className="card border-l-2 border-orange-400 rounded-l-none">
      <div className="flex items-start gap-2 mb-2">
        <span className="text-base">💡</span>
        <p className="text-xs font-semibold text-gray-800">Suggestion IA</p>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">
        Action urgente détectée sur le planning : <span className="font-medium text-gray-700">{titre}</span>.
        Je peux recaler les intervenants concernés et envoyer les notifications automatiquement.
      </p>
      <button className="btn-primary text-xs mt-3 w-full justify-center">
        Appliquer →
      </button>
    </div>
  )
}

// Export par défaut = PlanningWeek (import default dans DashboardPage)
export default PlanningWeek
