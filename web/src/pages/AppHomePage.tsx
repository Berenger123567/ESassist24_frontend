import { LogOut, MapPin, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ApiError } from '../lib/api/client'
import { useSession } from '../features/session/session-context'
import { getMe } from '../features/session/session-api'
import type { Me } from '../features/session/session-api'

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(value))
}

/**
 * Le contrat généré type `firstName`/`lastName` comme `object` (déclaration
 * backend incomplète). On n'affiche qu'une valeur texte, jamais un objet.
 */
function textValue(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export function AppHomePage() {
  const { signOut } = useSession()
  const [me, setMe] = useState<Me | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    let active = true

    getMe()
      .then((data) => {
        if (active) setMe(data)
      })
      .catch((cause) => {
        if (active) {
          setError(
            cause instanceof ApiError
              ? cause.message
              : 'Le profil n’a pas pu être chargé.',
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut()
    } finally {
      setSigningOut(false)
    }
  }

  const displayName = [textValue(me?.firstName), textValue(me?.lastName)]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="account-page">
      <div className="account-head">
        <div>
          <p className="account-kicker">Espace personnel · après connexion</p>
          <h1>Bonjour{textValue(me?.firstName) ? `, ${textValue(me?.firstName)}` : ''}</h1>
          <p className="account-lead">
            La session est ouverte et le jeton d’accès est détenu en mémoire. Les modules métier
            (déclarations, missions, devis) arrivent aux étapes suivantes.
          </p>
        </div>

        <button className="btn btn--outline" type="button" onClick={handleSignOut} disabled={signingOut}>
          <LogOut size={17} aria-hidden="true" />
          {signingOut ? 'Déconnexion…' : 'Se déconnecter'}
        </button>
      </div>

      {error ? (
        <div className="auth-alert auth-alert--error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="account-grid">
        <section className="account-card" aria-labelledby="identity-title">
          <h2 id="identity-title">Identité</h2>

          {loading ? (
            <p className="account-muted" role="status">
              Chargement du profil depuis /me…
            </p>
          ) : me ? (
            <dl className="account-list">
              <div>
                <dt>Nom</dt>
                <dd>{displayName || 'Non renseigné'}</dd>
              </div>
              <div>
                <dt>Téléphone</dt>
                <dd>{me.phone}</dd>
              </div>
              <div>
                <dt>Statut du compte</dt>
                <dd>{me.status}</dd>
              </div>
              <div>
                <dt>Rôles</dt>
                <dd>{me.roles.join(', ') || '—'}</dd>
              </div>
              <div>
                <dt>Compte créé le</dt>
                <dd>{formatDate(me.createdAt)}</dd>
              </div>
            </dl>
          ) : (
            <p className="account-muted">Profil indisponible.</p>
          )}
        </section>

        <section className="account-card" aria-labelledby="zone-title">
          <h2 id="zone-title">
            <MapPin size={17} aria-hidden="true" />
            Commune
          </h2>

          {me?.zone ? (
            <>
              <p className="account-zone">{me.zone.name}</p>
              <p className="account-muted">
                {me.zone.department} · {me.zone.code}
              </p>
            </>
          ) : (
            <p className="account-muted">
              Aucune commune n’est encore rattachée au profil.
            </p>
          )}

          <p className="account-foot">
            L’adresse exacte n’est jamais affichée ni publiée. Seule la zone sert à la mise en
            relation.
          </p>
        </section>
      </div>

      <div className="account-security">
        <ShieldCheck size={20} aria-hidden="true" />
        <div>
          <strong>Session protégée</strong>
          <p>
            Le jeton d’accès expire au bout de 15 minutes et se renouvelle automatiquement. La
            déconnexion révoque la session côté serveur.
          </p>
        </div>
      </div>
    </div>
  )
}
