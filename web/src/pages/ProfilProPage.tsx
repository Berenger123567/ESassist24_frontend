import { AlertCircle, ArrowLeft, ArrowRight, Briefcase, MapPin, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../lib/api/client'
import {
  getProfessionalProfile,
  listSpecialties,
  listZones,
  updateProfessionalProfile,
} from '../features/session/session-api'
import type { ProfessionalProfile, Specialty, Zone } from '../features/session/session-api'

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return 'Le profil n\u2019a pas pu être enregistré. Réessayez dans un instant.'
}

export function ProfilProPage() {
  const navigate = useNavigate()

  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [zoneQuery, setZoneQuery] = useState('')
  const [zonesLoading, setZonesLoading] = useState(true)

  const [selectedSpecialtyIds, setSelectedSpecialtyIds] = useState<string[]>([])
  const [selectedZoneIds, setSelectedZoneIds] = useState<string[]>([])
  const [experienceYears, setExperienceYears] = useState('')
  const [bio, setBio] = useState('')

  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // Chargement initial : spécialités + profil existant
  useEffect(() => {
    let active = true

    Promise.all([listSpecialties(), getProfessionalProfile()])
      .then(([specs, profile]) => {
        if (!active) return
        setSpecialties(specs)
        if (profile) {
          prefillFromProfile(profile)
        }
      })
      .catch(() => {
        if (active) setError('Les données n\u2019ont pas pu être chargées.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  function prefillFromProfile(profile: ProfessionalProfile) {
    setSelectedSpecialtyIds(profile.specialties.map((s) => s.id))
    setSelectedZoneIds(profile.zones.map((z) => z.id))
    setExperienceYears(String(profile.experienceYears))
    setBio(typeof profile.bio === 'string' ? profile.bio : '')
  }

  // Recherche de zones avec debounce
  useEffect(() => {
    let active = true
    setZonesLoading(true)

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

  function toggleSpecialty(id: string) {
    setSelectedSpecialtyIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function toggleZone(id: string) {
    setSelectedZoneIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSaved(false)

    const years = parseInt(experienceYears, 10)
    if (!experienceYears || isNaN(years) || years < 0 || years > 60) {
      setError("Renseignez un nombre d'années d'expérience entre 0 et 60.")
      return
    }
    if (selectedSpecialtyIds.length === 0) {
      setError('Choisissez au moins une spécialité.')
      return
    }
    if (selectedZoneIds.length === 0) {
      setError("Choisissez au moins une zone d'intervention.")
      return
    }

    setPending(true)
    try {
      await updateProfessionalProfile({
        specialtyIds: selectedSpecialtyIds,
        zoneIds: selectedZoneIds,
        experienceYears: years,
        bio: bio.trim() || undefined,
      })
      setSaved(true)
      navigate('/app/dossier', { replace: true })
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="dossier-page">
      <div className="dossier-head">
        <div>
          <p className="dossier-kicker">Étape 2 · E-03</p>
          <h1>Profil professionnel</h1>
          <p className="dossier-lead">
            Déclarez vos spécialités, vos zones d'intervention et votre expérience. Ces
            informations sont examinées par le centre de confiance avant toute mise en relation.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="dossier-card skeleton" style={{ height: 320 }} />
      ) : (
        <form className="dossier-form" onSubmit={handleSubmit} noValidate>
          {error ? (
            <div className="auth-alert auth-alert--error" role="alert">
              <AlertCircle size={20} aria-hidden="true" />
              <span>{error}</span>
            </div>
          ) : null}

          {/* Expérience */}
          <div className="dossier-section">
            <h2>
              <Briefcase size={18} aria-hidden="true" />
              Expérience
            </h2>

            <div className="field" style={{ maxWidth: 220 }}>
              <label htmlFor="experience">Années d'expérience</label>
              <input
                id="experience"
                name="experience"
                type="number"
                min="0"
                max="60"
                inputMode="numeric"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="bio">Bio (facultatif)</label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                placeholder="Décrivez votre parcours et vos savoir-faire en quelques lignes."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="dossier-textarea"
              />
            </div>
          </div>

          {/* Spécialités */}
          <div className="dossier-section">
            <h2>Spécialités</h2>
            <p className="dossier-hint">
              Cochez toutes les spécialités que vous pratiquez. Au moins une est requise.
            </p>
            <div className="dossier-checkgrid">
              {specialties.map((spec) => {
                const checked = selectedSpecialtyIds.includes(spec.id)
                return (
                  <label
                    key={spec.id}
                    className={`dossier-check ${checked ? 'dossier-check--active' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSpecialty(spec.id)}
                    />
                    <span>{spec.label}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Zones d'intervention */}
          <div className="dossier-section">
            <h2>
              <MapPin size={18} aria-hidden="true" />
              Zones d'intervention
            </h2>
            <p className="dossier-hint">
              Sélectionnez toutes les communes où vous intervenez.
            </p>

            <div className="field">
              <label htmlFor="zone-search">Rechercher une commune</label>
              <input
                id="zone-search"
                name="zone-search"
                type="search"
                placeholder="Cotonou, Porto-Novo, Abomey…"
                value={zoneQuery}
                onChange={(e) => setZoneQuery(e.target.value)}
              />
            </div>

            <div className="dossier-zonelist">
              {zonesLoading ? (
                <p className="dossier-muted" role="status">Chargement des communes…</p>
              ) : zones.length === 0 ? (
                <p className="dossier-muted">Aucune commune ne correspond à la recherche.</p>
              ) : (
                zones.map((zone) => {
                  const checked = selectedZoneIds.includes(zone.id)
                  return (
                    <label
                      key={zone.id}
                      className={`dossier-zone ${checked ? 'dossier-zone--active' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleZone(zone.id)}
                      />
                      <MapPin size={15} aria-hidden="true" />
                      <span>{zone.name}</span>
                      <small>{zone.department}</small>
                    </label>
                  )
                })
              )}
            </div>

            {selectedZoneIds.length > 0 ? (
              <p className="dossier-hint">
                {selectedZoneIds.length} commune{selectedZoneIds.length > 1 ? 's' : ''}{' '}
                sélectionnée{selectedZoneIds.length > 1 ? 's' : ''}.
              </p>
            ) : null}
          </div>

          {/* Actions */}
          <div className="dossier-actions">
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => navigate('/app/dossier')}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Retour
            </button>

            <button className="btn btn--primary" type="submit" disabled={pending}>
              <Save size={17} aria-hidden="true" />
              {pending ? 'Enregistrement…' : 'Enregistrer le profil'}
              {!pending ? <ArrowRight size={16} aria-hidden="true" /> : null}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
