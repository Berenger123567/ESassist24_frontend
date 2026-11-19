import { ArrowRight, Eye, EyeOff, KeyRound, Mail, Network, ScrollText, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Brand } from '../components/Brand'
import { ApiError } from '../lib/api/client'
import { useSession } from '../features/session/session-context'
import { adminLogin, verifyAdminTotp } from '../features/session/session-api'
import type { AuthTokens } from '../features/session/session-api'
import { isMfaEnrollmentPending } from '../features/session/token-store'

type Stage = 'password' | 'totp'

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return 'La connexion a échoué. Réessayez dans un instant.'
}

function readMfaToken(tokens: AuthTokens): string | null {
  const value = (tokens as unknown as { mfaToken?: unknown }).mfaToken
  return typeof value === 'string' && value.length > 0 ? value : null
}

export function AdminLoginPage() {
  const navigate = useNavigate()
  const { signIn } = useSession()

  const [stage, setStage] = useState<Stage>('password')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [code, setCode] = useState('')
  const [mfaToken, setMfaToken] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function finishAuthentication(tokens: AuthTokens) {
    signIn(tokens)
    navigate(isMfaEnrollmentPending() ? '/app/securite/totp' : '/app', { replace: true })
  }

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!phone.trim() || !password) {
      setError('Renseignez votre numéro et votre mot de passe.')
      return
    }

    setPending(true)
    try {
      const tokens = await adminLogin({ phone: phone.trim(), password })

      if (tokens.mfaRequired) {
        const challenge = readMfaToken(tokens)
        if (!challenge) {
          setError(
            'Le contrat ne transmet pas le jeton de défi MFA attendu par /admin/auth/totp/verify. Connexion interrompue pour ne pas contourner le second facteur.',
          )
          return
        }

        setMfaToken(challenge)
        setStage('totp')
        setCode('')
        return
      }

      finishAuthentication(tokens)
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setPending(false)
    }
  }

  async function handleTotpSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!/^\d{6}$/.test(code)) {
      setError('Le code TOTP comporte exactement 6 chiffres.')
      return
    }

    setPending(true)
    try {
      const tokens = await verifyAdminTotp(mfaToken, code)
      finishAuthentication(tokens)
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <div className="auth-aside__content">
          <Brand to="/connexion" />

          <h1>L’accès au centre de confiance est nominatif.</h1>
          <p className="auth-aside__lead">
            Les décisions de vérification engagent la plateforme. Chaque compte est créé sur
            invitation, protégé par un second facteur et rattaché à une personne identifiée.
          </p>

          <ul className="auth-rules">
            <li>
              <KeyRound size={15} aria-hidden="true" />
              Mot de passe et code TOTP obligatoires à chaque connexion.
            </li>
            <li>
              <Mail size={15} aria-hidden="true" />
              Aucun compte n’est créé par défaut : l’invitation est la seule porte d’entrée.
            </li>
            <li>
              <Network size={15} aria-hidden="true" />
              Accès restreint par adresse IP lorsque la plage est connue.
            </li>
            <li>
              <ScrollText size={15} aria-hidden="true" />
              Consultations de pièces et décisions sont journalisées.
            </li>
          </ul>
        </div>

        <p className="auth-aside__foot">ÉLECTRO ASSIST 24H · Console interne · Cotonou</p>
      </aside>

      <main className="auth-panel">
        <div className="auth-panel__inner">
          <span className="auth-step">Étape 1 · {stage === 'password' ? 'A-01' : 'A-01 · MFA'}</span>

          <h2>{stage === 'password' ? 'Connexion administrateur' : 'Code TOTP'}</h2>

          <p className="auth-panel__lead">
            {stage === 'password'
              ? 'Identifiez-vous avec le numéro rattaché à votre invitation et votre mot de passe.'
              : 'Saisissez le code à 6 chiffres de votre application d’authentification. Le défi expire rapidement.'}
          </p>

          {error ? (
            <div className="form-alert form-alert--error" role="alert">
              {error}
            </div>
          ) : null}

          {stage === 'password' ? (
            <form className="admin-form" onSubmit={handlePasswordSubmit} noValidate>
              <div className="field">
                <label htmlFor="admin-phone">Numéro de téléphone</label>
                <input
                  id="admin-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="username"
                  placeholder="+229 01 97 00 00 00"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  aria-describedby="admin-phone-help"
                  required
                />
                <p className="field__hint" id="admin-phone-help">
                  10 chiffres commençant par 01, indicatif +229 inclus.
                </p>
              </div>

              <div className="field">
                <label htmlFor="admin-password">Mot de passe</label>
                <div className="field-with-action">
                  <input
                    id="admin-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    className="field-action"
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button className="btn btn--primary btn--block" type="submit" disabled={pending}>
                <ShieldCheck size={17} aria-hidden="true" />
                {pending ? 'Vérification…' : 'Continuer'}
              </button>
            </form>
          ) : (
            <form className="admin-form" onSubmit={handleTotpSubmit} noValidate>
              <div className="field">
                <label htmlFor="admin-totp">Code TOTP</label>
                <input
                  id="admin-totp"
                  name="code"
                  className="otp-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoFocus
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                />
                <p className="field__hint">6 chiffres, renouvelés par l’application d’authentification.</p>
              </div>

              <button className="btn btn--primary btn--block" type="submit" disabled={pending}>
                <ShieldCheck size={17} aria-hidden="true" />
                {pending ? 'Vérification…' : 'Ouvrir la session'}
              </button>

              <button
                className="btn btn--quiet btn--block"
                type="button"
                onClick={() => {
                  setStage('password')
                  setCode('')
                  setMfaToken('')
                  setError(null)
                }}
              >
                Revenir au mot de passe
              </button>
            </form>
          )}

          <div className="auth-panel__actions">
            <Link className="btn btn--outline" to="/invitation">
              Activer une invitation
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <p className="auth-panel__note">
            Aucun identifiant de démonstration n’est fourni. Le jeton d’accès reste en mémoire et
            le renouvellement passe par le cookie httpOnly.
          </p>
        </div>
      </main>
    </div>
  )
}
