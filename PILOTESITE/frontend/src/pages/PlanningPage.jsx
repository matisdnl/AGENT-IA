import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Plus, Calendar, Clock, Users, FileText, X } from 'lucide-react'
import { useChantier } from '@/hooks/useChantier'
import { getPlanning, createEvenement } from '@/services/api'

const TYPE_STYLES = {
  REUNION:       { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500',   label: 'Réunion' },
  INTERVENTION:  { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-400', label: 'Intervention' },
  VISITE:        { bg: 'bg-teal-100',   text: 'text-teal-700',   dot: 'bg-teal-500',   label: 'Visite' },
  LIVRAISON:     { bg: 'bg-gray-100',   text: 'text-gray-600',   dot: 'bg-gray-400',   label: 'Livraison' },
  ADMINISTRATIF: { bg: 'bg-red-50',     text: 'text-red-600',    dot: 'bg-red-400',    label: 'Administratif' },
  URGENT:        { bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-600',    label: 'Urgent' },
}

const TYPES = Object.entries(TYPE_STYLES).map(([k, v]) => ({ value: k, label: v.label }))

const EMPTY_FORM = { titre: '', date: '', heure: '', type: 'REUNION', intervenants: '', notes: '' }

function TypeBadge({ type }) {
  const s = TYPE_STYLES[type] || TYPE_STYLES.ADMINISTRATIF
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

export default function PlanningPage() {
  const { chantierId } = useChantier()
  const [events, setEvents]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [filterType, setFilterType] = useState('TOUS')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)

  useEffect(() => {
    if (!chantierId) return
    setLoading(true)
    getPlanning(chantierId)
      .then(r => setEvents(r.results || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [chantierId])

  // Filtre par type
  const filtered = filterType === 'TOUS'
    ? events
    : events.filter(ev => ev.properties?.Type?.select?.name === filterType)

  // Groupe par mois
  const grouped = {}
  filtered.forEach(ev => {
    const dateStr = ev.properties?.Date?.date?.start
    if (!dateStr) return
    const key = dateStr.slice(0, 7) // "2026-10"
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(ev)
  })
  const months = Object.keys(grouped).sort()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.titre || !form.date) return
    setSaving(true)
    try {
      await createEvenement({ ...form, chantierId })
      const r = await getPlanning(chantierId)
      setEvents(r.results || [])
      setShowModal(false)
      setForm(EMPTY_FORM)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-gray-400">
        Chargement du planning…
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">

      {/* En-tête */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-base font-semibold text-gray-900">Planning chantier</h1>
          <p className="text-xs text-gray-400 mt-0.5">{events.length} événement{events.length > 1 ? 's' : ''} à venir</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-1.5 text-xs px-3 py-2"
        >
          <Plus size={14} /> Nouvel événement
        </button>
      </div>

      {/* Filtres par type */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {['TOUS', ...Object.keys(TYPE_STYLES)].map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              filterType === t
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            }`}
          >
            {t === 'TOUS' ? 'Tous' : TYPE_STYLES[t].label}
          </button>
        ))}
      </div>

      {/* Liste vide */}
      {months.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Calendar size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Aucun événement à venir</p>
          <button onClick={() => setShowModal(true)} className="mt-3 text-xs text-primary-600 hover:underline">
            + Ajouter le premier événement
          </button>
        </div>
      )}

      {/* Événements groupés par mois */}
      <div className="flex flex-col gap-6">
        {months.map(month => {
          const label = format(parseISO(month + '-01'), 'MMMM yyyy', { locale: fr })
          return (
            <div key={month}>
              <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                {label}
              </h2>
              <div className="flex flex-col gap-2">
                {grouped[month]
                  .sort((a, b) => (a.properties?.Date?.date?.start || '') > (b.properties?.Date?.date?.start || '') ? 1 : -1)
                  .map(ev => {
                    const props        = ev.properties
                    const titre        = props?.Nom?.title?.[0]?.plain_text || 'Événement sans titre'
                    const dateStr      = props?.Date?.date?.start
                    const heure        = props?.Heure?.rich_text?.[0]?.plain_text
                    const type         = props?.Type?.select?.name
                    const intervenants = props?.Intervenants?.rich_text?.[0]?.plain_text
                    const notes        = props?.Notes?.rich_text?.[0]?.plain_text
                    const statut       = props?.Statut?.select?.name
                    const dateObj      = dateStr ? parseISO(dateStr) : null
                    const jourNom      = dateObj ? format(dateObj, 'EEEE d', { locale: fr }) : '—'

                    return (
                      <div key={ev.id} className="card flex gap-4 items-start hover:shadow-sm transition-shadow">
                        {/* Date */}
                        <div className="flex-shrink-0 w-14 text-center">
                          <p className="text-[10px] text-gray-400 capitalize">
                            {dateObj ? format(dateObj, 'EEE', { locale: fr }) : ''}
                          </p>
                          <p className="text-xl font-bold text-gray-800 leading-none">
                            {dateObj ? format(dateObj, 'd') : '—'}
                          </p>
                        </div>

                        {/* Contenu */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <TypeBadge type={type} />
                            {statut && statut !== 'Planifié' && (
                              <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                                {statut}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-800">{titre}</p>

                          <div className="flex flex-wrap gap-3 mt-1.5">
                            {heure && (
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <Clock size={11} /> {heure}
                              </span>
                            )}
                            {intervenants && (
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <Users size={11} /> {intervenants}
                              </span>
                            )}
                            {notes && (
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <FileText size={11} /> {notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal Nouvel événement */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Nouvel événement</h3>
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM) }} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Titre *</label>
                <input
                  className="input text-xs py-1.5 w-full"
                  placeholder="Ex : Réunion de chantier hebdo"
                  value={form.titre}
                  onChange={e => setForm(f => ({ ...f, titre: e.target.value }))}
                  required autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Date *</label>
                  <input
                    type="date"
                    className="input text-xs py-1.5 w-full"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Heure</label>
                  <input
                    type="time"
                    className="input text-xs py-1.5 w-full"
                    value={form.heure}
                    onChange={e => setForm(f => ({ ...f, heure: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Type</label>
                <select
                  className="input text-xs py-1.5 w-full"
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                >
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Intervenants</label>
                <input
                  className="input text-xs py-1.5 w-full"
                  placeholder="Ex : SOCOTEC, Bureau de contrôle…"
                  value={form.intervenants}
                  onChange={e => setForm(f => ({ ...f, intervenants: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Notes</label>
                <textarea
                  className="input text-xs py-1.5 w-full resize-none"
                  rows={2}
                  placeholder="Informations complémentaires…"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                />
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setForm(EMPTY_FORM) }}
                  className="btn-secondary text-xs px-3 py-1.5"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary text-xs px-3 py-1.5 disabled:opacity-50"
                >
                  {saving ? 'Enregistrement…' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
