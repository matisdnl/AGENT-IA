import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import DashboardPage from '@/pages/DashboardPage'
import TasksPage from '@/pages/TasksPage'
import MailsPage from '@/pages/MailsPage'
import PlanningPage from '@/pages/PlanningPage'
import DocumentsSTPage from '@/pages/DocumentsSTPage'
import SelectChantierPage from '@/pages/SelectChantierPage'
import { ChantierProvider } from '@/hooks/useChantier'
import { DocumentProvider } from '@/hooks/useDocument'

export default function App() {
  return (
    <ChantierProvider>
    <DocumentProvider>
      <BrowserRouter>
        <Routes>
          {/* Page de sélection du chantier (entrée de l'app) */}
          <Route path="/chantiers" element={<SelectChantierPage />} />

          {/* Pages principales avec sidebar */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="taches" element={<TasksPage />} />
            <Route path="mails" element={<MailsPage />} />
            <Route path="planning" element={<PlanningPage />} />
            <Route path="documents" element={<DocumentsSTPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/chantiers" replace />} />
        </Routes>
      </BrowserRouter>
    </DocumentProvider>
    </ChantierProvider>
  )
}
