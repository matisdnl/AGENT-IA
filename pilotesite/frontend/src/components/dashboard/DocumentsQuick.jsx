import { useState, useRef } from 'react'
import { FileText, Plus, ExternalLink, Trash2, Edit2, Upload, Link } from 'lucide-react'

const STORAGE_KEY = 'pilotesite_docs'

function loadDocs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch { return [] }
}

function saveDocs(docs) {
  // On sauvegarde sans le contenu base64 pour la liste,
  // le contenu est stocké séparément par id
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs))
}

export default function DocumentsQuick({ onDocsChange }) {
  const [docs, setDocs] = useState(loadDocs)
  const [contextMenu, setContextMenu] = useState(null) // { docId, x, y }
  const [showAddModal, setShowAddModal] = useState(false)
  const [showRenameModal, setShowRenameModal] = useState(null) // docId
  const [addMode, setAddMode] = useState('file') // 'file' | 'link'
  const [newLabel, setNewLabel] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [renameValue, setRenameValue] = useState('')
  const fileInputRef = useRef()

  function updateDocs(newDocs) {
    setDocs(newDocs)
    saveDocs(newDocs)
    onDocsChange?.(newDocs)
  }

  // --- Upload fichier PC ---
  function handleFileUpload(e, targetDocId = null) {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      const base64 = evt.target.result
      const ext = file.name.split('.').pop().toLowerCase()
      const sizeKB = Math.round(file.size / 1024)

      if (file.size > 5 * 1024 * 1024) {
        alert('Fichier trop lourd (max 5MB). Utilise un lien SharePoint à la place.')
        return
      }

      if (targetDocId) {
        // Remplacer un doc existant
        const updated = docs.map(d =>
          d.id === targetDocId
            ? { ...d, type: 'file', ext, sizeKB, data: base64, filename: file.name }
            : d
        )
        updateDocs(updated)
      } else {
        // Nouveau doc
        const label = newLabel.trim() || file.name.replace(/\.[^/.]+$/, '')
        const newDoc = {
          id: Date.now().toString(),
          label,
          type: 'file',
          ext,
          sizeKB,
          data: base64,
          filename: file.name,
        }
        updateDocs([...docs, newDoc])
      }
      setShowAddModal(false)
      setNewLabel('')
      e.target.value = ''
    }
    reader.readAsDataURL(file)
  }

  // --- Ajout lien SharePoint ---
  function handleAddLink() {
    if (!newUrl.trim()) return
    const label = newLabel.trim() || 'Document SharePoint'
    const newDoc = {
      id: Date.now().toString(),
      label,
      type: 'link',
      url: newUrl.trim(),
    }
    updateDocs([...docs, newDoc])
    setShowAddModal(false)
    setNewLabel('')
    setNewUrl('')
  }

  // --- Ouvrir un doc ---
  function handleOpen(doc) {
    if (doc.type === 'link') {
      window.open(doc.url, '_blank')
    } else if (doc.data) {
      // Crée un lien temporaire et le clique
      const a = document.createElement('a')
      a.href = doc.data
      a.download = doc.filename || doc.label
      a.click()
    }
    setContextMenu(null)
  }

  // --- Clic droit ---
  function handleRightClick(e, doc) {
    e.preventDefault()
    setContextMenu({ doc, x: e.clientX, y: e.clientY })
  }

  // --- Supprimer ---
  function handleDelete(docId) {
    updateDocs(docs.filter(d => d.id !== docId))
    setContextMenu(null)
  }

  // --- Renommer ---
  function handleRename(docId) {
    const doc = docs.find(d => d.id === docId)
    setRenameValue(doc?.label || '')
    setShowRenameModal(docId)
    setContextMenu(null)
  }

  function confirmRename() {
    if (!renameValue.trim()) return
    updateDocs(docs.map(d =>
      d.id === showRenameModal ? { ...d, label: renameValue.trim() } : d
    ))
    setShowRenameModal(null)
  }

  // --- Icône selon extension ---
  function getDocColor(doc) {
    if (doc.type === 'link') return 'text-blue-500'
    const ext = doc.ext || ''
    if (['pdf'].includes(ext)) return 'text-red-400'
    if (['xlsx', 'xls', 'xlsm', 'xlsb', 'csv'].includes(ext)) return 'text-green-500'
    if (['docx', 'doc'].includes(ext)) return 'text-blue-500'
    return 'text-gray-400'
  }

  return (
    <div className="card" onClick={() => setContextMenu(null)}>
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Documents types</h2>

      {/* Grille scrollable */}
      <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-1">
        {docs.length === 0 && (
          <p className="text-xs text-gray-400 col-span-2 text-center py-3">
            Aucun document — ajoute-en un ci-dessous
          </p>
        )}
        {docs.map((doc) => (
          <div
            key={doc.id}
            className="relative group flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-lg px-2 py-2 transition-colors"
          >
            {/* Clic principal = ouvrir */}
            <button
              onClick={() => handleOpen(doc)}
              className="flex items-center gap-1.5 flex-1 min-w-0 text-left"
              title={doc.type === 'file' ? `${doc.filename} (${doc.sizeKB} KB)` : doc.url}
            >
              {doc.type === 'link'
                ? <ExternalLink size={13} className="flex-shrink-0 text-blue-400" />
                : <FileText size={13} className={`flex-shrink-0 ${getDocColor(doc)}`} />
              }
              <span className="truncate">{doc.label}</span>
            </button>

            {/* Boutons Renommer / Supprimer — visibles au survol */}
            <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5 bg-gray-50">
              <button
                onClick={(e) => { e.stopPropagation(); handleRename(doc.id) }}
                className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                title="Renommer"
              >
                <Edit2 size={11} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(doc.id) }}
                className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-500"
                title="Supprimer"
              >
                <Trash2 size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bouton ajouter */}
      <button
        onClick={(e) => { e.stopPropagation(); setShowAddModal(true) }}
        className="mt-2 w-full text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg py-1.5 hover:bg-gray-50 hover:text-gray-600 transition-colors flex items-center justify-center gap-1"
      >
        <Plus size={12} /> Ajouter un document
      </button>

      {/* ---- Menu clic droit ---- */}
      {contextMenu && (
        <div
          className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 w-44"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleOpen(contextMenu.doc)}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
          >
            <ExternalLink size={13} /> Ouvrir / Télécharger
          </button>
          <button
            onClick={() => handleRename(contextMenu.doc.id)}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
          >
            <Edit2 size={13} /> Renommer
          </button>
          <label className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer">
            <Upload size={13} /> Remplacer le fichier
            <input
              type="file"
              className="hidden"
              onChange={(e) => { handleFileUpload(e, contextMenu.doc.id); setContextMenu(null) }}
            />
          </label>
          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={() => handleDelete(contextMenu.doc.id)}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-500 hover:bg-red-50"
          >
            <Trash2 size={13} /> Supprimer
          </button>
        </div>
      )}

      {/* ---- Modal ajout ---- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-5 w-80" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Ajouter un document</h3>

            {/* Tabs File / Link */}
            <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setAddMode('file')}
                className={`flex-1 text-xs py-1.5 rounded-md transition-colors flex items-center justify-center gap-1 ${addMode === 'file' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
              >
                <Upload size={12} /> Depuis mon PC
              </button>
              <button
                onClick={() => setAddMode('link')}
                className={`flex-1 text-xs py-1.5 rounded-md transition-colors flex items-center justify-center gap-1 ${addMode === 'link' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
              >
                <Link size={12} /> Lien SharePoint
              </button>
            </div>

            <div className="mb-3">
              <label className="text-xs text-gray-500 mb-1 block">Nom du document</label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Ex : PPSPS Résidence Acacias"
                className="input text-xs py-1.5 w-full"
                autoFocus
              />
            </div>

            {addMode === 'file' ? (
              <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-200 rounded-lg py-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <Upload size={16} className="text-gray-400" />
                <span className="text-xs text-gray-500">Cliquer pour choisir un fichier</span>
                <span className="text-[10px] text-gray-400">(PDF, Excel, xlsm, Word — max 5MB)</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.xlsx,.xls,.xlsm,.xlsb,.docx,.doc,.pptx,.csv"
                  onChange={handleFileUpload}
                />
              </label>
            ) : (
              <div>
                <label className="text-xs text-gray-500 mb-1 block">URL SharePoint</label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
                  placeholder="https://bouygues.sharepoint.com/..."
                  className="input text-xs py-1.5 w-full"
                />
              </div>
            )}

            <div className="flex gap-2 justify-end mt-4">
              <button
                onClick={() => { setShowAddModal(false); setNewLabel(''); setNewUrl('') }}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                Annuler
              </button>
              {addMode === 'link' && (
                <button
                  onClick={handleAddLink}
                  className="btn-primary text-xs px-3 py-1.5"
                >
                  Ajouter
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---- Modal renommer ---- */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-5 w-72" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Renommer</h3>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && confirmRename()}
              className="input text-xs py-1.5 w-full mb-4"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowRenameModal(null)} className="btn-secondary text-xs px-3 py-1.5">Annuler</button>
              <button onClick={confirmRename} className="btn-primary text-xs px-3 py-1.5">Renommer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}