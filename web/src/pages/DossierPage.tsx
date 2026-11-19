import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  ShieldAlert,
  UserRound,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../lib/api/client'
import { getProfessionalProfile, listDocuments } from '../features/session/session-api'
import type { DocumentDto, ProfessionalProfile } from '../features/session/session-api'

const STATUS_META: Record<
  string,
  { label: string; tone: string; icon: typeof CheckCircle2 }
> = {
  PENDING: { label: 'En attente de vérification', tone: 'pending', icon: Clock3 },
  APPROVED: { label: 'Dossier approuvé', tone: 'verified', icon: CheckCircle2 },
  REJECTED: { label: 'Dossier refusé', tone: 'refused', icon: ShieldAlert },
}

function docStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'En attente',
    SUBMITTED: 'Soumis',
    APPROVED: 'Approuvé',
    REJECTED: 'Refusé',
    EXPIRED: 'Expiré',
  }
  return map[status] ?? status
}

function docTypeLabel(type: string): string {
  const map: Record<string, string> = {
    ID_CARD: 'Carte d\u2019identité',
    PROFILE_PHOTO: 'Photo de profil',
    DIPLOMA: 'Diplôme',
    PROFESSIONAL_CERTIFICATE: 'Certificat professionnel',
    REFERENCE_LETTER: 'Lettre de référence',
    WORK_PHOTO: 'Photo de chantier',
  }
  return map[type] ?? type
}

export function DossierPage() {
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null)
  const [docs, setDocs] = useState<DocumentDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    Promise.all([getProfessionalProfile(), listDocuments()])
      .then(([prof, documents]) => {
        if (!active) return
        setProfile(prof)
        setDocs(documents)
      })
      .catch((cause) => {
        if (!active) return
        setError(
          cause instanceof ApiError
            ? cause.message
            : 'Le dossier n\u2019a pas pu être chargé.',
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const statusMeta =
    profile ? (STATUS_META[profile.status] ?? STATUS_META['PENDING']) : null

  return (
    <div className="dossier-page">
      <div className="dossier-head">
        <div>
          <p className="dossier-kicker">Étape 2 · E-02</p>
          <h1>Mon dossier professionnel</h1>
          <p className="dossier-lead">
            Déclarez vos spécialités, vos zones d'intervention et déposez vos pièces
            justificatives. Le centre de confiance examine le dossier avant toute mission.
          </p>
        </div>

        {profile && statusMeta ? (
          <span className={`status-badge status-badge--${statusMeta.tone}`}>
            <statusMeta.icon size={14} aria-hidden="true" />
            {statusMeta.label}
          </span>
        ) : null}
      </div>

      {error ? (
        <div className="auth-alert auth-alert--error" role="alert">
          <AlertCircle size={20} aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}

      {loading ? (
        <div className="dossier-grid">
          <div className="dossier-card skeleton" style={{ height: 180 }} />
          <div className="dossier-card skeleton" style={{ height: 180 }} />
        </div>
      ) : (
        <div className="dossier-grid">
          {/* Bloc profil professionnel */}
          <section className="dossier-card" aria-labelledby="pro-title">
            <div className="dossier-card__head">
              <h2 id="pro-title">
                <UserRound size={18} aria-hidden="true" />
                Profil professionnel
              </h2>
              <Link className="btn btn--outline btn--sm" to="/app/dossier/profil">
                {profile ? 'Modifier' : 'Remplir'}
                <ChevronRight size={15} aria-hidden="true" />
              </Link>
            </div>

            {profile ? (
              <dl className="dossier-list">
                <div>
                  <dt>Expérience</dt>
                  <dd>{profile.experienceYears} ans</dd>
                </div>
                <div>
                  <dt>Spécialités</dt>
                  <dd>
                    {profile.specialties.length > 0
                      ? profile.specialties.map((s) => s.label).join(', ')
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt>Zones d'intervention</dt>
                  <dd>
                    {profile.zones.length > 0
                      ? profile.zones.map((z) => z.name).join(', ')
                      : '—'}
                  </dd>
                </div>
                {profile.bio ? (
                  <div>
                    <dt>Bio</dt>
                    <dd>{typeof me?.bio === 'string' ? me.bio : ''}</dd>
                  </div>
                ) : null}
              </dl>
            ) : (
              <p className="dossier-empty">
                Aucun profil professionnel. Renseignez vos spécialités et zones d'intervention
                pour soumettre votre dossier.
              </p>
            )}
          </section>

          {/* Bloc documents */}
          <section className="dossier-card" aria-labelledby="docs-title">
            <div className="dossier-card__head">
              <h2 id="docs-title">
                <FileText size={18} aria-hidden="true" />
                Pièces justificatives
              </h2>
              <Link className="btn btn--outline btn--sm" to="/app/dossier/documents">
                {docs.length > 0 ? 'Gérer' : 'Déposer'}
                <ChevronRight size={15} aria-hidden="true" />
              </Link>
            </div>

            {docs.length > 0 ? (
              <ul className="dossier-docs">
                {docs.map((doc) => (
                  <li key={doc.id} className="dossier-doc">
                    <FileText size={16} aria-hidden="true" className="dossier-doc__icon" />
                    <div className="dossier-doc__body">
                      <span className="dossier-doc__name">{docTypeLabel(doc.type)}</span>
                      <span className="dossier-doc__file">{doc.fileName}</span>
                    </div>
                    <span
                      className={`status-badge status-badge--${
                        doc.status === 'APPROVED'
                          ? 'verified'
                          : doc.status === 'REJECTED'
                            ? 'refused'
                            : 'pending'
                      }`}
                    >
                      {docStatusLabel(doc.status)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="dossier-empty">
                Aucune pièce déposée. Carte d'identité, diplôme et certificat professionnel sont
                requis.
              </p>
            )}
          </section>
        </div>
      )}

      {profile?.decisionReason ? (
        <div className="dossier-decision">
          <ShieldAlert size={20} aria-hidden="true" />
          <div>
            <strong>Motif de la décision</strong>
            <p>{typeof profile.decisionReason === 'string' ? profile.decisionReason : ''}</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
