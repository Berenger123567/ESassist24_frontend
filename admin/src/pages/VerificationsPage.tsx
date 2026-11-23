import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock3,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../lib/api/client'
import { listVerifications } from '../features/session/session-api'
import type { VerificationSummary, VerificationPage } from '../features/session/session-api'

type StatusFilter = 'ALL' | VerificationSummary['status']

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'Tous' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'VERIFIED', label: 'V\u00e9rifi\u00e9' },
  { value: 'CERTIFIED', label: 'Certifi\u00e9' },
  { value: 'REFUSED', label: 'Refus\u00e9' },
  { value: 'SUSPENDED', label: 'Suspendu' },
]

function statusMeta(status: string): { label: string; tone: string } {
  const map: Record<string, { label: string; tone: string }> = {
    PENDING: { label: 'En attente', tone: 'pending' },
    VERIFIED: { label: 'V\u00e9rifi\u00e9', tone: 'verified' },
    CERTIFIED: { label: 'Certifi\u00e9', tone: 'certified' },
    REFUSED: { label: 'Refus\u00e9', tone: 'refused' },
    SUSPENDED: { label: 'Suspendu', tone: 'suspended' },
  }
  return map[status] ?? { label: status, tone: 'pending' }
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(value),
  )
}

export function VerificationsPage() {
  const [page, setPage] = useState<VerificationPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<StatusFilter>('PENDING')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    listVerifications({ status: filter === 'ALL' ? undefined : filter, limit: 50 })
      .then((data) => { if (active) setPage(data) })
      .catch((cause) => {
        if (active)
          setError(cause instanceof ApiError ? cause.message : 'La file n\u2019a pas pu \u00eatre charg\u00e9e.')
      })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [filter])

  const items = page?.data ?? []

  return (
    <>
      <div className="page-head">
        <div>
          <p className="page-head__kicker">Centre de confiance &middot; \u00e9tape 3</p>
          <h1>V\u00e9rifications</h1>
          <p className="page-head__lead">
            File des dossiers professionnels \u00e0 examiner. Chaque d\u00e9cision est horodat\u00e9e et
            inscrite dans le journal d\u2019audit.
          </p>
        </div>
        <div className="page-head__meta">
          GET /admin/verifications
          <br />
          POST /admin/verifications/&#123;id&#125;/decision
        </div>
      </div>

      {/* Filtres */}
      <div className="vf-filters">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={`vf-filter ${filter === f.value ? 'vf-filter--active' : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
        <button
          type="button"
          className="vf-filter vf-filter--icon"
          onClick={() => setFilter(filter)}
          aria-label="Rafra\u00eechir"
        >
          <RefreshCw size={14} aria-hidden="true" />
        </button>
      </div>

      {error ? (
        <div className="form-alert form-alert--error" style={{ marginTop: 16 }} role="alert">
          <AlertCircle size={17} aria-hidden="true" />
          {error}
        </div>
      ) : null}

      <section className="panel" style={{ marginTop: 16 }}>
        <div className="panel__head">
          <h2>Dossiers</h2>
          <span className="panel__ref">
            {loading ? 'Chargement\u2026' : `${items.length} dossier(s)`}
          </span>
        </div>
        <div className="panel__body" style={{ padding: 0 }}>
          {loading ? (
            <p className="vf-empty">Chargement\u2026</p>
          ) : items.length === 0 ? (
            <p className="vf-empty">Aucun dossier dans cette cat\u00e9gorie.</p>
          ) : (
            <table className="vf-table">
              <thead>
                <tr>
                  <th>T\u00e9l\u00e9phone</th>
                  <th>Sp\u00e9cialit\u00e9s</th>
                  <th>Zones</th>
                  <th>Statut</th>
                  <th>Soumis le</th>
                  <th>SLA</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const { label, tone } = statusMeta(item.status)
                  const StatusIcon =
                    item.status === 'VERIFIED' || item.status === 'CERTIFIED'
                      ? ShieldCheck
                      : item.status === 'REFUSED' || item.status === 'SUSPENDED'
                        ? ShieldAlert
                        : Clock3
                  return (
                    <tr key={item.id} className={item.overdue ? 'vf-row--overdue' : ''}>
                      <td className="vf-phone">{item.phone}</td>
                      <td className="vf-tags">
                        {item.specialties.slice(0, 2).map((s) => (
                          <span key={s} className="vf-tag">{s}</span>
                        ))}
                        {item.specialties.length > 2 && (
                          <span className="vf-tag vf-tag--more">+{item.specialties.length - 2}</span>
                        )}
                      </td>
                      <td className="vf-tags">
                        {item.zones.slice(0, 2).map((z) => (
                          <span key={z} className="vf-tag">{z}</span>
                        ))}
                        {item.zones.length > 2 && (
                          <span className="vf-tag vf-tag--more">+{item.zones.length - 2}</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge status-badge--${tone}`}>
                          <StatusIcon size={12} aria-hidden="true" />
                          {label}
                        </span>
                      </td>
                      <td className="vf-date">{formatDate(item.submittedAt)}</td>
                      <td className="vf-date">
                        <span className={item.overdue ? 'vf-overdue' : ''}>
                          {item.overdue ? '\u26a0\ufe0f ' : ''}{formatDate(item.slaDueAt)}
                        </span>
                      </td>
                      <td>
                        <Link
                          to={`/app/verifications/${item.profileId}`}
                          className="btn btn--outline"
                          style={{ minHeight: 32, padding: '4px 10px', fontSize: 'var(--text-xs)', gap: 4 }}
                        >
                          Examiner
                          <ChevronRight size={13} aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {page?.nextCursor ? (
        <button
          type="button"
          className="btn btn--outline"
          style={{ marginTop: 12 }}
          onClick={() => {
            /* pagination à implémenter si besoin */
          }}
        >
          Charger la suite
        </button>
      ) : null}
    </>
  )
}
