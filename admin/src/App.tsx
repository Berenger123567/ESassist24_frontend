import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './components/AdminLayout'
import { RequireAuth } from './features/session/RequireAuth'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { AuditLogsPage } from './pages/AuditLogsPage'
import { ConsolePage } from './pages/ConsolePage'
import { InvitationPage } from './pages/InvitationPage'
import { InvitationsPage } from './pages/InvitationsPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { TotpEnrollmentPage } from './pages/TotpEnrollmentPage'
import { VerificationDetailPage } from './pages/VerificationDetailPage'
import { VerificationsPage } from './pages/VerificationsPage'

/**
 * Navigation de la console — étapes 1, 2 et 3.
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
        <Route path="verifications" element={<VerificationsPage />} />
        <Route path="verifications/:id" element={<VerificationDetailPage />} />
        <Route path="audit" element={<AuditLogsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
