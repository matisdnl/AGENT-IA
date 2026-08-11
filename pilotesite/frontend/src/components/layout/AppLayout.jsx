import { Outlet, Navigate } from 'react-router-dom'
import { useChantier } from '@/hooks/useChantier'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import ChatBar from './ChatBar'
import DocumentModal from '@/components/DocumentModal'

export default function AppLayout() {
  const { chantier } = useChantier()

  // Si aucun chantier sélectionné → redirige vers la sélection
  if (!chantier) {
    return <Navigate to="/chantiers" replace />
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar gauche fixe */}
      <Sidebar />

      {/* Zone principale */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />

        {/* Contenu de la page courante */}
        <main className="flex-1 overflow-y-auto p-5">
          <Outlet />
        </main>

        {/* Barre de chat IA en bas */}
        <ChatBar />
      </div>

      {/* Modal document — superposition globale */}
      <DocumentModal />
    </div>
  )
}
