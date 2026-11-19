import { CheckCircle2, Clock3, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

export function ConsolePage() {
  return (
    <>
      <div className="page-head">
        <div>
          <p className="page-head__kicker">Centre de confiance &middot; \u00e9tape 2</p>
          <h1>Console d&rsquo;administration</h1>
          <p className="page-head__lead">
            Connexion (A-01), activation d&rsquo;invitation (V-01) et gestion des invitations sont
            livr\u00e9s. Les modules de v\u00e9rification des dossiers, documents et journal d&rsquo;audit restent
            \u00e0 livrer \u00e0 l&rsquo;\u00e9tape 3 quand le contrat les d\u00e9crira.
          </p>
        </div>

        <div className="page-head__meta">
          Contrat OpenAPI
          <br />
          106c383 &middot; 29 routes
        </div>
      </div>

      <div className="status-grid">
        <article className="status-card status-card--done">
          <div className="status-card__label">
            Acc\u00e8s
            <CheckCircle2 size={14} aria-hidden="true" />
          </div>
          <h3>A-01 &middot; connexion</h3>
          <p>
            Num\u00e9ro et mot de passe, puis code TOTP. Les r\u00e8gles de verrouillage et d&rsquo;expiration du
            d\u00e9fi sont appliqu\u00e9es par le serveur.
          </p>
          <span className="status-card__flag status-card__flag--done">Livr\u00e9</span>
        </article>

        <article className="status-card status-card--done">
          <div className="status-card__label">
            Invitation
            <CheckCircle2 size={14} aria-hidden="true" />
          </div>
          <h3>V-01 &middot; activation</h3>
          <p>
            Le lien \u00e0 usage unique permet de choisir son mot de passe&nbsp;; l&rsquo;enr\u00f4lement TOTP suit,
            avec QR code et cl\u00e9 manuelle.
          </p>
          <span className="status-card__flag status-card__flag--done">Livr\u00e9</span>
        </article>

        <article className="status-card status-card--done">
          <div className="status-card__label">
            Organisation
            <CheckCircle2 size={14} aria-hidden="true" />
          </div>
          <h3>Invitations &middot; gestion</h3>
          <p>
            Cr\u00e9ation et liste des invitations depuis la console. Le lien g\u00e9n\u00e9r\u00e9 est affich\u00e9 une
            seule fois et copiable.
          </p>
          <Link
            to="/app/invitations"
            className="status-card__flag status-card__flag--done"
            style={{ textDecoration: 'none' }}
          >
            Ouvrir &rarr;
          </Link>
        </article>

        <article className="status-card status-card--blocked">
          <div className="status-card__label">
            V\u00e9rification
            <ShieldAlert size={14} aria-hidden="true" />
          </div>
          <h3>Routes absentes</h3>
          <p>
            La file de dossiers, la consultation des pi\u00e8ces et le journal d&rsquo;audit ne sont pas
            encore d\u00e9crits dans le contrat.
          </p>
          <span className="status-card__flag status-card__flag--blocked">\u00c9tape 3</span>
        </article>
      </div>

      <section className="panel" style={{ marginTop: 26 }} aria-labelledby="jalons-title">
        <div className="panel__head">
          <h2 id="jalons-title">Jalons du client d&rsquo;administration</h2>
          <span className="panel__ref">\u00c90 &rarr; \u00c93</span>
        </div>
        <div className="panel__body">
          <ul className="milestones">
            <li className="milestone">
              <span className="milestone__step">\u00c9tape 0</span>
              <div>
                <strong>Socle React, Vite et TypeScript</strong>
                <p>Tokens de la charte, coquille de navigation, garde de routes et client API.</p>
              </div>
              <span className="milestone__state milestone__state--done">Livr\u00e9</span>
            </li>
            <li className="milestone">
              <span className="milestone__step">\u00c9tape 1</span>
              <div>
                <strong>Connexion A-01, activation V-01 et TOTP</strong>
                <p>
                  Mot de passe, second facteur obligatoire, invitation \u00e0 usage unique et
                  renouvellement de session par cookie httpOnly.
                </p>
              </div>
              <span className="milestone__state milestone__state--done">Livr\u00e9</span>
            </li>
            <li className="milestone">
              <span className="milestone__step">\u00c9tape 2</span>
              <div>
                <strong>Gestion des invitations</strong>
                <p>
                  Cr\u00e9ation d&rsquo;invitations ADMIN / EVALUATOR, liste avec statuts, lien copiable
                  affich\u00e9 une seule fois.
                </p>
              </div>
              <span className="milestone__state milestone__state--done">Livr\u00e9</span>
            </li>
            <li className="milestone">
              <span className="milestone__step">\u00c9tape 3</span>
              <div>
                <strong>V\u00e9rifications, documents et audit</strong>
                <p>
                  File des dossiers, d\u00e9cision motiv\u00e9e, lien sign\u00e9 journalis\u00e9 et journal en ajout
                  seulement.
                </p>
              </div>
              <span className="milestone__state">\u00c0 venir</span>
            </li>
          </ul>
        </div>
      </section>

      <div className="panel" style={{ marginTop: 18 }}>
        <div className="panel__body">
          <p style={{ color: 'var(--text-2)', fontSize: 'var(--text-sm)' }}>
            Le contrat OpenAPI ne d\u00e9crit pas encore le jeton de d\u00e9fi MFA renvoy\u00e9 par
            <code> /admin/auth/login</code>. La console le lit dans la r\u00e9ponse r\u00e9elle et refuse
            d&rsquo;ouvrir la session s&rsquo;il manque, plut\u00f4t que de contourner le second facteur.{' '}
            <Link to="/invitation">Activer une invitation</Link> reste accessible sans session.
          </p>
        </div>
      </div>

      <div className="security-note">
        <Clock3 size={20} aria-hidden="true" />
        <div>
          <strong>Prochaine \u00e9tape&nbsp;: v\u00e9rifications et journal d&rsquo;audit</strong>
          <p>
            Les routes <code>/admin/verifications</code> ne figurent pas encore dans le contrat
            (\u00c93). Les \u00e9crans A-03 \u00e0 A-05 et A-12 restent donc bloqu\u00e9s c\u00f4t\u00e9 backend, comme
            consign\u00e9 dans le suivi du plan.
          </p>
        </div>
      </div>

      <div className="security-note">
        <ShieldCheck size={20} aria-hidden="true" />
        <div>
          <strong>R\u00e8gles d&rsquo;acc\u00e8s d\u00e9j\u00e0 act\u00e9es</strong>
          <p>
            Aucun compte administrateur n&rsquo;est cr\u00e9\u00e9 par d\u00e9faut. L&rsquo;acc\u00e8s se fait sur invitation,
            avec mot de passe et code TOTP. La restriction par adresse IP s&rsquo;applique quand la
            plage est connue, et chaque action engageante est inscrite dans un journal en ajout
            seulement.
          </p>
        </div>
      </div>
    </>
  )
}
