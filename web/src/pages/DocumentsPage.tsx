import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  ShieldAlert,
  Upload,
  XCircle,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../lib/api/client'
import {
  getDocumentUploadUrl,
  listDocuments,
  uploadDocumentFile,
} from '../features/session/session-api'
import type { DocumentDto, DocumentType, DocumentContentType } from '../features/session/session-api'

const DOC_TYPES: { value: DocumentType; label: string; hint: string }[] = [
  { value: 'ID_CARD', label: 'Carte d\u2019identité', hint: 'JPEG, PNG ou PDF, max 5 Mo.' },
  { value: 'DIPLOMA', label: 'Diplôme', hint: 'PDF recommandé, max 5 Mo.' },
  {
    value: 'PROFESSIONAL_CERTIFICATE',
    label: 'Certificat professionnel',
    hint: 'PDF recommandé, max 5 Mo.',
  },
  {
    value: 'REFERENCE_LETTER',
    label: 'Lettre de référence',
    hint: 'PDF recommandé, max 5 Mo.',
  },
  { value: 'WORK_PHOTO', label: 'Photo de chantier', hint: 'JPEG ou PNG, max 5 Mo.' },
]

const MIME_MAP: Record<string, DocumentContentType> = {
  'image/jpeg': 'image/jpeg',
  'image/png': 'image/png',
  'application/pdf': 'application/pdf',
  'image/gif': 'image/gif',
  'image/webp': 'image/webp',
}

const STATUS_ICON: Record<string, typeof CheckCircle2> = {
  PENDING: Clock3,
  SUBMITTED: Clock3,
  APPROVED: CheckCircle2,
  REJECTED: ShieldAlert,
  EXPIRED: XCircle,
}

const STATUS_TONE: Record<string, string> = {
  PENDING: 'pending',
  SUBMITTED: 'pending',
  APPROVED: 'verified',
  REJECTED: 'refused',
  EXPIRED: 'suspended',
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'En attente',
    SUBMITTED: 'Soumis',
    APPROVED: 'Approuvé',
    REJECTED: 'Refusé',
    EXPIRED: 'Expiré',
  }
  return map[status] ?? status
}

function typeLabel(type: string): string {
  return DOC_TYPES.find((d) => d.value === type)?.label ?? type
}

export function DocumentsPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [docs, setDocs] = useState<DocumentDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [uploadType, setUploadType] = useState<DocumentType>('ID_CARD')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    listDocuments()
      .then((data) => {
        if (active) setDocs(data)
      })
      .catch((cause) => {
        if (active)
          setError(
            cause instanceof ApiError
              ? cause.message
              : 'La liste des documents n\u2019a pas pu être chargée.',
          )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadError(null)
    setUploadSuccess(null)

    const contentType = MIME_MAP[file.type]
    if (!contentType) {
      setUploadError('Format non accepté. Utilisez JPEG, PNG ou PDF.')
      event.target.value = ''
      return
    }

    const MAX_BYTES = 5 * 1024 * 1024
    if (file.size > MAX_BYTES) {
      setUploadError('Le fichier dépasse 5 Mo.')
      event.target.value = ''
      return
    }

    setUploading(true)
    try {
      const urlResult = await getDocumentUploadUrl({
        type: uploadType,
        fileName: file.name,
        contentType,
        sizeBytes: file.size,
      })

      await uploadDocumentFile(urlResult.uploadUrl, file, file.type)

      setUploadSuccess(`${typeLabel(uploadType)} déposé avec succès.`)

      // Rafraîchit la liste
      const updated = await listDocuments()
      setDocs(updated)
    } catch (cause) {
      setUploadError(
        cause instanceof ApiError
          ? cause.message
          : 'Le téléversement a échoué. Réessayez.',
      )
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  return (
    <div className="dossier-page">
      <div className="dossier-head">
        <div>
          <p className="dossier-kicker">Étape 2 · E-04</p>
          <h1>Pièces justificatives</h1>
          <p className="dossier-lead">
            Déposez vos documents. Le centre de confiance les examine avant de rendre sa décision.
            Les fichiers sont stockés de façon privée et ne sont jamais publiés.
          </p>
        </div>
      </div>

      {error ? (
        <div className="auth-alert auth-alert--error" role="alert">
          <AlertCircle size={20} aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}

      {/* Zone d'upload */}
      <section className="dossier-card" aria-labelledby="upload-title">
        <h2 id="upload-title">
          <Upload size={18} aria-hidden="true" />
          Déposer un document
        </h2>

        <div className="dossier-upload-row">
          <div className="field">
            <label htmlFor="doc-type">Type de document</label>
            <select
              id="doc-type"
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value as DocumentType)}
            >
              {DOC_TYPES.map((dt) => (
                <option key={dt.value} value={dt.value}>
                  {dt.label}
                </option>
              ))}
            </select>
            <p className="field__hint">
              {DOC_TYPES.find((d) => d.value === uploadType)?.hint}
            </p>
          </div>

          <div className="dossier-upload-btn-wrap">
            <input
              ref={fileInputRef}
              type="file"
              id="file-input"
              accept=".jpg,.jpeg,.png,.pdf,.gif,.webp"
              className="sr-only"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <button
              type="button"
              className="btn btn--primary"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={17} aria-hidden="true" />
              {uploading ? 'Téléversement…' : 'Choisir un fichier'}
            </button>
          </div>
        </div>

        {uploadError ? (
          <div className="auth-alert auth-alert--error" role="alert" style={{ marginTop: 12 }}>
            <AlertCircle size={18} aria-hidden="true" />
            <span>{uploadError}</span>
          </div>
        ) : null}

        {uploadSuccess ? (
          <div className="auth-alert auth-alert--info" role="status" style={{ marginTop: 12 }}>
            <CheckCircle2 size={18} aria-hidden="true" />
            <span>{uploadSuccess}</span>
          </div>
        ) : null}
      </section>

      {/* Liste des documents */}
      <section className="dossier-card" aria-labelledby="list-title" style={{ marginTop: 16 }}>
        <h2 id="list-title">
          <FileText size={18} aria-hidden="true" />
          Documents déposés
        </h2>

        {loading ? (
          <p className="dossier-muted" role="status">Chargement…</p>
        ) : docs.length === 0 ? (
          <p className="dossier-empty">Aucun document déposé pour le moment.</p>
        ) : (
          <ul className="dossier-docs">
            {docs.map((doc) => {
              const Icon = STATUS_ICON[doc.status] ?? Clock3
              const tone = STATUS_TONE[doc.status] ?? 'pending'
              return (
                <li key={doc.id} className="dossier-doc">
                  <FileText size={16} aria-hidden="true" className="dossier-doc__icon" />
                  <div className="dossier-doc__body">
                    <span className="dossier-doc__name">{typeLabel(doc.type)}</span>
                    <span className="dossier-doc__file">{doc.fileName}</span>
                  </div>
                  <span className={`status-badge status-badge--${tone}`}>
                    <Icon size={13} aria-hidden="true" />
                    {statusLabel(doc.status)}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Types attendus */}
      <section className="dossier-card dossier-card--muted" style={{ marginTop: 16 }}>
        <h2>Documents requis</h2>
        <ul className="dossier-required">
          {DOC_TYPES.map((dt) => {
            const deposited = docs.some((d) => d.type === dt.value)
            return (
              <li key={dt.value} className={`dossier-required__item ${deposited ? 'dossier-required__item--done' : ''}`}>
                {deposited ? (
                  <CheckCircle2 size={16} aria-hidden="true" />
                ) : (
                  <Clock3 size={16} aria-hidden="true" />
                )}
                <span>{dt.label}</span>
              </li>
            )
          })}
        </ul>
      </section>

      <div className="dossier-actions" style={{ marginTop: 24 }}>
        <button
          type="button"
          className="btn btn--outline"
          onClick={() => navigate('/app/dossier')}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Retour au dossier
        </button>
      </div>
    </div>
  )
}
