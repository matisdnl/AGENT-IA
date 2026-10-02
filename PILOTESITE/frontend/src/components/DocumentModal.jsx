import { X, CheckCircle, MessageSquare, Printer } from 'lucide-react'
import { useDocument } from '@/hooks/useDocument'
import { useChantier } from '@/hooks/useChantier'
import { useState } from 'react'

export default function DocumentModal() {
  const { activeDocument, closeDocument } = useDocument()
  const { chantierId } = useChantier()
  const [saved, setSaved] = useState(false)

  if (!activeDocument) return null

  function handleValidate() {
    if (activeDocument.stId) {
      const key = `st_docs_${chantierId}`
      const data = JSON.parse(localStorage.getItem(key) || '{"sts":[]}')
      const idx = data.sts.findIndex(s => s.id === activeDocument.stId)
      if (idx !== -1) {
        if (!data.sts[idx].avenants) data.sts[idx].avenants = []
        data.sts[idx].avenants.push({
          id: Date.now().toString(),
          titre: activeDocument.title,
          html: activeDocument.html,
          dateCreation: new Date().toISOString().slice(0, 10),
        })
        localStorage.setItem(key, JSON.stringify(data))
      }
    }
    setSaved(true)
    setTimeout(() => { setSaved(false); closeDocument() }, 1200)
  }

  function handlePrint() {
    const win = window.open('', '_blank')
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${activeDocument.title}</title></head><body>${activeDocument.html}</body></html>`)
    win.document.close()
    win.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col w-full max-w-3xl max-h-[90vh] border border-gray-100">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">{activeDocument.title}</h2>
            {activeDocument.stNom && (
              <p className="text-xs text-gray-400 mt-0.5">ST : {activeDocument.stNom}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="Imprimer"
            >
              <Printer size={14} />
            </button>
            <button
              onClick={closeDocument}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Fermer"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Document scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div
            className="p-2"
            dangerouslySetInnerHTML={{ __html: activeDocument.html }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 flex-shrink-0 bg-gray-50 rounded-b-2xl">
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <MessageSquare size={12} />
            Modifiable via le chat — demande une correction ci-dessous
          </p>
          <div className="flex gap-2">
            <button
              onClick={closeDocument}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              Fermer
            </button>
            <button
              onClick={handleValidate}
              disabled={saved}
              className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5 disabled:opacity-60"
            >
              <CheckCircle size={12} />
              {saved ? 'Enregistré !' : 'Valider & stocker'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
