import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Copy,
  MailCheck,
  Plus,
  UserCog,
  XCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { ApiError } from '../lib/api/client'
import {
  createInvitation,
  listInvitations,
} from '../features/session/session-api'
import type { AdminInvitation, CreatedInvitation, InvitationRole } from '../features/session/session-api'

function statusMeta(status: string): { label: string; tone: string } {
  const map: Record<string, { label: string; tone: string }> = {
    PENDING: { label: 'En attente', tone: 'pending' },
    ACCEPTED: { label: 'Accept\u00e9e', tone: 'accepted' },
    EXPIRED: { label: 'Expir\u00e9e', tone: 'expired' },
    REVOKED: { label: 'R\u00e9voqu\u00e9e', tone: 'revoked' },
  }
  return map[status] ?? { label: status, tone: 'pending' }
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function normalizePhone(raw: string): string {
  const compact = raw.replace(/[\s.\-()]/g, '')
  if (compact.startsWith('00229')) return `+229${compact.slice(5)}`
  if (/^01\d{8}$/.test(compact)) return `+229${compact}`
  return compact
}

export function InvitationsPage() {
  const [invitations, setInvitations] = useState<AdminInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Formulaire
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<InvitationRole>('EVALUATOR')
  const [email, setEmail] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [created, setCreated] = useState<CreatedInvitation | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let active = true
    listInvitations()
      .then((data) => { if (active) setInvitations(data) })
      .catch((cause) => {
        if (active)
          setError(
            cause instanceof ApiError
              ? cause.message
              : 'La liste n\u2019a pas pu \u00eatre charg\u00e9e.',
          )
      })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [])

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    setCreateError(null)
    setCreated(null)

    const normalized = normalizePhone(phone)
    if (!/^\+229\d{10}$/.test(normalized)) {
      setCreateError(
        'Num\u00e9ro b\u00e9ninois invalide. Exemple\u00a0: +229\u00a001\u00a097\u00a000\u00a000\u00a000.',
      )
      return
    }

    setCreating(true)
    try {
      const result = await createInvitation({
        phone: normalized,
        role,
        email: email.trim() || undefined,
      })
      setCreated(result)
      setPhone('')
      setEmail('')
      // Rafra\u00eecht la liste
      const updated = await listInvitations()
      setInvitations(updated)
    } catch (cause) {
      setCreateError(
        cause instanceof ApiError
          ? cause.message
          : 'L\u2019invitation n\u2019a pas pu \u00eatre cr\u00e9\u00e9e.',
      )
    } finally {
      setCreating(false)
    }
  }

  async function handleCopy(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard non disponible, ne rien faire
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <p className="page-head__kicker">Organisaton \u00b7 \u00e9tape 1</p>
          <h1>Invitations</h1>
          <p className="page-head__lead">
            Cr\u00e9ez une invitation pour ajouter un administrateur ou un \u00e9valuateur. Le lien est
            \u00e0 usage unique et expire apr\u00e8s 72\u00a0h. Aucun compte n\u2019est cr\u00e9\u00e9 avant activation.
          </p>
        </div>
        <div className="page-head__meta">
          POST /admin/invitations
          <br />
          GET /admin/invitations
        </div>
      </div>

      {/* Formulaire de cr\u00e9ation */}
      <section className="panel" style={{ marginTop: 26 }} aria-labelledby="create-title">
        <div className="panel__head">
          <h2 id="create-title">
            <Plus size={15} aria-hidden="true" />
            Nouvelle invitation
          </h2>
        </div>
        <div className="panel__body">
          {createError ? (
            <div className="form-alert form-alert--error" role="alert">
              <AlertCircle size={17} aria-hidden="true" />
              {createError}
            </div>
          ) : null}

          {created ? (
            <div className="form-alert form-alert--success" role="status">
              <CheckCircle2 size={17} aria-hidden="true" />
              <div>
                <strong>Invitation cr\u00e9\u00e9e pour {created.phone}</strong>
                <p style={{ marginTop: 6, fontSize: 'var(--text-xs)', lineHeight: 1.6 }}>
                  Transmettez ce lien une seule fois. Il expire le{' '}
                  {formatDate(created.expiresAt)}.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <code style={{ flex: 1, fontSize: 11, wordBreak: 'break-all' }}>
                    {created.inviteUrl}
                  </code>
                  <button
                    type="button"
                    className="btn btn--outline"
                    style={{ minHeight: 32, padding: '4px 10px', fontSize: 'var(--text-xs)' }}
                    onClick={() => void handleCopy(created.inviteUrl)}
                  >
                    <Copy size={13} aria-hidden="true" />
                    {copied ? 'Copi\u00e9\u00a0!' : 'Copier'}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <form className="admin-form" onSubmit={handleCreate} noValidate>
            <div className="field-row">
              <div className="field">
                <label htmlFor="inv-phone">T\u00e9l\u00e9phone</label>
                <input
                  id="inv-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+229 01 97 00 00 00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="inv-role">R\u00f4le</label>
                <select
                  id="inv-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as InvitationRole)}
                >
                  <option value="EVALUATOR">\u00c9valuateur</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label htmlFor="inv-email">E-mail (facultatif)</label>
              <input
                id="inv-email"
                type="email"
                autoComplete="email"
                placeholder="jean.dossou@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="field__hint">
                Non transmis au serveur si vide. Sert uniquement \u00e0 votre suivi.
              </p>
            </div>

            <div>
              <button className="btn btn--primary" type="submit" disabled={creating}>
                <MailCheck size={17} aria-hidden="true" />
                {creating ? 'Cr\u00e9ation\u2026' : 'Cr\u00e9er l\u2019invitation'}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Liste des invitations */}
      <section className="panel" style={{ marginTop: 18 }} aria-labelledby="list-title">
        <div className="panel__head">
          <h2 id="list-title">
            <UserCog size={15} aria-hidden="true" />
            Invitations existantes
          </h2>
          <span className="panel__ref">{invitations.length} enregistrement(s)</span>
        </div>
        <div className="panel__body" style={{ padding: 0 }}>
          {error ? (
            <p style={{ padding: 18, color: 'var(--danger)', fontSize: 'var(--text-sm)' }}>
              {error}
            </p>
          ) : loading ? (
            <p style={{ padding: 18, color: 'var(--text-3)', fontSize: 'var(--text-sm)' }}>
              Chargement\u2026
            </p>
          ) : invitations.length === 0 ? (
            <p style={{ padding: 18, color: 'var(--text-3)', fontSize: 'var(--text-sm)' }}>
              Aucune invitation pour le moment.
            </p>
          ) : (
            <table className="inv-table">
              <thead>
                <tr>
                  <th>T\u00e9l\u00e9phone</th>
                  <th>R\u00f4le</th>
                  <th>Statut</th>
                  <th>Expire le</th>
                  <th>Cr\u00e9\u00e9e le</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((inv) => {
                  const { label, tone } = statusMeta(inv.status)
                  const StatusIcon =
                    inv.status === 'ACCEPTED'
                      ? CheckCircle2
                      : inv.status === 'EXPIRED' || inv.status === 'REVOKED'
                        ? XCircle
                        : Clock3
                  return (
                    <tr key={inv.id}>
                      <td>
                        <span className="inv-phone">{inv.phone}</span>
                      </td>
                      <td>
                        <span className="inv-role">{inv.role}</span>
                      </td>
                      <td>
                        <span className={`inv-status inv-status--${tone}`}>
                          <StatusIcon size={12} aria-hidden="true" />
                          {label}
                        </span>
                      </td>
                      <td className="inv-date">{formatDate(inv.expiresAt)}</td>
                      <td className="inv-date">{formatDate(inv.createdAt)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </>
  )
}
