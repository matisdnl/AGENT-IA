import { useState } from 'react'
import { sendChatMessage } from '@/services/api'
import { useChantier } from '@/hooks/useChantier'
import { useDocument } from '@/hooks/useDocument'

export default function ChatBar() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastResponse, setLastResponse] = useState(null)
  const { chantierId } = useChantier()
  const { openDocument, activeDocument } = useDocument()

  async function handleSend() {
    if (!message.trim() || loading) return
    const text = message.trim()
    setMessage('')
    setLoading(true)
    setLastResponse(null)

    // STs du chantier pour l'agent
    const stRaw = localStorage.getItem(`st_docs_${chantierId}`)
    const stList = stRaw ? (JSON.parse(stRaw).sts || []) : []

    // Si un document est ouvert → contexte de modification
    const currentDoc = activeDocument
      ? { html: activeDocument.html, stId: activeDocument.stId, stNom: activeDocument.stNom }
      : null

    try {
      const data = await sendChatMessage(text, chantierId, stList, currentDoc)
      setLastResponse(data.response || "Message transmis à l'agent.")

      if (data.document) {
        openDocument(data.document)
      }
    } catch {
      setLastResponse("Erreur : impossible de contacter l'agent.")
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const placeholder = activeDocument
    ? `Modifier "${activeDocument.title}" — décris les corrections…`
    : "Dis à l'agent de modifier une tâche, générer un avenant ST, ou rajouter une info…"

  return (
    <div className="bg-white border-t border-gray-100 px-5 py-3">
      {/* Réponse de l'agent */}
      {lastResponse && (
        <div className="mb-2 px-3 py-2 bg-primary-50 border border-primary-100 rounded-lg text-xs text-primary-800">
          <span className="font-medium">Agent IA :</span> {lastResponse}
        </div>
      )}

      {/* Indicateur document actif */}
      {activeDocument && (
        <div className="mb-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 animate-pulse" />
          <span className="font-medium">{activeDocument.title}</span> est ouvert — décris tes modifications dans le chat
        </div>
      )}

      {/* Barre de saisie */}
      <div className="flex items-center gap-2">
        <span className="text-base text-gray-400">💬</span>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="input flex-1 text-sm py-1.5"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !message.trim()}
          className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? '...' : '↑'}
        </button>
      </div>
    </div>
  )
}
