import { useState } from 'react'
import { updateTacheStatut } from '@/services/api'
import { formatDate, getPriorityDotColor, getCategoryClass, getCategoryLabel, truncate } from '@/utils/helpers'
import { Check } from 'lucide-react'

const PRIORITY_ORDER = { URGENTE: 0, HAUTE: 1, NORMALE: 2, BASSE: 3 }

const PRIORITY_DOT_LOCAL = {
  URGENTE: 'bg-red-500',
  HAUTE:   'bg-orange-400',
  NORMALE: 'bg-blue-400',
  BASSE:   'bg-gray-300',
}

export default function TodoList({ taches, onUpdate, tachesLocales, onUpdateLocales }) {
  const [showModal, setShowModal]       = useState(false)
  const [newTitre, setNewTitre]         = useState('')
  const [newCategorie, setNewCategorie] = useState('ADMINISTRATIF')
  const [newPriorite, setNewPriorite]   = useState('NORMALE')
  const [terminees, setTerminees]       = useState(new Set()) // IDs cochés localement

  const toutes = [...taches, ...tachesLocales]

  const sorted = toutes
    .filter((t) => {
      const statut = t.properties?.Statut?.select?.name
      return statut !== 'Terminé' && !terminees.has(t.id)
    })
    .sort((a, b) => {
      const pa = PRIORITY_ORDER[a.properties?.Priorité?.select?.name] ?? 9
      const pb = PRIORITY_ORDER[b.properties?.Priorité?.select?.name] ?? 9
      return pa - pb
    })

  async function handleTerminer(tache) {
    // Feedback visuel immédiat
    setTerminees((prev) => new Set([...prev, tache.id]))

    if (tache._local) {
      // Tâche locale : suppression différée (après animation)
      setTimeout(() => {
        onUpdateLocales((prev) => prev.filter((t) => t.id !== tache.id))
        setTerminees((prev) => { const s = new Set(prev); s.delete(tache.id); return s })
      }, 600)
      return
    }

    try {
      await updateTacheStatut(tache.id, 'Terminé')
      onUpdate((prev) =>
        prev.map((t) =>
          t.id === tache.id
            ? { ...t, properties: { ...t.properties, Statut: { select: { name: 'Terminé' } } } }
            : t
        )
      )
    } catch (e) {
      // En cas d'erreur, on décoche
      setTerminees((prev) => { const s = new Set(prev); s.delete(tache.id); return s })
      console.error(e)
    }
  }

  function handleAjouter() {
    if (!newTitre.trim()) return
    const nouvelleTache = {
      id: `local-${Date.now()}`,
      _local: true,
      properties: {
        Titre:     { title: [{ plain_text: newTitre.trim() }] },
        Priorité:  { select: { name: newPriorite } },
        Catégorie: { select: { name: newCategorie } },
        Statut:    { select: { name: 'À faire' } },
      },
    }
    onUpdateLocales((prev) => [...prev, nouvelleTache])
    setNewTitre('')
    setNewCategorie('ADMINISTRATIF')
    setNewPriorite('NORMALE')
    setShowModal(false)
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900">To-do du jour</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {sorted.length} tâches
          </span>
          <button
            onClick={() => setShowModal(true)}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            + Ajouter
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-50">
        {sorted.length === 0 && (
          <p className="text-xs text-gray-400 py-4 text-center">
            Aucune tâche en cours 
          </p>
        )}

        {sorted.map((tache) => {
          const titre     = tache.properties?.Titre?.title?.[0]?.plain_text || 'Sans titre'
          const priorite  = tache.properties?.Priorité?.select?.name
          const categorie = tache.properties?.Catégorie?.select?.name
          const deadline  = tache.properties?.Deadline?.date?.start
          const brouillon = tache.properties?.IA_Action?.checkbox
          const dot       = tache._local
            ? (PRIORITY_DOT_LOCAL[priorite] || 'bg-gray-300')
            : getPriorityDotColor(priorite)
          const cochee = terminees.has(tache.id)

          return (
            <div
              key={tache.id}
              className={`flex items-start gap-2.5 py-2.5 first:pt-0 last:pb-0 transition-opacity duration-500 ${cochee ? 'opacity-40' : 'opacity-100'}`}
            >
              {/* Checkbox cliquable */}
              <button
                onClick={() => handleTerminer(tache)}
                className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                  cochee
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-300 hover:border-green-400'
                }`}
                title="Marquer comme terminé"
              >
                {cochee && <Check size={10} color="white" strokeWidth={3} />}
              </button>

              <div className="flex-1 min-w-0">
                <p className={`text-xs leading-snug transition-colors ${cochee ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {truncate(titre, 90)}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {/* Point de priorité */}
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mt-1 ${dot}`} />
                  {categorie && (
                    <span className={tache._local
                      ? 'text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded'
                      : getCategoryClass(categorie)}>
                      {tache._local ? categorie : getCategoryLabel(categorie)}
                    </span>
                  )}
                  {deadline && (
                    <span className="text-[10px] text-gray-400">⏱ {formatDate(deadline)}</span>
                  )}
                </div>
              </div>

              {brouillon && (
                <span className="text-[10px] bg-primary-50 text-primary-700 border border-primary-100 px-1.5 py-0.5 rounded flex-shrink-0">
                  Mail prêt
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Modal ajout tâche */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-5 w-80">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Ajouter une tâche</h3>

            <div className="mb-3">
              <label className="text-xs text-gray-500 mb-1 block">Titre</label>
              <input
                type="text"
                value={newTitre}
                onChange={(e) => setNewTitre(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAjouter()}
                placeholder="Ex : Relancer SOCOTEC pour le PV..."
                className="input text-xs py-1.5 w-full"
                autoFocus
              />
            </div>

            <div className="mb-3">
              <label className="text-xs text-gray-500 mb-1 block">Catégorie</label>
              <select
                value={newCategorie}
                onChange={(e) => setNewCategorie(e.target.value)}
                className="input text-xs py-1.5 w-full"
              >
                <option value="ADMINISTRATIF">Administratif</option>
                <option value="PLANNING">Planning</option>
                <option value="SECURITE">Sécurité</option>
                <option value="FINANCIER">Financier</option>
                <option value="COMMUNICATION">Communication</option>
                <option value="TECHNIQUE">Technique</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-1 block">Priorité</label>
              <select
                value={newPriorite}
                onChange={(e) => setNewPriorite(e.target.value)}
                className="input text-xs py-1.5 w-full"
              >
                <option value="URGENTE">🔴 Urgente</option>
                <option value="HAUTE">🟠 Haute</option>
                <option value="NORMALE">🔵 Normale</option>
                <option value="BASSE">⚪ Basse</option>
              </select>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowModal(false); setNewTitre('') }}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                Annuler
              </button>
              <button
                onClick={handleAjouter}
                className="btn-primary text-xs px-3 py-1.5"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}