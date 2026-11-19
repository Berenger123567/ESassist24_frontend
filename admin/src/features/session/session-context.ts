import { createContext, useContext } from 'react'
import type { AuthTokens } from './session-api'

/**
 * Session de la console — étape 1.
 * Le contrôle d'accès final reste côté serveur ; le client n'invente aucun rôle.
 */

export type RoleCode = 'CLIENT' | 'PROFESSIONAL' | 'EVALUATOR' | 'ADMIN'

export interface SessionUser {
  id: string
  roles: RoleCode[]
}

export interface Session {
  user: SessionUser
  accessToken: string
  expiresAt: number
  isNewUser?: boolean
}

export type SessionStatus = 'loading' | 'anonymous' | 'authenticated'

export interface SessionContextValue {
  status: SessionStatus
  session: Session | null
  signIn: (tokens: AuthTokens) => void
  signOut: () => Promise<void>
}

export const SessionContext = createContext<SessionContextValue | null>(null)

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext)
  if (!value) throw new Error('useSession doit être utilisé dans SessionProvider.')
  return value
}
