import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { SessionContext } from './session-context'
import type { RoleCode, Session, SessionContextValue, SessionStatus } from './session-context'
import { logoutSession, refreshSession } from './session-api'
import type { AuthTokens } from './session-api'
import {
  clearStoredAuth,
  getStoredRefreshToken,
  setAccessToken,
  setStoredCsrfToken,
  setStoredRefreshToken,
} from './token-store'

const ROLES: RoleCode[] = ['CLIENT', 'PROFESSIONAL', 'EVALUATOR', 'ADMIN']

function toRoles(values: string[]): RoleCode[] {
  return values.filter((value): value is RoleCode => ROLES.includes(value as RoleCode))
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('loading')
  const [session, setSession] = useState<Session | null>(null)
  const restoreStarted = useRef(false)

  const clearSession = useCallback(async () => {
    await clearStoredAuth()
    setSession(null)
    setStatus('anonymous')
  }, [])

  const applyTokens = useCallback(async (tokens: AuthTokens, phone?: string) => {
    setAccessToken(tokens.accessToken)
    if (tokens.refreshToken) await setStoredRefreshToken(tokens.refreshToken)
    if (tokens.csrfToken) await setStoredCsrfToken(tokens.csrfToken)

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
    async (tokens: AuthTokens, phone?: string) => {
      await applyTokens(tokens, phone)
    },
    [applyTokens],
  )

  const signOut = useCallback(async () => {
    try {
      await logoutSession()
    } catch {
      // Session peut déjà être révoquée : on nettoie localement.
    } finally {
      await clearSession()
    }
  }, [clearSession])

  const markProfileComplete = useCallback(() => {
    setSession((current) => (current ? { ...current, isNewUser: false } : current))
  }, [])

  // Restauration au lancement : le jeton de rafraîchissement est lu dans le
  // stockage sécurisé, puis échangé contre un nouveau jeton d'accès.
  useEffect(() => {
    if (restoreStarted.current) return
    restoreStarted.current = true

    let active = true

    getStoredRefreshToken()
      .then((stored) => {
        if (!active) return
        if (!stored) {
          setStatus('anonymous')
          return
        }

        return refreshSession()
          .then((tokens) => {
            if (active) return applyTokens(tokens)
          })
          .catch(() => {
            if (active) return clearSession()
          })
      })
      .catch(() => {
        if (active) setStatus('anonymous')
      })

    return () => {
      active = false
    }
  }, [applyTokens, clearSession])

  // Renouvellement anticipé, une minute avant l'expiration.
  useEffect(() => {
    if (!session) return

    const phone = session.phone
    const delay = Math.max(30_000, session.expiresAt - Date.now() - 60_000)
    const timer = setTimeout(() => {
      refreshSession()
        .then((tokens) => applyTokens(tokens, phone))
        .catch(() => clearSession())
    }, delay)

    return () => clearTimeout(timer)
  }, [session, applyTokens, clearSession])

  const value = useMemo<SessionContextValue>(
    () => ({ status, session, signIn, signOut, markProfileComplete }),
    [status, session, signIn, signOut, markProfileComplete],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
