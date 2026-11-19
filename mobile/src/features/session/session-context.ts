import { createContext, useContext } from 'react'
import type { AuthTokens } from './session-api'

/**
 * Contrat de session — étape 1.
 *
 * Le jeton d'accès vit en mémoire ; le refresh est conservé dans le stockage
 * sécurisé du téléphone. Les rôles viennent exclusivement de l'API.
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
  phone?: string
  isNewUser?: boolean
}

export type SessionStatus = 'loading' | 'anonymous' | 'authenticated'

export interface SessionContextValue {
  status: SessionStatus
  session: Session | null
  signIn: (tokens: AuthTokens, phone?: string) => Promise<void>
  signOut: () => Promise<void>
  markProfileComplete: () => void
}

export const SessionContext = createContext<SessionContextValue | null>(null)

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext)
  if (!value) throw new Error('useSession doit être utilisé dans SessionProvider.')
  return value
}
