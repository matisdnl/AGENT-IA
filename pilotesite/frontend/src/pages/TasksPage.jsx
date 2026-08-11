import { useEffect, useState } from 'react'
import { Plus, Check, X, Filter } from 'lucide-react'
import { useChantier } from '@/hooks/useChantier'
import { getTaches, updateTacheStatut, createTache } from '@/services/api'
import { formatDate, getCategoryClass, getCategoryLabel } from '@/utils/helpers'

const PRIORITY_ORDER = { URGENTE: 0, HAUTE: 1, NORMALE: 2, BASSE: 3 }

const PRIORITY_DOT = {
  URGENTE: 'bg-red-500',
  HAUTE:   'bg-orange-400',
  NORMALE: 'bg-blue-500',
  BASSE:   'bg-gray-300',
}

const PRIORITY_BADGE = {
  URGENTE: 'bg-red-100 text-red-700',
  HAUTE:   'bg-orange-100 text-orange-700',
  NORMALE: 'bg-blue-50 text-blue-600',
  BASSE:   'bg-gray-100 text-gray-500',
}

const STATUTS    = ['À faire', 'En cours', 'Terminé']
const CATEGORIES = ['ADMINISTRATIF', 'FINANCIER', 'PLANNING', 'DOCUMENT', 'MEMO']
const PRIORITES  = ['URGENTE', 'HAUTE', 'NORMALE', 'BASSE']

const EMPTY_FORM = { titre: '', priorite: 'NORMALE', categorie: 'ADMINISTRATIF', deadline: '', notes: '' }

export default function TasksPage() {
  const { chantierId } = useChantier()
  const [taches, setTaches]               = useState([])
  const [loading, setLoading]             = useState(true)
  const [filterStatut, setFilterStatut]   = useState('actif')
  const [filterPrio, setFilterPrio]       = useState('TOUS')
  const [filterCat, setFilterCat]         = useState('TOUS')
  const [showModal, setShowModal]         = useState(false)
  const [form, setForm]                   = useState(EMPTY_FORM)
  const [saving, setSaving]               = useState(false)
  const [checking, setChecking]           = useState(null)

  useEffect(() => {
    if (!chantierId) return
    setLoading(true)
    getTaches(chantierId)
      .then(r => setTaches(r.results || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [chantierId])

  const filtered = taches
    .filter(t => {
      const s = t.properties?.Statut?.select?.name
      return filterStatut === 'actif' ? s !== 'Terminé' : s === 'Terminé'
    })
    .filter(t => filterPrio === 'TOUS' || t.properties?.Priorité?.select?.name === filterPrio)
    .filter(t => filterCat  === 'TOUS' || t.properties?.Catégorie?.select?.name === filterCat)
    .sort((a, b) => {
      const pa = PRIORITY_ORDER[a.properties?.Priorité?.select?.name] ?? 9
      const pb = PRIORITY_ORDER[b.properties?.Priorité?.select?.name] ?? 9
      return pa - pb
    })

  const countActif   = taches.filter(t => t.properties?.Statut?.select?.name !== 'Terminé').length
  const countTermine = taches.filter(t => t.properties?.Statut?.select?.name === 'Terminé').length

  async function handleCheck(tache) {
    const done = tache.properties?.Statut?.select?.name === 'Terminé'
    const next = done ? 'À faire' : 'Terminé'
    setChecking(tache.id)
    try {
      await updateTacheStatut(tache.id, next)
      setTaches(prev => prev.map(t =>
        t.id === tache.id
          ? { ...t, properties: { ...t.properties, Statut: { select: { name: next } } } }
          : t
      ))
    } catch (e) { console.error(e) }
    finally { setChecking(null) }
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.titre.trim()) return
    setSaving(true)
    try {
      await createTache({ ...form, chantierId })
      const r = await getTaches(chantierId)
      setTaches(r.results || [])
      setShowModal(false)
      setForm(EMPTY_FORM)
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-sm text-gray-400">Chargement…</div>
  )

  return (
    <div className="max-w-3xl mx-auto">

      {/* En-tête */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-base font-semibold text-gray-900">Tâches</h1>
          <p className="text-xs text-gray-400 mt-0.5">{countActif} en cours · {countTermine} terminées</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-1.5 text-xs px-3 py-2">
          <Plus size={14} /> Nouvelle tâche
        </button>
      </div>

      {/* Onglets En cours / Terminées */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-0.5 w-fit">
        {[['actif', `En cours (${countActif})`], ['Terminé', `Terminées (${countTermine})`]].map(([val, label]) => (
          <button key={val} onClick={() => setFilterStatut(val)}
            className={`text-xs px-3 py-1.5 rounded-md transition-colors ${filterStatut === val ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-1.5 mb-5 items-center">
        <Filter size={12} className="text-gray-400 mr-1" />
        {['TOUS', ...PRIORITES].map(p => (
          <button key={p} onClick={() => setFilterPrio(p)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${filterPrio === p ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
            {p === 'TOUS' ? 'Toutes priorités' : p.charAt(0) + p.slice(1).toLowerCase()}
          </button>
        ))}
        <span className="text-gray-200 select-none">|</span>
        {['TOUS', ...CATEGORIES].map(c => (
          <button key={c} onClick={() => setFilterCat(c)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${filterCat === c ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
            {c === 'TOUS' ? 'Toutes catégories' : getCategoryLabel(c)}
          </button>
        ))}
      </div>

      {/* État vide */}
      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">Aucune tâche{filterStatut === 'Terminé' ? ' terminée' : ' en cours'}</p>
          {filterStatut !== 'Terminé' && (
            <button onClick={() => setShowModal(true)} className="mt-2 text-xs text-primary-600 hover:underline">
              + Créer la première tâche
            </button>
          )}
        </div>
      )}

      {/* Cartes tâches */}
      <div className="flex flex-col gap-2">
        {filtered.map(tache => {
          const titre    = tache.properties?.Titre?.title?.[0]?.plain_text || 'Sans titre'
          const statut   = tache.properties?.Statut?.select?.name
          const priorite = tache.properties?.Priorité?.select?.name
          const cat      = tache.properties?.Catégorie?.select?.name
          const deadline = tache.properties?.Deadline?.date?.start
          const notes    = tache.properties?.Notes?.rich_text?.[0]?.plain_text
          const done     = statut === 'Terminé'

          return (
            <div key={tache.id} className={`card flex items-start gap-3 transition-opacity ${done ? 'opacity-50' : ''}`}>
              <button onClick={() => handleCheck(tache)} disabled={checking === tache.id}
                className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${done ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-400'}`}>
                {done && <Check size={11} color="white" strokeWidth={3} />}
              </button>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${done ? 'line-through text-gray-400' : 'text-gray-800'}`}>{titre}</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5 items-center">
                  {priorite && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${PRIORITY_BADGE[priorite]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[priorite]}`} />
                      {priorite.charAt(0) + priorite.slice(1).toLowerCase()}
                    </span>
                  )}
                  {cat && <span className={getCategoryClass(cat)}>{getCategoryLabel(cat)}</span>}
                  {statut && statut !== 'Terminé' && statut !== 'À faire' && (
                    <span className="text-[10px] bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full">{statut}</span>
                  )}
                  {deadline && <span className="text-[10px] text-gray-400">⏱ {formatDate(deadline)}</span>}
                </div>
                {notes && <p className="text-xs text-gray-400 mt-1 italic">{notes}</p>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal nouvelle tâche */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Nouvelle tâche</h3>
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM) }} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-5 flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Titre *</label>
                <input className="input text-xs py-1.5 w-full" required autoFocus
                  placeholder="Ex : Relancer SOCOTEC pour le PV de réception"
                  value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Priorité</label>
                  <select className="input text-xs py-1.5 w-full" value={form.priorite} onChange={e => setForm(f => ({ ...f, priorite: e.target.value }))}>
                    {PRIORITES.map(p => <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Catégorie</label>
                  <select className="input text-xs py-1.5 w-full" value={form.categorie} onChange={e => setForm(f => ({ ...f, categorie: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{getCategoryLabel(c)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Deadline</label>
                <input type="date" className="input text-xs py-1.5 w-full" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Notes</label>
                <textarea className="input text-xs py-1.5 w-full resize-none" rows={2}
                  placeholder="Informations complémentaires…"
                  value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button type="button" onClick={() => { setShowModal(false); setForm(EMPTY_FORM) }} className="btn-secondary text-xs px-3 py-1.5">Annuler</button>
                <button type="submit" disabled={saving} className="btn-primary text-xs px-3 py-1.5 disabled:opacity-50">{saving ? 'Enregistrement…' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
