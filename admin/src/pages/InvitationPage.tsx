import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  MailCheck,
  ShieldCheck,
} from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Brand } from '../components/Brand'
import { ApiError } from '../lib/api/client'
import { acceptInvitation } from '../features/session/session-api'
import type { AcceptedInvitation } from '../features/session/session-api'
import { markMfaEnrollmentPending } from '../features/session/token-store'

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return 'L’invitation n’a pas pu être activée. Réessayez dans un instant.'
}

export function InvitationPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accepted, setAccepted] = useState<AcceptedInvitation | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!token) {
      setError('Le lien ne contient aucun jeton d’invitation.')
      return
    }
    if (!password) {
      setError('Choisissez un mot de passe.')
      return
    }
    if (password !== confirmation) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }

    setPending(true)
    try {
      const result = await acceptInvitation({
        token,
        password,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      })
      setAccepted(result)
      markMfaEnrollmentPending()
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

          <h1>Une invitation, un compte, une trace.</h1>
          <p className="auth-aside__lead">
            Le lien d’invitation est à usage unique et expire. Il permet de définir le mot de
            passe, puis d’enrôler l’application d’authentification du nouveau compte.
          </p>

          <ul className="auth-rules">
            <li>
              <MailCheck size={15} aria-hidden="true" />
              L’invitation est émise par un administrateur depuis la console.
            </li>
            <li>
              <KeyRound size={15} aria-hidden="true" />
              Le mot de passe est choisi par la personne invitée, jamais transmis par message.
            </li>
            <li>
              <ShieldCheck size={15} aria-hidden="true" />
              Le TOTP est enrôlé avant l’accès réel aux dossiers.
            </li>
          </ul>
        </div>

        <p className="auth-aside__foot">ÉLECTRO ASSIST 24H · Console interne · Cotonou</p>
      </aside>

      <main className="auth-panel">
        <div className="auth-panel__inner">
          <span className="auth-step">Étape 1 · V-01</span>

          {accepted ? (
            <>
              <h2>Invitation activée</h2>
              <p className="auth-panel__lead">
                Le compte <strong>{accepted.phone}</strong> est créé avec le rôle{' '}
                {accepted.roles.join(', ')}. Le second facteur doit maintenant être enrôlé avant
                l’ouverture de la console.
              </p>

              <div className="form-alert form-alert--info" role="status">
                <CheckCircle2 size={17} aria-hidden="true" />
                Prochaine étape : connexion avec le mot de passe, puis enrôlement TOTP.
              </div>

              <div className="auth-panel__actions">
                <button
                  className="btn btn--primary"
                  type="button"
                  onClick={() => navigate('/connexion', { replace: true })}
                >
                  Se connecter
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
            </>
          ) : (
            <>
              <h2>Activation de l’invitation</h2>
              <p className="auth-panel__lead">
                Définissez votre mot de passe. Les règles de complexité sont appliquées par le
                serveur ; le jeton d’invitation ne peut être utilisé qu’une fois.
              </p>

              {!token ? (
                <div className="form-alert form-alert--error" role="alert">
                  Lien incomplet : le paramètre <code>token</code> est absent. Demandez un nouveau
                  lien à l’administrateur.
                </div>
              ) : null}

              {error ? (
                <div className="form-alert form-alert--error" role="alert">
                  {error}
                </div>
              ) : null}

              <form className="admin-form" onSubmit={handleSubmit} noValidate>
                <div className="field">
                  <label htmlFor="invite-password">Mot de passe</label>
                  <input
                    id="invite-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="invite-confirmation">Confirmer le mot de passe</label>
                  <input
                    id="invite-confirmation"
                    name="confirmation"
                    type="password"
                    autoComplete="new-password"
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                    required
                  />
                </div>

                <div className="field-row">
                  <div className="field">
                    <label htmlFor="invite-first-name">Prénom (facultatif)</label>
                    <input
                      id="invite-first-name"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="invite-last-name">Nom (facultatif)</label>
                    <input
                      id="invite-last-name"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                    />
                  </div>
                </div>

                <button
                  className="btn btn--primary btn--block"
                  type="submit"
                  disabled={pending || !token}
                >
                  <MailCheck size={17} aria-hidden="true" />
                  {pending ? 'Activation…' : 'Activer mon compte'}
                </button>
              </form>
            </>
          )}

          <div className="auth-panel__actions">
            <Link className="btn btn--outline" to="/connexion">
              <ArrowLeft size={16} aria-hidden="true" />
              Retour à la connexion
            </Link>
          </div>

          <p className="auth-panel__note">
            Aucun jeton n’est simulé. Le lien doit provenir de la réponse de création d’invitation.
          </p>
        </div>
      </main>
    </div>
  )
}
