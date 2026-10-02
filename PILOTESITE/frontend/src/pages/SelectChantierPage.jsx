import { useNavigate } from 'react-router-dom'
import { useChantier } from '@/hooks/useChantier'

export default function SelectChantierPage() {
  const { CHANTIERS, selectChantier } = useChantier()
  const navigate = useNavigate()

  function handleSelect(id) {
    selectChantier(id)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">

      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
          <span className="text-white text-base font-bold">PS</span>
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">PiloteSite</h1>
          <p className="text-xs text-gray-500">Assistant IA · Conducteur de Travaux</p>
        </div>
      </div>

      <div className="w-full max-w-md">
        <h2 className="text-sm font-medium text-gray-700 mb-4 text-center">
          Sélectionne ton chantier pour commencer
        </h2>

        <div className="flex flex-col gap-3">
          {CHANTIERS.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelect(c.id)}
              className="card hover:shadow-md hover:border-primary-100 transition-all text-left group"
            >
              <div className="flex items-start gap-3">
                {/* Indicateur couleur */}
                <div
                  className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: c.couleur }}
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {c.nom}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.ville} · {c.lot}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{c.phase}</p>
                </div>
                <span className="text-gray-300 group-hover:text-primary-400 transition-colors text-lg">→</span>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Bouygues Construction · BTP
        </p>
      </div>
    </div>
  )
}
