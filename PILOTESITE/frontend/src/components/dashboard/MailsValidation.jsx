import { useState } from 'react'
import { validerMail, modifierMail, rejeterMail } from '@/services/api'
import { truncate } from '@/utils/helpers'
import { Send, Edit2, X, ChevronDown, ChevronUp } from 'lucide-react'

const PRIO_DOT = {
  URGENTE: 'bg-red-500',
  HAUTE:   'bg-orange-400',
  NORMALE: 'bg-blue-400',
  BASSE:   'bg-gray-300',
}

export default function MailsValidation({ mails, onUpdate }) {
  const [modifId, setModifId]       = useState(null)
  const [instruction, setInstruction] = useState('')
  const [loading, setLoading]       = useState(null)
  const [expandedId, setExpandedId] = useState(null) // aperçu complet du brouillon
  const [envoyes, setEnvoyes]       = useState(new Set()) // feedback visuel immédiat

  const brouillons = mails

  async function handleValider(mail) {
    // Feedback immédiat
    setEnvoyes((prev) => new Set([...prev, mail.id]))
    setLoading(mail.id)
    try {
      await validerMail(mail.id)
      // Retire après courte pause pour que l'utilisateur voit le ✓
      setTimeout(() => {
        onUpdate((prev) =>
          prev.map((m) =>
            m.id === mail.id
              ? { ...m, properties: { ...m.properties, Statut: { select: { name: 'Envoyé' } } } }
              : m
          )
        )
      }, 800)
    } catch (e) {
      setEnvoyes((prev) => { const s = new Set(prev); s.delete(mail.id); return s })
      console.error(e)
    } finally {
      setLoading(null)
    }
  }

  async function handleModifier(mail) {
    if (!instruction.trim()) return
    setLoading(mail.id)
    try {
      await modifierMail(mail.id, instruction)
      setModifId(null)
      setInstruction('')
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(null)
    }
  }

  async function handleRejeter(mail) {
    setLoading(mail.id)
    try {
      await rejeterMail(mail.id)
      onUpdate((prev) => prev.filter((m) => m.id !== mail.id))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900">Mails à valider</h2>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {brouillons.filter(m => !envoyes.has(m.id)).length} en attente
        </span>
      </div>

      <div className="divide-y divide-gray-50">
        {brouillons.length === 0 && (
          <p className="text-xs text-gray-400 py-4 text-center">
            Aucun mail en attente de validation
          </p>
        )}

        {brouillons.map((mail) => {
          const titre     = mail.properties?.['Objet email']?.rich_text?.[0]?.plain_text
                         || mail.properties?.Nom?.title?.[0]?.plain_text
                         || 'Mail sans titre'
          const brouillon = mail.properties?.['Brouillon réponse']?.rich_text?.[0]?.plain_text || ''
          const sourceRaw = mail.properties?.Expéditeur?.rich_text?.[0]?.plain_text || ''
          const source    = sourceRaw === 'bdd.agent.ia@gmail.com' ? '' : sourceRaw
          const statut    = mail.properties?.Statut?.select?.name
          const priorite  = mail.properties?.Priorité?.select?.name
          const deadline  = mail.properties?.Deadline?.date?.start
          const envoye    = envoyes.has(mail.id)
          const expanded  = expandedId === mail.id

          return (
            <div
              key={mail.id}
              className={`py-3 first:pt-0 last:pb-0 transition-opacity duration-500 ${envoye ? 'opacity-40' : 'opacity-100'}`}
            >
              {/* En-tête mail */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {envoye && (
                      <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
                        ✓ Envoyé
                      </span>
                    )}
                    {!envoye && statut && statut !== 'Brouillon prêt' && (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">
                        {statut}
                      </span>
                    )}
                    {!envoye && statut === 'Brouillon prêt' && (
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                        Brouillon prêt
                      </span>
                    )}
                    <p className="text-xs font-medium text-gray-800">{truncate(titre, 60)}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {priorite && (
                      <span className="flex items-center gap-1.5 text-[10px] font-medium text-gray-600">
                        <span className={`w-3 h-3 rounded-full flex-shrink-0 ${PRIO_DOT[priorite]}`} />
                        {priorite.charAt(0) + priorite.slice(1).toLowerCase()}
                      </span>
                    )}
                    {deadline && <span className="text-[10px] text-gray-400">⏱ {deadline.slice(0,10)}</span>}
                    {source && <p className="text-[11px] text-gray-400">De : {source}</p>}
                  </div>
                </div>
                {/* Bouton aperçu complet */}
                {brouillon && !envoye && (
                  <button
                    onClick={() => setExpandedId(expanded ? null : mail.id)}
                    className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                    title="Voir le brouillon complet"
                  >
                    {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                )}
              </div>

              {/* Aperçu brouillon */}
              {brouillon && !envoye && (
                <div className="mt-1.5 bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                  <p className="text-[11px] text-gray-500 leading-relaxed whitespace-pre-line">
                    {expanded ? brouillon : truncate(brouillon, 160)}
                  </p>
                </div>
              )}

              {/* Zone de modification */}
              {modifId === mail.id && !envoye && (
                <div className="mt-2 flex gap-1.5">
                  <input
                    type="text"
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder="Ex : Change le ton, ajoute la PJ PPSPS..."
                    className="input text-xs py-1.5 flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && handleModifier(mail)}
                    autoFocus
                  />
                  <button
                    onClick={() => handleModifier(mail)}
                    disabled={loading === mail.id}
                    className="btn-primary text-xs px-2.5 py-1 disabled:opacity-40"
                  >
                    OK
                  </button>
                  <button
                    onClick={() => { setModifId(null); setInstruction('') }}
                    className="btn-secondary text-xs px-2 py-1"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {/* Actions — seulement pour les brouillons prêts */}
              {!envoye && statut === 'Brouillon prêt' && (
                <div className="flex gap-1.5 mt-2">
                  <button
                    onClick={() => handleValider(mail)}
                    disabled={loading === mail.id}
                    className="btn-primary text-xs px-2.5 py-1 disabled:opacity-40 flex items-center gap-1"
                  >
                    <Send size={11} />
                    {loading === mail.id ? '…' : 'Envoyer'}
                  </button>
                  <button
                    onClick={() => setModifId(modifId === mail.id ? null : mail.id)}
                    className="btn-secondary text-xs px-2.5 py-1 flex items-center gap-1"
                  >
                    <Edit2 size={11} /> Modifier
                  </button>
                  <button
                    onClick={() => handleRejeter(mail)}
                    disabled={loading === mail.id}
                    className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 transition-colors flex items-center gap-1"
                    title="Rejeter ce mail"
                  >
                    <X size={11} /> Rejeter
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}