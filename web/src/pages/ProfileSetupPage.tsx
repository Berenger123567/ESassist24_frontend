import { ArrowRight, MapPin, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../lib/api/client'
import { useSession } from '../features/session/session-context'
import { listZones, updateProfile } from '../features/session/session-api'
import type { Zone } from '../features/session/session-api'

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return 'Le profil n’a pas pu être enregistré. Réessayez dans un instant.'
}

export function ProfileSetupPage() {
  const navigate = useNavigate()
  const { session } = useSession()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [zoneId, setZoneId] = useState('')
  const [zoneQuery, setZoneQuery] = useState('')
  const [zones, setZones] = useState<Zone[]>([])
  const [zonesLoading, setZonesLoading] = useState(true)
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const timer = window.setTimeout(() => {
      listZones(zoneQuery)
        .then((data) => {
          if (active) setZones(data)
        })
        .catch(() => {
          if (active) setZones([])
        })
        .finally(() => {
          if (active) setZonesLoading(false)
        })
    }, 300)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [zoneQuery])

  const options = useMemo(() => {
    if (!selectedZone || zones.some((zone) => zone.id === selectedZone.id)) return zones
    return [selectedZone, ...zones]
  }, [selectedZone, zones])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!firstName.trim() || !lastName.trim()) {
      setError('Renseignez votre prénom et votre nom.')
      return
    }
    if (!zoneId) {
      setError('Choisissez votre commune de résidence.')
      return
    }

    setPending(true)
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        zoneId,
      })
      navigate('/app', { replace: true })
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-panel auth-panel--wide" aria-labelledby="profile-title">
        <div className="auth-panel__meta">
          <span className="auth-step">Étape 1 · C-03</span>
          <span className="auth-progress">Accès client · 3 / 3</span>
        </div>

        <h1 id="profile-title">Votre profil</h1>
        <p className="auth-panel__lead">
          Ces informations permettent de vous identifier dans l’espace personnel et de rattacher
          vos demandes à une commune. Vous pourrez les compléter plus tard.
        </p>

        {session?.phone ? (
          <p className="auth-account">
            Compte vérifié : <strong>{session.phone}</strong>
          </p>
        ) : null}

        {error ? (
          <div className="auth-alert auth-alert--error" role="alert">
            {error}
          </div>
        ) : null}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="field-row">
            <div className="field">
              <label htmlFor="firstName">Prénom</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="lastName">Nom</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="zone-query">Rechercher une commune</label>
            <input
              id="zone-query"
              name="zone-query"
              type="search"
              placeholder="Cotonou, Porto-Novo, Abomey…"
              value={zoneQuery}
              onChange={(event) => setZoneQuery(event.target.value)}
              aria-describedby="zone-help"
            />
            <p className="field__hint" id="zone-help">
              La recherche interroge le référentiel des zones du serveur.
            </p>
          </div>

          <div className="field">
            <label htmlFor="zone">Commune de résidence</label>
            <select
              id="zone"
              name="zone"
              value={zoneId}
              onChange={(event) => {
                const next = options.find((zone) => zone.id === event.target.value) ?? null
                setSelectedZone(next)
                setZoneId(event.target.value)
              }}
              required
            >
              <option value="">
                {zonesLoading ? 'Chargement des communes…' : 'Choisir une commune'}
              </option>
              {options.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name} — {zone.department}
                </option>
              ))}
            </select>
            {!zonesLoading && options.length === 0 ? (
              <p className="field__hint">
                Aucune commune ne correspond. Modifiez la recherche ou vérifiez le serveur.
              </p>
            ) : null}
          </div>

          <div className="auth-actions">
            <button className="btn btn--primary" type="submit" disabled={pending}>
              <UserRound size={17} aria-hidden="true" />
              {pending ? 'Enregistrement…' : 'Ouvrir mon espace'}
              {!pending ? <ArrowRight size={16} aria-hidden="true" /> : null}
            </button>
          </div>
        </form>

        <div className="auth-divider" />

        <ul className="auth-facts">
          <li>
            <MapPin size={16} aria-hidden="true" />
            La commune sert aux recherches de professionnels ; l’adresse précise reste privée.
          </li>
          <li>
            <UserRound size={16} aria-hidden="true" />
            La photo de profil sera ajoutée à l’étape 2, avec le téléversement documentaire.
          </li>
        </ul>
      </section>
    </div>
  )
}
