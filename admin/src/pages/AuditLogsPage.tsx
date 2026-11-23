import { AlertCircle, CheckCircle2, RefreshCw, ShieldAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ApiError } from '../lib/api/client'
import { listAuditLogs } from '../features/session/session-api'
import type { AuditLogPage } from '../features/session/session-api'

function resultTone(result: string): string {
  return result === 'SUCCESS' ? 'verified' : 'refused'
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'medium' }).format(
    new Date(value),
  )
}

export function AuditLogsPage() {
  const [page, setPage] = useState<AuditLogPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionFilter, setActionFilter] = useState('')

  function load(cursor?: string) {
    let active = true
    setLoading(true)
    setError(null)

    listAuditLogs({
      limit: 50,
      cursor,
      action: actionFilter.trim() || undefined,
    })
      .then((data) => {
        if (active) setPage(data)
      })
      .catch((cause) => {
        if (active)
          setError(
            cause instanceof ApiError ? cause.message : 'Le journal n\u2019a pas pu \u00eatre charg\u00e9.',
          )
      })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }

  useEffect(() => {
    const cleanup = load()
    return cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionFilter])

  const items = page?.data ?? []

  return (
    <>
      <div className="page-head">
        <div>
          <p className="page-head__kicker">Centre de confiance &middot; \u00e9tape 3</p>
          <h1>Journal d&rsquo;audit</h1>
          <p className="page-head__lead">
            Toutes les actions engageantes : d\u00e9cisions de v\u00e9rification, connexions, t\u00e9l\u00e9chargements
            de documents. Le journal est en ajout seulement.
          </p>
        </div>
        <div className="page-head__meta">
          GET /admin/audit-logs
        </div>
      </div>

      <div className="vf-filters" style={{ marginTop: 20 }}>
        <input
          type="search"
          placeholder="Filtrer par action (ex.\u00a0: VERIFICATION.DECISION)"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          style={{
            minHeight: 36,
            padding: '4px 12px',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--surface)',
            color: 'var(--text)',
            fontSize: 'var(--text-xs)',
            width: 320,
          }}
        />
        <button
          type="button"
          className="vf-filter vf-filter--icon"
          onClick={() => load()}
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
          <h2>Entr\u00e9es</h2>
          <span className="panel__ref">
            {loading ? 'Chargement\u2026' : `${items.length} entr\u00e9e(s)`}
          </span>
        </div>
        <div className="panel__body" style={{ padding: 0 }}>
          {loading ? (
            <p className="vf-empty">Chargement\u2026</p>
          ) : items.length === 0 ? (
            <p className="vf-empty">Aucune entr\u00e9e pour ce filtre.</p>
          ) : (
            <table className="vf-table">
              <thead>
                <tr>
                  <th>Horodatage</th>
                  <th>Action</th>
                  <th>Acteur</th>
                  <th>Cible</th>
                  <th>R\u00e9sultat</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {items.map((log) => {
                  const tone = resultTone(log.result)
                  const Icon = log.result === 'SUCCESS' ? CheckCircle2 : ShieldAlert
                  return (
                    <tr key={String(log.id)}>
                      <td className="vf-date">{formatDate(log.createdAt)}</td>
                      <td>
                        <code style={{ fontSize: 11 }}>{log.action}</code>
                      </td>
                      <td className="vf-phone">{log.actorRole ?? '\u2014'}</td>
                      <td className="vf-phone">
                        {log.targetType ? `${log.targetType}` : '\u2014'}
                      </td>
                      <td>
                        <span className={`status-badge status-badge--${tone}`}>
                          <Icon size={12} aria-hidden="true" />
                          {log.result}
                        </span>
                      </td>
                      <td className="vf-date">{log.ip ?? '\u2014'}</td>
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
          onClick={() => load(page.nextCursor ?? undefined)}
        >
          Charger la suite
        </button>
      ) : null}
    </>
  )
}
