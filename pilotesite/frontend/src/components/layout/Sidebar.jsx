import { NavLink, useNavigate } from 'react-router-dom'
import { useChantier } from '@/hooks/useChantier'
import clsx from 'clsx'
import { LayoutDashboard, CheckSquare, Mail, CalendarDays, FolderOpen } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/dashboard', Icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/taches',    Icon: CheckSquare,     label: 'Tâches',   badge: null },
  { to: '/mails',     Icon: Mail,            label: 'Mails IA', badge: null },
  { to: '/planning',  Icon: CalendarDays,    label: 'Planning' },
  { to: '/documents', Icon: FolderOpen,      label: 'Documents ST' },
]

export default function Sidebar() {
  const { chantier, clearChantier } = useChantier()
  const navigate = useNavigate()

  function handleChangeChantier() {
    clearChantier()
    navigate('/chantiers')
  }

  return (
    <aside className="w-[220px] min-w-[220px] bg-white border-r border-gray-100 flex flex-col h-full">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-gray-100">
        <div className="w-7 h-7 rounded-md bg-primary-600 flex items-center justify-center">
          <span className="text-white text-xs font-semibold">PS</span>
        </div>
        <span className="text-sm font-semibold text-gray-900">PiloteSite</span>
      </div>

      {/* Chantier actif */}
      <div className="mx-2 mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Chantier actif</p>
        <p className="text-xs font-semibold text-gray-900 leading-tight">{chantier.nom}</p>
        <p className="text-[11px] text-gray-500 mt-0.5">{chantier.lot}</p>
        <p className="text-[11px] text-gray-400">{chantier.phase}</p>
        <button
          onClick={handleChangeChantier}
          className="mt-2 w-full text-[11px] text-primary-600 border border-primary-100 rounded px-2 py-1 hover:bg-primary-50 transition-colors"
        >
          Changer de chantier →
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-3 flex-1 px-2">
        <p className="text-[10px] text-gray-400 uppercase tracking-wider px-2 mb-1.5">Navigation</p>
        {NAV_ITEMS.map(({ to, Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              )
            }
          >
            <Icon size={16} className="flex-shrink-0" />
            <span className="flex-1">{label}</span>
            {badge !== null && badge !== undefined && (
              <span className="text-[10px] bg-red-500 text-white font-medium px-1.5 py-0.5 rounded-full">
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer utilisateur */}
      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-primary-50 flex items-center justify-center text-[11px] font-semibold text-primary-600">
            MD
          </div>
          <div>
            <p className="text-xs font-medium text-gray-900">Matis Denoual</p>
            <p className="text-[11px] text-gray-500">Conducteur de travaux</p>
          </div>
        </div>
      </div>

    </aside>
  )
}
