import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { SessionContext } from './session-context'
import type { RoleCode, Session, SessionContextValue, SessionStatus } from './session-context'
import { logoutSession, refreshSession } from './session-api'
import type { AuthTokens } from './session-api'
import {
  clearStoredAuth,
  getCsrfToken,
  setAccessToken,
  setCsrfToken,
} from './token-store'

const ROLES: RoleCode[] = ['CLIENT', 'PROFESSIONAL', 'EVALUATOR', 'ADMIN']

function toRoles(values: string[]): RoleCode[] {
  return values.filter((value): value is RoleCode => ROLES.includes(value as RoleCode))
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>(() =>
    getCsrfToken() ? 'loading' : 'anonymous',
  )
  const [session, setSession] = useState<Session | null>(null)
  const restoreStarted = useRef(false)

  const clearSession = useCallback(() => {
    clearStoredAuth()
    setSession(null)
    setStatus('anonymous')
  }, [])

  const applyTokens = useCallback((tokens: AuthTokens, phone?: string) => {
    setAccessToken(tokens.accessToken)
    if (tokens.csrfToken) setCsrfToken(tokens.csrfToken)

    setSession({
      user: { id: tokens.user.id, roles: toRoles(tokens.user.roles) },
      accessToken: tokens.accessToken,
      expiresAt: Date.now() + tokens.expiresIn * 1000,
      phone,
      isNewUser: tokens.isNewUser,
    })
    setStatus('authenticated')
  }, [])

  const signIn = useCallback(
    (tokens: AuthTokens, phone?: string) => applyTokens(tokens, phone),
    [applyTokens],
  )

  const signOut = useCallback(async () => {
    try {
      await logoutSession()
    } catch {
      // Le serveur peut déjà avoir révoqué la session : on nettoie localement.
    } finally {
      clearSession()
    }
  }, [clearSession])

  // Restauration après rechargement : le cookie httpOnly + le CSRF permettent
  // de renouveler le jeton d'accès sans jamais le persister.
  useEffect(() => {
    if (restoreStarted.current) return
    restoreStarted.current = true

    if (!getCsrfToken()) {
      return
    }

    refreshSession()
      .then((tokens) => applyTokens(tokens))
      .catch(() => clearSession())
  }, [applyTokens, clearSession])

  // Renouvellement anticipé du jeton d'accès (une minute avant expiration).
  useEffect(() => {
    if (!session) return

    const delay = Math.max(30_000, session.expiresAt - Date.now() - 60_000)
    const timer = window.setTimeout(() => {
      refreshSession()
        .then((tokens) => applyTokens(tokens, session.phone))
        .catch(() => clearSession())
    }, delay)

    return () => window.clearTimeout(timer)
  }, [session, applyTokens, clearSession])

  const value = useMemo<SessionContextValue>(
    () => ({ status, session, signIn, signOut }),
    [status, session, signIn, signOut],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
