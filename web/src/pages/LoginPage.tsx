import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Info,
  KeyRound,
  MessageCircle,
  MessageSquare,
  ShieldCheck,
  Smartphone,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../lib/api/client'
import { useSession } from '../features/session/session-context'
import { requestOtp, verifyOtp } from '../features/session/session-api'
import type { OtpChannel } from '../features/session/session-api'

type Step = 'phone' | 'code'

const CHANNELS: { value: OtpChannel; label: string; icon: typeof MessageCircle }[] = [
  { value: 'WHATSAPP', label: 'WhatsApp', icon: MessageCircle },
  { value: 'SMS', label: 'SMS', icon: MessageSquare },
]

function normalizePhone(raw: string): string {
  const compact = raw.replace(/[\s.\-()]/g, '')

  if (compact.startsWith('00229')) return `+229${compact.slice(5)}`
  if (/^01\d{8}$/.test(compact)) return `+229${compact}`
  return compact
}

function isBeninPhone(value: string): boolean {
  // Bénin : 10 chiffres commençant par 01, précédés de l'indicatif +229.
  return /^\+22901\d{8}$/.test(value)
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return 'Une erreur inattendue est survenue. Réessayez dans un instant.'
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useSession()

  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [channel, setChannel] = useState<OtpChannel>('WHATSAPP')
  const [code, setCode] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [resendIn, setResendIn] = useState(0)
  const [expiresIn, setExpiresIn] = useState(0)
  const codeInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (step !== 'code') return

    const timer = window.setInterval(() => {
      setResendIn((value) => Math.max(0, value - 1))
      setExpiresIn((value) => Math.max(0, value - 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [step])

  useEffect(() => {
    if (step === 'code') codeInput.current?.focus()
  }, [step])

  const channelLabel = channel === 'WHATSAPP' ? 'WhatsApp' : 'SMS'

  async function sendCode(targetPhone: string) {
    const result = await requestOtp(targetPhone, channel)
    setResendIn(result.resendAfterSeconds ?? result.retryAfterSeconds ?? 60)
    setExpiresIn(result.expiresInSeconds ?? 300)
    setStep('code')
    setCode('')
    setNotice(
      `Si ce numéro peut être utilisé, un code à 6 chiffres vient d’être envoyé par ${channelLabel}. Il est valable quelques minutes.`,
    )
  }

  async function handlePhoneSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setNotice(null)

    const normalized = normalizePhone(phone)
    if (!isBeninPhone(normalized)) {
      setError(
        'Saisissez un numéro béninois à 10 chiffres commençant par 01, par exemple +229 01 97 00 00 00.',
      )
      return
    }

    setPending(true)
    try {
      setPhone(normalized)
      await sendCode(normalized)
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setPending(false)
    }
  }

  async function handleCodeSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!/^\d{6}$/.test(code)) {
      setError('Le code comporte exactement 6 chiffres.')
      return
    }

    setPending(true)
    try {
      const tokens = await verifyOtp(phone, code)
      signIn(tokens, phone)

      const from = (location.state as { from?: string } | null)?.from
      const destination = tokens.isNewUser
        ? '/connexion/profil'
        : from?.startsWith('/app')
          ? from
          : '/app'

      navigate(destination, { replace: true })
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setPending(false)
    }
  }

  async function handleResend() {
    setError(null)
    setPending(true)
    try {
      await sendCode(phone)
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setPending(false)
    }
  }

  const expired = step === 'code' && expiresIn === 0

  return (
    <div className="auth-page">
      <section className="auth-panel" aria-labelledby="login-title">
        <div className="auth-panel__meta">
          <span className="auth-step">
            Étape 1 · {step === 'phone' ? 'C-01' : 'C-02'}
          </span>
          <span className="auth-progress">Accès client · {step === 'phone' ? '1' : '2'} / 3</span>
        </div>

        <h1 id="login-title">
          {step === 'phone' ? 'Se connecter' : 'Vérifier le code'}
        </h1>

        <p className="auth-panel__lead">
          {step === 'phone'
            ? 'Un code à 6 chiffres confirme votre numéro. Aucun mot de passe n’est demandé au client.'
            : `Code envoyé au ${phone} par ${channelLabel}. Saisissez les 6 chiffres reçus pour ouvrir votre session.`}
        </p>

        {error ? (
          <div className="auth-alert auth-alert--error" role="alert">
            <AlertCircle size={20} aria-hidden="true" />
            <span>{error}</span>
          </div>
        ) : null}

        {notice && !error ? (
          <div className="auth-alert auth-alert--info" role="status">
            <Info size={20} aria-hidden="true" />
            <span>{notice}</span>
          </div>
        ) : null}

        {step === 'phone' ? (
          <form className="auth-form" onSubmit={handlePhoneSubmit} noValidate>
            <div className="field">
              <label htmlFor="phone">Numéro de téléphone</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+229 01 97 00 00 00"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                aria-describedby="phone-help"
                autoFocus
                required
              />
              <p className="field__hint" id="phone-help">
                10 chiffres commençant par 01, indicatif +229 inclus. Le numéro complet
                n’apparaît jamais dans les journaux.
              </p>
            </div>

            <fieldset className="channel">
              <legend>Canal d’envoi du code</legend>
              <div className="channel__options">
                {CHANNELS.map(({ value, label, icon: Icon }) => (
                  <label
                    key={value}
                    className={
                      channel === value ? 'channel__option channel__option--active' : 'channel__option'
                    }
                  >
                    <input
                      type="radio"
                      name="channel"
                      value={value}
                      checked={channel === value}
                      onChange={() => setChannel(value)}
                    />
                    <Icon size={20} aria-hidden="true" />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <p className="field__hint">
                WhatsApp est proposé par défaut. Le SMS reste disponible si WhatsApp n’est pas
                installé sur le téléphone.
              </p>
            </fieldset>

            <div className="auth-actions">
              <button className="btn btn--primary" type="submit" disabled={pending}>
                <Smartphone size={17} aria-hidden="true" />
                {pending ? 'Envoi en cours…' : 'Recevoir le code'}
              </button>
            </div>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleCodeSubmit} noValidate>
            <div className="field">
              <label htmlFor="code">Code à 6 chiffres</label>
              <input
                ref={codeInput}
                id="code"
                name="code"
                className="otp-input"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                aria-describedby="code-help"
                required
              />
              <p className="field__hint" id="code-help">
                {expired
                  ? 'Ce code a expiré. Demandez-en un nouveau.'
                  : `Valable encore ${Math.floor(expiresIn / 60)} min ${String(expiresIn % 60).padStart(2, '0')} s · 3 tentatives maximum.`}
              </p>
            </div>

            <div className="auth-actions">
              <button
                className="btn btn--primary"
                type="submit"
                disabled={pending || expired}
              >
                <KeyRound size={17} aria-hidden="true" />
                {pending ? 'Vérification…' : 'Valider le code'}
              </button>

              <button
                className="btn btn--outline"
                type="button"
                onClick={handleResend}
                disabled={pending || resendIn > 0}
              >
                {resendIn > 0 ? `Renvoyer le code (${resendIn} s)` : 'Renvoyer le code'}
              </button>
            </div>

            <button
              className="auth-link"
              type="button"
              onClick={() => {
                setStep('phone')
                setError(null)
                setNotice(null)
              }}
            >
              <ArrowLeft size={15} aria-hidden="true" />
              Modifier le numéro
            </button>
          </form>
        )}

        <div className="auth-divider" />

        <ul className="auth-facts">
          <li>
            <ShieldCheck size={16} aria-hidden="true" />
            Session courte, renouvellement par cookie httpOnly à rotation.
          </li>
          <li>
            <KeyRound size={16} aria-hidden="true" />
            Trois tentatives par code, sans révéler si un compte existe.
          </li>
        </ul>

        <p className="auth-note">
          Décision produit : SMS et WhatsApp sont disponibles, WhatsApp par défaut. Le numéro
          béninois comporte 10 chiffres commençant par 01, précédés de l’indicatif +229. Le
          formulaire transmet le canal choisi au serveur et n’invente aucune règle.
        </p>

        <button className="btn btn--quiet" type="button" onClick={() => navigate('/')}>
          Retour à l’accueil
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </section>
    </div>
  )
}
