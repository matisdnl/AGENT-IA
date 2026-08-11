export default function StatCards({ stats }) {
  const cards = [
    {
      label: 'Tâches du jour',
      value: stats.tachesJour,
      sub: `${stats.tachesUrgentes} urgentes`,
      color: 'text-primary-600',
    },
    {
      label: 'Mails à valider',
      value: stats.mailsValider,
      sub: 'à traiter / valider',
      color: 'text-primary-600',
    },
    {
      label: 'Docs en attente',
      value: stats.docsAttente,
      sub: 'signature requise',
      color: 'text-primary-600',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="bg-gray-100 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">{card.label}</p>
          <p className={`text-2xl font-semibold ${card.color}`}>{card.value}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{card.sub}</p>
        </div>
      ))}
    </div>
  )
}
