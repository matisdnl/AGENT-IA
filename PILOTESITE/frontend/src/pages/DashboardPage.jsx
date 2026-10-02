import { useEffect, useState } from 'react'
import { useChantier } from '@/hooks/useChantier'
import { getTaches, getMails, getPlanning } from '@/services/api'
import StatCards from '@/components/dashboard/StatCards'
import TodoList from '@/components/dashboard/TodoList'
import MailsValidation from '@/components/dashboard/MailsValidation'
import PlanningWeek from '@/components/dashboard/PlanningWeek'
import DocumentsQuick from '@/components/dashboard/DocumentsQuick'
import IASuggestion from '@/components/dashboard/IASuggestion'

export default function DashboardPage() {
  const { chantierId } = useChantier()
  const [taches, setTaches]           = useState([])
  const [tachesLocales, setTachesLocales] = useState([])
  const [mails, setMails]             = useState([])
  const [planning, setPlanning]       = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    if (!chantierId) return
    setLoading(true)
    Promise.all([
      getTaches(chantierId),
      getMails(chantierId),
      getPlanning(chantierId),
    ])
      .then(([t, m, p]) => {
        setTaches(t.results || [])
        setMails(m.results || [])
        setPlanning(p.results || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [chantierId])

  const toutesLesTaches = [...taches, ...tachesLocales]

  const stats = {
    tachesJour: toutesLesTaches.filter((t) => {
      const statut = t.properties?.Statut?.select?.name
      return statut === 'À faire' || !statut
    }).length,
    tachesUrgentes: toutesLesTaches.filter((t) => {
      const statut = t.properties?.Statut?.select?.name
      return (!statut || statut === 'À faire') &&
        t.properties?.Priorité?.select?.name === 'URGENTE'
    }).length,
    mailsValider: mails.length,
    docsAttente: toutesLesTaches.filter((t) => {
      const statut = t.properties?.Statut?.select?.name
      return (!statut || statut === 'À faire') &&
        t.properties?.Catégorie?.select?.name === 'DOCUMENT' &&
        t.properties?.IA_Action?.checkbox
    }).length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-gray-400">
        Chargement des données…
      </div>
    )
  }

  return (
    <div className="flex gap-5">
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <StatCards stats={stats} />
        <TodoList
          taches={taches}
          onUpdate={setTaches}
          tachesLocales={tachesLocales}
          onUpdateLocales={setTachesLocales}
        />
        <MailsValidation mails={mails} onUpdate={setMails} />
      </div>

      <div className="w-[280px] flex flex-col gap-4 flex-shrink-0">
        <PlanningWeek events={planning} />
        <DocumentsQuick />
        <IASuggestion taches={toutesLesTaches} />
      </div>
    </div>
  )
}