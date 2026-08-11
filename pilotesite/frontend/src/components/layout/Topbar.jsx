import { useLocation } from 'react-router-dom'
import { useChantier } from '@/hooks/useChantier'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const PAGE_TITLES = {
  '/dashboard': 'Tableau de bord',
  '/taches':    'Tâches',
  '/mails':     'Mails IA',
  '/planning':  'Planning',
  '/documents': 'Documents',
}

export default function Topbar() {
  const { pathname } = useLocation()
  const { chantier } = useChantier()
  const today = format(new Date(), "EEEE d MMMM yyyy", { locale: fr })

  const title = PAGE_TITLES[pathname] || 'PiloteSite'

  // Capitalise la première lettre du jour
  const todayFormatted = today.charAt(0).toUpperCase() + today.slice(1)

  return (
    <header className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between">
      <div>
        <h1 className="text-sm font-semibold text-gray-900">{title}</h1>
        <p className="text-xs text-gray-400">{todayFormatted} · {chantier?.nom}</p>
      </div>

      <div className="flex items-center gap-2">
        {/* Indicateur de sync n8n */}
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Agent actif
        </div>

        <button className="btn-primary text-xs">
          ↻ Sync mail
        </button>
      </div>
    </header>
  )
}
