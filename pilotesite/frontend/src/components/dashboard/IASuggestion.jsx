export default function IASuggestion({ taches }) {
  const suggestion = taches.find(
    (t) =>
      t.properties?.Priorité?.select?.name === 'URGENTE' &&
      t.properties?.Catégorie?.select?.name === 'PLANNING'
  )

  if (!suggestion) return null

  const titre = suggestion.properties?.Titre?.title?.[0]?.plain_text || ''

  return (
    <div className="card border-l-2 border-orange-400 rounded-l-none">
      <div className="flex items-start gap-2 mb-2">
        <span className="text-base">💡</span>
        <p className="text-xs font-semibold text-gray-800">Suggestion IA</p>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">
        Action urgente détectée :{' '}
        <span className="font-medium text-gray-700">{titre}</span>.
        Je peux recaler les intervenants et envoyer les notifications.
      </p>
      <button className="btn-primary text-xs mt-3 w-full justify-center">
        Appliquer →
      </button>
    </div>
  )
}
