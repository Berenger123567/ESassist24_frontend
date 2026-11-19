import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './components/AdminLayout'
import { RequireAuth } from './features/session/RequireAuth'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { ConsolePage } from './pages/ConsolePage'
import { InvitationPage } from './pages/InvitationPage'
import { InvitationsPage } from './pages/InvitationsPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { TotpEnrollmentPage } from './pages/TotpEnrollmentPage'

/**
 * Navigation de la console — étape 1 et 2.
 * A-01 : connexion ; V-01 : activation invitation ; TOTP : enrôlement.
 * /app/invitations : gestion des invitations (étape 2).
 */
export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/connexion" replace />} />
      <Route path="/connexion" element={<AdminLoginPage />} />
      <Route path="/invitation" element={<InvitationPage />} />

      <Route
        path="/app/securite/totp"
        element={
          <RequireAuth>
            <TotpEnrollmentPage />
          </RequireAuth>
        }
      />

      <Route
        path="/app"
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<ConsolePage />} />
        <Route path="invitations" element={<InvitationsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
