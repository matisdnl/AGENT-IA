import { useEffect, useState } from 'react'
import { Send, Edit2, X, ChevronDown, ChevronUp, Mail, RefreshCw } from 'lucide-react'
import { useChantier } from '@/hooks/useChantier'
import { getAllMails, validerMail, modifierMail, rejeterMail } from '@/services/api'
import { truncate } from '@/utils/helpers'

const STATUT_STYLE = {
  'À faire':        { bg: 'bg-gray-100',   text: 'text-gray-600',   label: 'À traiter' },
  'En cours':       { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'En cours' },
  'Brouillon prêt': { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Brouillon prêt' },
  'Envoyé':         { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Envoyé' },
  'Rejeté':         { bg: 'bg-red-50',     text: 'text-red-500',    label: 'Rejeté' },
}

const PRIO_DOT = {
  URGENTE: 'bg-red-500',
  HAUTE:   'bg-orange-400',
  NORMALE: 'bg-blue-400',
  BASSE:   'bg-gray-300',
}

const TABS = ['Tous', 'Brouillon prêt', 'À faire', 'En cours', 'Envoyé']

export default function MailsPage() {
  const { chantierId } = useChantier()
  const [mails, setMails]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [tab, setTab]               = useState('Tous')
  const [expandedId, setExpandedId] = useState(null)
  const [modifId, setModifId]       = useState(null)
  const [instruction, setInstruction] = useState('')
  const [actionId, setActionId]     = useState(null)

  function load(silent = false) {
    if (!chantierId) return
    if (silent) setRefreshing(true)
    else setLoading(true)
    getAllMails(chantierId)
      .then(r => setMails(r.results || []))
      .catch(console.error)
      .finally(() => { setLoading(false); setRefreshing(false) })
  }

  useEffect(() => { load() }, [chantierId])

  const filtered = tab === 'Tous'
    ? mails
    : mails.filter(m => m.properties?.Statut?.select?.name === tab)

  const countBrouillons = mails.filter(m => m.properties?.Statut?.select?.name === 'Brouillon prêt').length

  async function handleValider(mail) {
    setActionId(mail.id)
    try {
      await validerMail(mail.id)
      setMails(prev => prev.map(m =>
        m.id === mail.id ? { ...m, properties: { ...m.properties, Statut: { select: { name: 'Envoyé' } } } } : m
      ))
    } catch (e) { console.error(e) }
    finally { setActionId(null) }
  }

  async function handleModifier(mail) {
    if (!instruction.trim()) return
    setActionId(mail.id)
    try {
      await modifierMail(mail.id, instruction)
      setModifId(null)
      setInstruction('')
    } catch (e) { console.error(e) }
    finally { setActionId(null) }
  }

  async function handleRejeter(mail) {
    setActionId(mail.id)
    try {
      await rejeterMail(mail.id)
      setMails(prev => prev.map(m =>
        m.id === mail.id ? { ...m, properties: { ...m.properties, Statut: { select: { name: 'Rejeté' } } } } : m
      ))
    } catch (e) { console.error(e) }
    finally { setActionId(null) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-sm text-gray-400">Chargement…</div>
  )

  return (
    <div className="max-w-3xl mx-auto">

      {/* En-tête */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-base font-semibold text-gray-900">Mails IA</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {mails.length} mail{mails.length > 1 ? 's' : ''} · {countBrouillons} brouillon{countBrouillons > 1 ? 's' : ''} à valider
          </p>
        </div>
        <button onClick={() => load(true)} disabled={refreshing}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors">
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 mb-5 overflow-x-auto">
        {TABS.map(t => {
          const count = t === 'Tous' ? mails.length : mails.filter(m => m.properties?.Statut?.select?.name === t).length
          const isBrouillon = t === 'Brouillon prêt' && count > 0
          return (
            <button key={t} onClick={() => setTab(t)}
              className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap border transition-colors flex items-center gap-1.5 ${
                tab === t ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}>
              {t}
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  tab === t ? 'bg-white/20 text-white' : isBrouillon ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                }`}>{count}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* État vide */}
      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Mail size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Aucun mail dans cette catégorie</p>
        </div>
      )}

      {/* Liste des mails */}
      <div className="flex flex-col gap-3">
        {filtered.map(mail => {
          const props      = mail.properties
          const nom        = props?.Nom?.title?.[0]?.plain_text || 'Mail sans titre'
          const objet      = props?.['Objet email']?.rich_text?.[0]?.plain_text
          const expediteurRaw = props?.Expéditeur?.rich_text?.[0]?.plain_text || ''
          const expediteur = expediteurRaw === 'bdd.agent.ia@gmail.com' ? '' : expediteurRaw
          const statut     = props?.Statut?.select?.name
          const priorite   = props?.Priorité?.select?.name
          const resumeIA   = props?.['Résumé IA']?.rich_text?.[0]?.plain_text
          const brouillon  = props?.['Brouillon réponse']?.rich_text?.[0]?.plain_text
          const deadline   = props?.Deadline?.date?.start
          const styleStat  = STATUT_STYLE[statut] || STATUT_STYLE['À faire']
          const expanded   = expandedId === mail.id
          const isBrouillon = statut === 'Brouillon prêt'
          const isEnvoye   = statut === 'Envoyé' || statut === 'Rejeté'

          return (
            <div key={mail.id} className={`card transition-opacity ${isEnvoye ? 'opacity-60' : ''}`}>
              {/* En-tête du mail */}
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${styleStat.bg} ${styleStat.text}`}>
                      {styleStat.label}
                    </span>
                    {priorite && (
                      <span className="flex items-center gap-1.5 text-[10px] font-medium text-gray-600">
                        <span className={`w-3 h-3 rounded-full flex-shrink-0 ${PRIO_DOT[priorite]}`} />
                        {priorite.charAt(0) + priorite.slice(1).toLowerCase()}
                      </span>
                    )}
                    {deadline && <span className="text-[10px] text-gray-400">⏱ {deadline.slice(0,10)}</span>}
                  </div>

                  <p className="text-sm font-medium text-gray-800">{objet || nom}</p>
                  {expediteur && <p className="text-xs text-gray-400 mt-0.5">De : {expediteur}</p>}
                </div>

                {(resumeIA || brouillon) && (
                  <button onClick={() => setExpandedId(expanded ? null : mail.id)}
                    className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5">
                    {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                )}
              </div>

              {/* Résumé IA */}
              {resumeIA && expanded && (
                <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-2.5">
                  <p className="text-[10px] font-semibold text-blue-600 mb-1">Résumé IA</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{resumeIA}</p>
                </div>
              )}

              {/* Brouillon de réponse */}
              {brouillon && expanded && (
                <div className="mt-2 bg-gray-50 border border-gray-100 rounded-lg p-2.5">
                  <p className="text-[10px] font-semibold text-gray-500 mb-1">Brouillon de réponse</p>
                  <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{brouillon}</p>
                </div>
              )}

              {/* Résumé court si non expanded */}
              {resumeIA && !expanded && (
                <p className="text-xs text-gray-400 mt-1.5 italic">{truncate(resumeIA, 100)}</p>
              )}

              {/* Zone modification */}
              {modifId === mail.id && isBrouillon && (
                <div className="mt-3 flex gap-1.5">
                  <input type="text" value={instruction} onChange={e => setInstruction(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleModifier(mail)}
                    placeholder="Ex : Sois plus concis, ajoute la référence du marché…"
                    className="input text-xs py-1.5 flex-1" autoFocus />
                  <button onClick={() => handleModifier(mail)} disabled={actionId === mail.id}
                    className="btn-primary text-xs px-2.5 py-1 disabled:opacity-40">OK</button>
                  <button onClick={() => { setModifId(null); setInstruction('') }}
                    className="btn-secondary text-xs px-2 py-1"><X size={12} /></button>
                </div>
              )}

              {/* Actions — brouillons seulement */}
              {isBrouillon && (
                <div className="flex gap-1.5 mt-3 pt-3 border-t border-gray-50">
                  <button onClick={() => handleValider(mail)} disabled={actionId === mail.id}
                    className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 disabled:opacity-40">
                    <Send size={11} /> {actionId === mail.id ? '…' : 'Envoyer'}
                  </button>
                  <button onClick={() => { setModifId(modifId === mail.id ? null : mail.id); setExpandedId(mail.id) }}
                    className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                    <Edit2 size={11} /> Modifier
                  </button>
                  <button onClick={() => handleRejeter(mail)} disabled={actionId === mail.id}
                    className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 transition-colors flex items-center gap-1">
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
