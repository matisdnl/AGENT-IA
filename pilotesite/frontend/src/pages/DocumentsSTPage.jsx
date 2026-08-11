import { useState, useEffect } from 'react'
import { useChantier } from '@/hooks/useChantier'
import { useDocument } from '@/hooks/useDocument'
import {
  Plus, Building2, FileText, ChevronDown, ChevronUp,
  Trash2, Edit2, FolderOpen, X, RefreshCw,
} from 'lucide-react'

const DOC_TYPES = [
  'Kbis', 'Assurance décennale', 'Assurance RC Pro',
  'PPSPS', 'Attestation URSSAF', 'Attestation fiscale',
  'RIB', 'Contrat', 'Devis signé', 'Autre',
]

const LOT_TYPES = [
  'Gros œuvre', 'Charpente', 'Couverture', 'Façades',
  'Menuiseries extérieures', 'Cloisons', 'Menuiseries intérieures',
  'Carrelage', 'Peinture', 'Plomberie', 'Électricité', 'CVC',
  'VRD', 'Terrassement', 'Démolition', 'Échafaudage', 'Autre',
]

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function generateAvenantHTML(st) {
  const today = new Date().toLocaleDateString('fr-FR')
  return `
<div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;padding:40px;color:#1a1a1a;">
  <div style="text-align:center;border-bottom:2px solid #1a56db;padding-bottom:20px;margin-bottom:28px;">
    <h1 style="font-size:20px;font-weight:bold;color:#1a56db;margin:0;">AVENANT AU MARCHÉ DE TRAVAUX</h1>
    <p style="color:#666;margin:6px 0 0;">N°&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;${new Date().getFullYear()}</p>
  </div>

  <div style="margin-bottom:22px;">
    <h2 style="font-size:12px;font-weight:bold;text-transform:uppercase;color:#1a56db;margin-bottom:10px;border-bottom:1px solid #e5e7eb;padding-bottom:5px;">1. Identification des parties</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;">
        <p style="font-size:10px;font-weight:bold;color:#94a3b8;text-transform:uppercase;margin:0 0 6px;">Maître d'ouvrage</p>
        <p style="font-size:13px;font-weight:bold;margin:0 0 3px;">PiloteSite — Matis Denoual</p>
        <p style="font-size:12px;color:#64748b;margin:0;">Conducteur de travaux</p>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;">
        <p style="font-size:10px;font-weight:bold;color:#94a3b8;text-transform:uppercase;margin:0 0 6px;">Entreprise (ST)</p>
        <p style="font-size:13px;font-weight:bold;margin:0 0 3px;">${st.nom}</p>
        ${st.siret ? `<p style="font-size:11px;color:#64748b;margin:2px 0;">SIRET : ${st.siret}</p>` : ''}
        ${st.adresse ? `<p style="font-size:11px;color:#64748b;margin:2px 0;">${st.adresse}</p>` : ''}
        ${st.contact ? `<p style="font-size:11px;color:#64748b;margin:2px 0;">Contact : ${st.contact}</p>` : ''}
        ${st.telephone ? `<p style="font-size:11px;color:#64748b;margin:2px 0;">Tél. : ${st.telephone}</p>` : ''}
      </div>
    </div>
  </div>

  <div style="margin-bottom:22px;">
    <h2 style="font-size:12px;font-weight:bold;text-transform:uppercase;color:#1a56db;margin-bottom:10px;border-bottom:1px solid #e5e7eb;padding-bottom:5px;">2. Objet de l'avenant</h2>
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:9px 12px;margin-bottom:8px;">
      <p style="font-size:11px;color:#92400e;margin:0;font-style:italic;">⚠ À compléter avant signature</p>
    </div>
    <div style="border:1px dashed #cbd5e1;border-radius:6px;padding:14px;min-height:56px;">
      <p style="color:#94a3b8;font-style:italic;font-size:13px;margin:0;">[ Description des travaux supplémentaires / modifications — lot : ${st.lot || '___'} ]</p>
    </div>
  </div>

  <div style="margin-bottom:22px;">
    <h2 style="font-size:12px;font-weight:bold;text-transform:uppercase;color:#1a56db;margin-bottom:10px;border-bottom:1px solid #e5e7eb;padding-bottom:5px;">3. Incidence financière</h2>
    <table style="width:100%;border-collapse:collapse;font-size:12px;">
      <thead>
        <tr style="background:#1a56db;color:white;">
          <th style="padding:8px 12px;text-align:left;font-weight:600;">Désignation</th>
          <th style="padding:8px 12px;text-align:right;font-weight:600;">Montant HT</th>
          <th style="padding:8px 12px;text-align:right;font-weight:600;">TVA 20%</th>
          <th style="padding:8px 12px;text-align:right;font-weight:600;">Montant TTC</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:10px 12px;color:#94a3b8;font-style:italic;">[ Travaux — ${st.lot || 'à préciser'} ]</td>
          <td style="padding:10px 12px;text-align:right;color:#94a3b8;">___ €</td>
          <td style="padding:10px 12px;text-align:right;color:#94a3b8;">___ €</td>
          <td style="padding:10px 12px;text-align:right;color:#94a3b8;">___ €</td>
        </tr>
      </tbody>
      <tfoot>
        <tr style="background:#f8fafc;font-weight:bold;">
          <td style="padding:10px 12px;">Total avenant</td>
          <td style="padding:10px 12px;text-align:right;">___ € HT</td>
          <td style="padding:10px 12px;"></td>
          <td style="padding:10px 12px;text-align:right;">___ € TTC</td>
        </tr>
      </tfoot>
    </table>
  </div>

  <div style="margin-bottom:22px;">
    <h2 style="font-size:12px;font-weight:bold;text-transform:uppercase;color:#1a56db;margin-bottom:10px;border-bottom:1px solid #e5e7eb;padding-bottom:5px;">4. Délai d'exécution</h2>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;font-size:12px;">
      <p style="margin:0;">Durée supplémentaire : <span style="color:#94a3b8;font-style:italic;">___ jours ouvrés</span></p>
      <p style="margin:5px 0 0;">Nouvelle date de fin prévisionnelle : <span style="color:#94a3b8;font-style:italic;">___ / ___ / ___</span></p>
    </div>
  </div>

  <div>
    <h2 style="font-size:12px;font-weight:bold;text-transform:uppercase;color:#1a56db;margin-bottom:14px;border-bottom:1px solid #e5e7eb;padding-bottom:5px;">5. Signatures</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;">
      <div>
        <p style="font-size:12px;font-weight:bold;margin-bottom:5px;">Le Maître d'ouvrage</p>
        <p style="font-size:11px;color:#64748b;">Fait à __________, le ${today}</p>
        <div style="border-bottom:1px solid #cbd5e1;margin-top:60px;width:85%;"></div>
        <p style="font-size:11px;color:#64748b;margin-top:4px;">Matis Denoual — CDT</p>
      </div>
      <div>
        <p style="font-size:12px;font-weight:bold;margin-bottom:5px;">L'Entreprise</p>
        <p style="font-size:11px;color:#64748b;">Fait à __________, le ${today}</p>
        <div style="border-bottom:1px solid #cbd5e1;margin-top:60px;width:85%;"></div>
        <p style="font-size:11px;color:#64748b;margin-top:4px;">${st.contact || st.nom}</p>
      </div>
    </div>
  </div>
</div>`
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function AddDocForm({ onAdd, onCancel }) {
  const [nom, setNom] = useState('')
  const [type, setType] = useState('Kbis')

  function submit() {
    if (!nom.trim()) return
    onAdd({ nom: nom.trim(), type })
  }

  return (
    <div className="mt-2 bg-white border border-gray-200 rounded-lg p-2.5 flex items-center gap-2">
      <input
        type="text"
        value={nom}
        onChange={e => setNom(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        placeholder="Nom du document (ex : Kbis 2025)…"
        className="input text-xs py-1.5 flex-1"
        autoFocus
      />
      <select
        value={type}
        onChange={e => setType(e.target.value)}
        className="input text-xs py-1.5 w-40"
      >
        {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
      </select>
      <button onClick={submit} className="btn-primary text-xs px-2.5 py-1.5">OK</button>
      <button onClick={onCancel} className="btn-secondary text-xs px-2 py-1.5"><X size={12} /></button>
    </div>
  )
}

function STFormModal({ st, onSave, onClose }) {
  const [form, setForm] = useState({
    id: st?.id || null,
    nom: st?.nom || '',
    lot: st?.lot || '',
    siret: st?.siret || '',
    adresse: st?.adresse || '',
    contact: st?.contact || '',
    email: st?.email || '',
    telephone: st?.telephone || '',
  })

  function set(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.nom.trim()) return
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">
            {st ? 'Modifier le sous-traitant' : 'Ajouter un sous-traitant'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Nom de l'entreprise <span className="text-red-400">*</span>
              </label>
              <input name="nom" value={form.nom} onChange={set} required
                placeholder="Ex : ACME Construction" className="input text-sm w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Lot / Corps d'état</label>
              <select name="lot" value={form.lot} onChange={set} className="input text-sm w-full">
                <option value="">Choisir…</option>
                {LOT_TYPES.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">SIRET</label>
              <input name="siret" value={form.siret} onChange={set}
                placeholder="12345678901234" className="input text-sm w-full" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Adresse</label>
              <input name="adresse" value={form.adresse} onChange={set}
                placeholder="123 rue de Paris, 33000 Bordeaux" className="input text-sm w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Contact</label>
              <input name="contact" value={form.contact} onChange={set}
                placeholder="Jean Dupont" className="input text-sm w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Téléphone</label>
              <input name="telephone" value={form.telephone} onChange={set}
                placeholder="06 12 34 56 78" className="input text-sm w-full" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input name="email" value={form.email} onChange={set}
                placeholder="contact@acme.fr" className="input text-sm w-full" />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-5">
            <button type="button" onClick={onClose} className="btn-secondary text-sm px-4 py-2">Annuler</button>
            <button type="submit" className="btn-primary text-sm px-4 py-2">
              {st ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────

export default function DocumentsSTPage() {
  const { chantierId } = useChantier()
  const { openDocument } = useDocument()
  const [sts, setSTs] = useState([])
  const [expandedId, setExpandedId] = useState(null)
  const [showSTModal, setShowSTModal] = useState(false)
  const [editST, setEditST] = useState(null)
  const [showAddDoc, setShowAddDoc] = useState(null)

  const storageKey = `st_docs_${chantierId}`

  useEffect(() => {
    const raw = localStorage.getItem(storageKey)
    setSTs(raw ? JSON.parse(raw).sts || [] : [])
  }, [chantierId])

  function persist(next) {
    setSTs(next)
    localStorage.setItem(storageKey, JSON.stringify({ sts: next }))
  }

  function handleSaveST(data) {
    if (data.id) {
      persist(sts.map(s => s.id === data.id ? { ...s, ...data } : s))
    } else {
      persist([...sts, { ...data, id: uid(), documents: [], avenants: [] }])
    }
    setShowSTModal(false)
    setEditST(null)
  }

  function handleDeleteST(id) {
    if (!window.confirm('Supprimer ce sous-traitant et tous ses documents ?')) return
    persist(sts.filter(s => s.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  function handleAddDoc(stId, docData) {
    persist(sts.map(s => s.id === stId
      ? { ...s, documents: [...(s.documents || []), { ...docData, id: uid(), dateAjout: new Date().toISOString().slice(0, 10) }] }
      : s
    ))
    setShowAddDoc(null)
  }

  function handleDeleteDoc(stId, docId) {
    persist(sts.map(s => s.id === stId
      ? { ...s, documents: (s.documents || []).filter(d => d.id !== docId) }
      : s
    ))
  }

  function handleDeleteAvenant(stId, avenantId) {
    persist(sts.map(s => s.id === stId
      ? { ...s, avenants: (s.avenants || []).filter(a => a.id !== avenantId) }
      : s
    ))
  }

  function handleGenerateAvenant(st) {
    openDocument({
      type: 'avenant',
      title: `Avenant — ${st.nom}`,
      html: generateAvenantHTML(st),
      stId: st.id,
      stNom: st.nom,
    })
  }

  function handleOpenAvenant(st, avenant) {
    openDocument({
      type: 'avenant',
      title: avenant.titre,
      html: avenant.html,
      stId: st.id,
      stNom: st.nom,
    })
  }

  const totalDocs = sts.reduce((acc, s) => acc + (s.documents || []).length, 0)
  const totalAvenants = sts.reduce((acc, s) => acc + (s.avenants || []).length, 0)

  return (
    <div className="max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-base font-semibold text-gray-900">Documents ST</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {sts.length} ST
            {totalDocs > 0 && ` · ${totalDocs} document${totalDocs > 1 ? 's' : ''}`}
            {totalAvenants > 0 && ` · ${totalAvenants} avenant${totalAvenants > 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => { setEditST(null); setShowSTModal(true) }}
          className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
        >
          <Plus size={13} /> Ajouter un ST
        </button>
      </div>

      {/* Hint */}
      <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
        <p className="text-xs text-gray-400">
          Dans le chat ci-dessous, tapez{' '}
          <span className="font-mono font-semibold bg-gray-100 text-gray-500 px-1 rounded">avenant [nom entreprise]</span>
          {' '}pour générer automatiquement un avenant pré-rempli.
        </p>
      </div>

      {/* Empty state */}
      {sts.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Building2 size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium text-gray-500">Aucun sous-traitant</p>
          <p className="text-xs mt-1">Ajoutez vos ST pour gérer leurs documents et générer des avenants</p>
          <button
            onClick={() => { setEditST(null); setShowSTModal(true) }}
            className="mt-4 btn-primary text-xs px-4 py-2"
          >
            + Ajouter le premier ST
          </button>
        </div>
      )}

      {/* ST list */}
      <div className="flex flex-col gap-3">
        {sts.map(st => {
          const expanded = expandedId === st.id
          const nbDocs = (st.documents || []).length
          const nbAvenants = (st.avenants || []).length

          return (
            <div key={st.id} className="card">
              {/* ST header row */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <Building2 size={17} className="text-primary-600" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900">{st.nom}</p>
                    {st.lot && (
                      <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100 font-medium">
                        {st.lot}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    {st.siret && <span className="text-[11px] text-gray-400">SIRET : {st.siret}</span>}
                    {st.contact && <span className="text-[11px] text-gray-600">{st.contact}</span>}
                    {st.telephone && <span className="text-[11px] text-gray-400">{st.telephone}</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-gray-400">
                      {nbDocs} doc{nbDocs > 1 ? 's' : ''}
                    </span>
                    {nbAvenants > 0 && (
                      <span className="text-[11px] text-gray-400">
                        · {nbAvenants} avenant{nbAvenants > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleGenerateAvenant(st)}
                    className="text-xs bg-primary-50 text-primary-600 border border-primary-100 rounded-lg px-2.5 py-1 hover:bg-primary-100 transition-colors font-medium whitespace-nowrap"
                  >
                    + Avenant
                  </button>
                  <button
                    onClick={() => { setEditST(st); setShowSTModal(true) }}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDeleteST(st.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={13} />
                  </button>
                  <button
                    onClick={() => setExpandedId(expanded ? null : st.id)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>

              {/* Expanded zone */}
              {expanded && (
                <div className="mt-4 pt-4 border-t border-gray-50 space-y-5">

                  {/* Documents officiels */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                        Documents officiels
                      </p>
                      <button
                        onClick={() => setShowAddDoc(showAddDoc === st.id ? null : st.id)}
                        className="text-[11px] text-primary-600 hover:text-primary-700 flex items-center gap-1 font-medium"
                      >
                        <Plus size={11} /> Ajouter
                      </button>
                    </div>

                    {nbDocs === 0 && showAddDoc !== st.id && (
                      <p className="text-xs text-gray-400 italic py-1.5">
                        Kbis, assurances, attestations URSSAF…
                      </p>
                    )}

                    {(st.documents || []).length > 0 && (
                      <div className="space-y-1.5">
                        {st.documents.map(doc => (
                          <div
                            key={doc.id}
                            className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 group"
                          >
                            <FileText size={13} className="text-gray-400 flex-shrink-0" />
                            <span className="flex-1 text-xs text-gray-700">{doc.nom}</span>
                            <span className="text-[10px] text-gray-400 bg-white border border-gray-100 px-1.5 py-0.5 rounded whitespace-nowrap">
                              {doc.type}
                            </span>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap">{doc.dateAjout}</span>
                            <button
                              onClick={() => handleDeleteDoc(st.id, doc.id)}
                              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all flex-shrink-0"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {showAddDoc === st.id && (
                      <AddDocForm
                        onAdd={d => handleAddDoc(st.id, d)}
                        onCancel={() => setShowAddDoc(null)}
                      />
                    )}
                  </div>

                  {/* Avenants générés */}
                  {nbAvenants > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Avenants générés
                      </p>
                      <div className="space-y-1.5">
                        {st.avenants.map(avenant => (
                          <div
                            key={avenant.id}
                            className="flex items-center gap-2 bg-blue-50/60 rounded-lg px-3 py-2 border border-blue-100/50 group"
                          >
                            <FolderOpen size={13} className="text-blue-400 flex-shrink-0" />
                            <button
                              onClick={() => handleOpenAvenant(st, avenant)}
                              className="flex-1 text-xs text-blue-700 text-left hover:text-blue-800 font-medium hover:underline"
                            >
                              {avenant.titre}
                            </button>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap">
                              {avenant.dateCreation}
                            </span>
                            <button
                              onClick={() => handleDeleteAvenant(st.id, avenant.id)}
                              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all flex-shrink-0"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ST Form modal */}
      {showSTModal && (
        <STFormModal
          st={editST}
          onSave={handleSaveST}
          onClose={() => { setShowSTModal(false); setEditST(null) }}
        />
      )}
    </div>
  )
}
