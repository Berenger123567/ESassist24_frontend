import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileText,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError, createIdempotencyKey, idempotencyHeaders } from '../lib/api/client'
import {
  getAdminDocumentViewUrl,
  getVerificationDetail,
  submitVerificationDecision,
} from '../features/session/session-api'
import type {
  VerificationDetail,
  VerificationDocument,
  VerificationDecision,
} from '../features/session/session-api'

type DecisionType = VerificationDecision['decision']
type ReasonCode = NonNullable<VerificationDecision['reasonCode']>

const DECISION_OPTIONS: { value: DecisionType; label: string; tone: string }[] = [
  { value: 'VERIFIED', label: 'Approuver le dossier', tone: 'success' },
  { value: 'REFUSED', label: 'Refuser le dossier', tone: 'danger' },
  { value: 'COMPLEMENT_REQUESTED', label: 'Demander un compl\u00e9ment', tone: 'warning' },
]

const REASON_CODES: { value: ReasonCode; label: string }[] = [
  { value: 'VERIFIED_OK', label: 'Dossier conforme' },
  { value: 'DOCUMENT_MISSING', label: 'Document manquant' },
  { value: 'DOCUMENT_UNREADABLE', label: 'Document illisible' },
  { value: 'DOCUMENT_EXPIRED', label: 'Document expir\u00e9' },
  { value: 'DOCUMENT_MISMATCH', label: 'Document non conforme' },
  { value: 'EXPERIENCE_INSUFFICIENT', label: 'Exp\u00e9rience insuffisante' },
  { value: 'SPECIALTY_NOT_JUSTIFIED', label: 'Sp\u00e9cialit\u00e9 non justifi\u00e9e' },
  { value: 'ZONE_NOT_COVERED', label: 'Zone non couverte' },
  { value: 'OTHER', label: 'Autre' },
]

function docStatusTone(status: string): string {
  if (status === 'APPROVED') return 'verified'
  if (status === 'REJECTED' || status === 'EXPIRED') return 'refused'
  return 'pending'
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '\u2014'
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(
    new Date(value),
  )
}

function strVal(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

export function VerificationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [detail, setDetail] = useState<VerificationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Formulaire de d\u00e9cision
  const [decision, setDecision] = useState<DecisionType>('VERIFIED')
  const [reasonCode, setReasonCode] = useState<ReasonCode>('VERIFIED_OK')
  const [reasonText, setReasonText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [decisionError, setDecisionError] = useState<string | null>(null)
  const [decisionDone, setDecisionDone] = useState(false)

  // Vue document
  const [viewingDocId, setViewingDocId] = useState<string | null>(null)
  const [viewUrl, setViewUrl] = useState<string | null>(null)
  const [viewLoading, setViewLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    let active = true
    setLoading(true)

    getVerificationDetail(id)
      .then((data) => { if (active) setDetail(data) })
      .catch((cause) => {
        if (active)
          setError(cause instanceof ApiError ? cause.message : 'Le dossier n\u2019a pas pu \u00eatre charg\u00e9.')
      })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [id])

  async function handleViewDocument(docId: string) {
    setViewingDocId(docId)
    setViewUrl(null)
    setViewLoading(true)
    try {
      const result = await getAdminDocumentViewUrl(docId)
      setViewUrl(result.viewUrl)
    } catch {
      setViewUrl(null)
    } finally {
      setViewLoading(false)
    }
  }

  async function handleDecision(event: FormEvent) {
    event.preventDefault()
    setDecisionError(null)

    if (reasonText.trim().length < 20) {
      setDecisionError('Le motif doit comporter au moins 20 caract\u00e8res.')
      return
    }

    setSubmitting(true)
    try {
      await submitVerificationDecision(
        id!,
        { decision, reasonCode, reasonText: reasonText.trim() },
        createIdempotencyKey(),
      )
      setDecisionDone(true)
      setTimeout(() => navigate('/app/verifications'), 1500)
    } catch (cause) {
      setDecisionError(
        cause instanceof ApiError ? cause.message : 'La d\u00e9cision n\u2019a pas pu \u00eatre enregistr\u00e9e.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="vf-empty" style={{ marginTop: 40 }}>Chargement du dossier\u2026</div>
    )
  }

  if (error || !detail) {
    return (
      <div className="form-alert form-alert--error" style={{ marginTop: 20 }} role="alert">
        <AlertCircle size={17} aria-hidden="true" />
        {error ?? 'Dossier introuvable.'}
      </div>
    )
  }

  const canDecide = detail.status === 'PENDING'
  const displayName = [strVal(detail.firstName), strVal(detail.lastName)].filter(Boolean).join(' ')

  return (
    <>
      <div className="page-head">
        <div>
          <p className="page-head__kicker">V\u00e9rification &middot; {detail.phone}</p>
          <h1>{displayName || detail.phone}</h1>
          <p className="page-head__lead">
            Dossier soumis le {formatDate(detail.submittedAt)} &middot; SLA\u00a0: {formatDate(detail.slaDueAt)}
            {detail.overdue ? <strong style={{ color: 'var(--danger)' }}> &mdash; En retard</strong> : null}
          </p>
        </div>
        <button
          type="button"
          className="btn btn--outline"
          onClick={() => navigate('/app/verifications')}
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Retour
        </button>
      </div>

      <div className="vd-grid">
        {/* Colonne gauche : infos + documents */}
        <div>
          {/* Profil */}
          <section className="panel" aria-labelledby="profil-title">
            <div className="panel__head">
              <h2 id="profil-title">Profil d\u00e9clar\u00e9</h2>
            </div>
            <div className="panel__body">
              <dl className="vd-list">
                <div>
                  <dt>Exp\u00e9rience</dt>
                  <dd>{detail.experienceYears} ans</dd>
                </div>
                <div>
                  <dt>Sp\u00e9cialit\u00e9s</dt>
                  <dd>{detail.specialties.join(', ') || '\u2014'}</dd>
                </div>
                <div>
                  <dt>Zones</dt>
                  <dd>{detail.zones.join(', ') || '\u2014'}</dd>
                </div>
                {detail.bio ? (
                  <div>
                    <dt>Bio</dt>
                    <dd>{strVal(detail.bio)}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </section>

          {/* Documents */}
          <section className="panel" style={{ marginTop: 16 }} aria-labelledby="docs-title">
            <div className="panel__head">
              <h2 id="docs-title">
                <FileText size={15} aria-hidden="true" />
                Pi\u00e8ces justificatives
              </h2>
            </div>
            <div className="panel__body" style={{ padding: 0 }}>
              {detail.documents.length === 0 ? (
                <p className="vf-empty">Aucune pi\u00e8ce d\u00e9pos\u00e9e.</p>
              ) : (
                <table className="vf-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Fichier</th>
                      <th>Statut</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.documents.map((doc) => {
                      const tone = docStatusTone(doc.status)
                      return (
                        <tr key={doc.id}>
                          <td style={{ fontSize: 'var(--text-xs)' }}>{doc.type}</td>
                          <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-2)' }}>
                            {doc.fileName}
                          </td>
                          <td>
                            <span className={`status-badge status-badge--${tone}`}>
                              {doc.status}
                            </span>
                          </td>
                          <td>
                            {viewingDocId === doc.id && viewLoading ? (
                              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Chargement\u2026</span>
                            ) : viewingDocId === doc.id && viewUrl ? (
                              <a
                                href={viewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn--outline"
                                style={{ minHeight: 28, padding: '2px 8px', fontSize: 11, gap: 4 }}
                              >
                                Ouvrir
                                <ExternalLink size={11} aria-hidden="true" />
                              </a>
                            ) : (
                              <button
                                type="button"
                                className="btn btn--outline"
                                style={{ minHeight: 28, padding: '2px 8px', fontSize: 11 }}
                                onClick={() => void handleViewDocument(doc.id)}
                              >
                                Voir
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>

        {/* Colonne droite : d\u00e9cision */}
        <div>
          <section className="panel" aria-labelledby="decision-title">
            <div className="panel__head">
              <h2 id="decision-title">D\u00e9cision</h2>
              {!canDecide ? (
                <span className="panel__ref">D\u00e9j\u00e0 trait\u00e9</span>
              ) : null}
            </div>
            <div className="panel__body">
              {decisionDone ? (
                <div className="form-alert form-alert--success" role="status">
                  <CheckCircle2 size={17} aria-hidden="true" />
                  D\u00e9cision enregistr\u00e9e. Redirection\u2026
                </div>
              ) : !canDecide ? (
                <div className="form-alert form-alert--info" role="status">
                  <ShieldCheck size={17} aria-hidden="true" />
                  Ce dossier a d\u00e9j\u00e0 \u00e9t\u00e9 trait\u00e9 (statut\u00a0: {detail.status}).
                  {strVal(detail.decisionReason) ? (
                    <p style={{ marginTop: 6, fontSize: 'var(--text-xs)' }}>
                      Motif\u00a0: {strVal(detail.decisionReason)}
                    </p>
                  ) : null}
                </div>
              ) : (
                <form className="admin-form" onSubmit={handleDecision} noValidate>
                  {decisionError ? (
                    <div className="form-alert form-alert--error" role="alert">
                      <AlertCircle size={17} aria-hidden="true" />
                      {decisionError}
                    </div>
                  ) : null}

                  <div className="field">
                    <label htmlFor="decision-type">D\u00e9cision</label>
                    <select
                      id="decision-type"
                      value={decision}
                      onChange={(e) => setDecision(e.target.value as DecisionType)}
                    >
                      {DECISION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="reason-code">Code motif</label>
                    <select
                      id="reason-code"
                      value={reasonCode}
                      onChange={(e) => setReasonCode(e.target.value as ReasonCode)}
                    >
                      {REASON_CODES.map((rc) => (
                        <option key={rc.value} value={rc.value}>{rc.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="reason-text">
                      Motif d\u00e9taill\u00e9
                      <span style={{ color: 'var(--text-3)', fontWeight: 400, marginLeft: 6 }}>
                        (min. 20 caract\u00e8res)
                      </span>
                    </label>
                    <textarea
                      id="reason-text"
                      rows={4}
                      value={reasonText}
                      onChange={(e) => setReasonText(e.target.value)}
                      placeholder="D\u00e9crivez pr\u00e9cis\u00e9ment le motif de la d\u00e9cision."
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid var(--border-strong)',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--surface)',
                        color: 'var(--text)',
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)',
                        resize: 'vertical',
                      }}
                      required
                    />
                    <p className="field__hint">{reasonText.length} / 1000 caract\u00e8res</p>
                  </div>

                  <button
                    className={`btn btn--block ${
                      decision === 'VERIFIED' ? 'btn--primary' : decision === 'REFUSED' ? 'btn--danger' : 'btn--gold'
                    }`}
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? 'Enregistrement\u2026' : DECISION_OPTIONS.find((o) => o.value === decision)?.label}
                  </button>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
