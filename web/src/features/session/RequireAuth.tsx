import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from './session-context'

function LoadingScreen() {
  return (
    <div className="upcoming" role="status" aria-live="polite">
      <span>Vérification de la session…</span>
    </div>
  )
}

/**
 * Garde de routes — squelette de l'étape 0.
 * Le contrôle fin par rôle (`CLIENT`, `PROFESSIONAL`, `EVALUATOR`, `ADMIN`)
 * sera ajouté à l'étape 1, en même temps que l'authentification réelle.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useSession()
  const location = useLocation()

  if (status === 'loading') return <LoadingScreen />
  if (status === 'anonymous') {
    return <Navigate to="/connexion" replace state={{ from: location.pathname }} />
  }
  return <>{children}</>
}
