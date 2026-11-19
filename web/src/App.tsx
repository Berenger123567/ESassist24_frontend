import { Route, Routes } from 'react-router-dom'
import { SiteLayout } from './components/SiteLayout'
import { RequireAuth } from './features/session/RequireAuth'
import { AppHomePage } from './pages/AppHomePage'
import { DossierPage } from './pages/DossierPage'
import { DocumentsPage } from './pages/DocumentsPage'
import { ProfilProPage } from './pages/ProfilProPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProfileSetupPage } from './pages/ProfileSetupPage'

/**
 * Navigation de l'étape 1.
 * C-01/C-02 : /connexion ; C-03 : /connexion/profil ; espace : /app.
 * Étape 2 : /app/dossier, /app/dossier/profil, /app/dossier/documents.
 */
export function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/connexion" element={<LoginPage />} />
        <Route
          path="/connexion/profil"
          element={
            <RequireAuth>
              <ProfileSetupPage />
            </RequireAuth>
          }
        />
        <Route
          path="/app"
          element={
            <RequireAuth>
              <AppHomePage />
            </RequireAuth>
          }
        />
        <Route
          path="/app/dossier"
          element={
            <RequireAuth>
              <DossierPage />
            </RequireAuth>
          }
        />
        <Route
          path="/app/dossier/profil"
          element={
            <RequireAuth>
              <ProfilProPage />
            </RequireAuth>
          }
        />
        <Route
          path="/app/dossier/documents"
          element={
            <RequireAuth>
              <DocumentsPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
