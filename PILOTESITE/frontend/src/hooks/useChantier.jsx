import { createContext, useContext, useState } from 'react'

// Liste des chantiers (sera chargée depuis le backend plus tard)
export const CHANTIERS = [
  {
    id: 'acacias',
    nom: 'Résidence Les Acacias',
    ville: 'Bordeaux (33)',
    lot: 'Logements collectifs R+4',
    phase: 'Gros œuvre — Phase 2',
    couleur: '#185FA5',
  },
  {
    id: 'merignac',
    nom: 'Extension Centre Commercial',
    ville: 'Mérignac (33)',
    lot: 'Commerces / Bureaux',
    phase: 'Second œuvre — Phase 1',
    couleur: '#0F6E56',
  },
]

const ChantierContext = createContext(null)

export function ChantierProvider({ children }) {
  // Lit le chantier sauvegardé dans localStorage (persiste entre sessions)
  const [chantierId, setChantierId] = useState(
    () => localStorage.getItem('chantierId') || null
  )

  const chantier = CHANTIERS.find((c) => c.id === chantierId) || null

  function selectChantier(id) {
    localStorage.setItem('chantierId', id)
    setChantierId(id)
  }

  function clearChantier() {
    localStorage.removeItem('chantierId')
    setChantierId(null)
  }

  return (
    <ChantierContext.Provider value={{ chantier, chantierId, selectChantier, clearChantier, CHANTIERS }}>
      {children}
    </ChantierContext.Provider>
  )
}

// Hook à importer dans n'importe quel composant
export function useChantier() {
  const ctx = useContext(ChantierContext)
  if (!ctx) throw new Error('useChantier doit être utilisé dans ChantierProvider')
  return ctx
}
