import { CheckCircle2, Copy, KeyRound, ShieldCheck, Smartphone } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../lib/api/client'
import { useSession } from '../features/session/session-context'
import { activateTotp, enrollTotp } from '../features/session/session-api'
import type { TotpEnrollment } from '../features/session/session-api'
import { clearMfaEnrollmentPending } from '../features/session/token-store'

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return 'Le second facteur n’a pas pu être configuré. Réessayez dans un instant.'
}

export function TotpEnrollmentPage() {
  const navigate = useNavigate()
  const { signOut } = useSession()

  const [enrollment, setEnrollment] = useState<TotpEnrollment | null>(null)
  const [code, setCode] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enabled, setEnabled] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleEnroll() {
    setError(null)
    setPending(true)
    try {
      const result = await enrollTotp()
      setEnrollment(result)
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setPending(false)
    }
  }

  async function handleActivate(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!/^\d{6}$/.test(code)) {
      setError('Le code TOTP comporte exactement 6 chiffres.')
      return
    }

    setPending(true)
    try {
      await activateTotp(code)
      clearMfaEnrollmentPending()
      setEnabled(true)
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setPending(false)
    }
  }

  async function copySecret() {
    if (!enrollment) return
    try {
      await navigator.clipboard.writeText(enrollment.secret)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-panel--center" aria-labelledby="totp-title">
        <span className="auth-step">Étape 1 · Second facteur</span>

        {enabled ? (
          <>
            <h2 id="totp-title">Second facteur activé</h2>
            <p className="auth-panel__lead">
              Le code TOTP est désormais exigé à chaque connexion. Conservez l’application
              d’authentification associée à ce compte.
            </p>

            <div className="form-alert form-alert--success" role="status">
              <CheckCircle2 size={17} aria-hidden="true" />
              Le compte est protégé par mot de passe et code TOTP.
            </div>

            <div className="auth-panel__actions">
              <button
                className="btn btn--primary"
                type="button"
                onClick={() => navigate('/app', { replace: true })}
              >
                Ouvrir la console
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 id="totp-title">Enrôler le second facteur</h2>
            <p className="auth-panel__lead">
              L’accès à la console exige un code TOTP en plus du mot de passe. Le secret est généré
              par le serveur pour le compte connecté ; il n’est affiché qu’une fois.
            </p>

            {error ? (
              <div className="form-alert form-alert--error" role="alert">
                {error}
              </div>
            ) : null}

            {!enrollment ? (
              <>
                <ul className="auth-panel__list">
                  <li>
                    <Smartphone size={14} aria-hidden="true" />
                    Installez une application d’authentification compatible TOTP.
                  </li>
                  <li>
                    <KeyRound size={14} aria-hidden="true" />
                    Générez le secret, puis scannez le QR code ou saisissez la clé.
                  </li>
                  <li>
                    <ShieldCheck size={14} aria-hidden="true" />
                    Validez avec un premier code pour activer le second facteur.
                  </li>
                </ul>

                <div className="auth-panel__actions">
                  <button
                    className="btn btn--primary"
                    type="button"
                    onClick={handleEnroll}
                    disabled={pending}
                  >
                    {pending ? 'Génération…' : 'Générer mon secret TOTP'}
                  </button>

                  <button
                    className="btn btn--quiet"
                    type="button"
                    onClick={signOut}
                  >
                    Se déconnecter
                  </button>
                </div>
              </>
            ) : (
              <div className="totp-setup">
                <div className="totp-qr">
                  <QRCodeSVG value={enrollment.uri} size={172} bgColor="#ffffff" fgColor="#071a33" />
                </div>

                <div className="totp-secret">
                  <span>Clé manuelle</span>
                  <code>{enrollment.secret}</code>
                  <button className="btn btn--quiet" type="button" onClick={copySecret}>
                    <Copy size={15} aria-hidden="true" />
                    {copied ? 'Clé copiée' : 'Copier la clé'}
                  </button>
                </div>

                <form className="admin-form" onSubmit={handleActivate} noValidate>
                  <div className="field">
                    <label htmlFor="totp-code">Premier code TOTP</label>
                    <input
                      id="totp-code"
                      name="code"
                      className="otp-input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={code}
                      onChange={(event) =>
                        setCode(event.target.value.replace(/\D/g, '').slice(0, 6))
                      }
                      required
                    />
                  </div>

                  <button
                    className="btn btn--primary btn--block"
                    type="submit"
                    disabled={pending}
                  >
                    <ShieldCheck size={17} aria-hidden="true" />
                    {pending ? 'Activation…' : 'Activer le second facteur'}
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
