import { CheckCircle2, CircleDashed, MinusCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const BOARD_ROWS = [
  {
    label: 'Contrat API',
    detail: 'OpenAPI, mock Prism et client typé',
    state: 'Prêt',
    tone: 'on',
    on: true,
  },
  {
    label: 'Application web',
    detail: 'React, Vite, connexion et dossier pro',
    state: 'Livré',
    tone: 'on',
    on: true,
  },
  {
    label: 'Application mobile',
    detail: 'Expo, connexion et dossier pro',
    state: 'Livré',
    tone: 'on',
    on: true,
  },
  {
    label: 'Console d’administration',
    detail: 'Connexion, TOTP et invitations',
    state: 'Livré',
    tone: 'on',
    on: true,
  },
] as const

const JOURNEY = [
  {
    title: 'Déclarer la panne',
    detail:
      'Type de panne, urgence, photos et commune. L’adresse précise n’est jamais exposée publiquement.',
  },
  {
    title: 'Choisir un professionnel',
    detail:
      'Seuls les dossiers vérifiés ou certifiés apparaissent. Le niveau, la note et les spécialités sont affichés.',
  },
  {
    title: 'Accepter le devis',
    detail:
      'Le total est calculé par le serveur. Les travaux ne démarrent qu’après acceptation, ou urgence acceptée.',
  },
  {
    title: 'Valider et noter',
    detail:
      'Le client valide la réception après le compte rendu. L’avis n’est ouvert qu’après une mission clôturée.',
  },
]

const DELIVERED = [
  {
    title: "Projet React + Vite + TypeScript",
    detail: "Base de d\u00e9veloppement, scripts de build et v\u00e9rification stricte des types.",
  },
  {
    title: "Tokens du design system",
    detail: "Ambre et encre, Inter uniquement, mode clair et sombre, cibles tactiles de 48 px.",
  },
  {
    title: "Client HTTP conforme au contrat",
    detail: "Types g\u00e9n\u00e9r\u00e9s depuis OpenAPI, erreurs normatives et cl\u00e9 d\u2019idempotence.",
  },
  {
    title: "Connexion r\u00e9elle et espace personnel",
    detail: "T\u00e9l\u00e9phone, code \u00e0 6 chiffres, profil avec commune, session renouvel\u00e9e et d\u00e9connexion.",
  },
  {
    title: "Dossier professionnel (web + mobile)",
    detail: "Sp\u00e9cialit\u00e9s, zones d\u2019intervention, t\u00e9l\u00e9versement de pi\u00e8ces justificatives.",
  },
  {
    title: "Applications mobile et administration",
    detail: "Expo pour le mobile, console Vite avec TOTP et gestion des invitations.",
  },
]

const REMAINING = [
  {
    title: "Int\u00e9gration continue et environnements",
    detail: "Pipeline et environnements de d\u00e9veloppement et de test \u00e0 mettre en place.",
    ref: "\u00c90",
  },
  {
    title: "Migration backend",
    detail: "V\u00e9rifier la migration mont\u00e9e puis annul\u00e9e sur une base de test.",
    ref: "\u00c90",
  },
  {
    title: "Centre de confiance",
    detail: "File de v\u00e9rification, d\u00e9cisions motiv\u00e9es et journal d\u2019audit.",
    ref: "\u00c93",
  },
]

export function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div>
            <p className="hero__kicker">Mise en relation — République du Bénin</p>
            <h1>Un électricien vérifié. Une intervention tracée.</h1>
            <p className="hero__lead">
              ÉLECTRO ASSIST 24H met en relation des clients et des électriciens contrôlés. Dossier
              validé avant toute mission, devis accepté avant les travaux, compte rendu et avis
              authentifié après l’intervention.
            </p>

            <div className="hero__actions">
              <Link className="btn btn--gold" to="/connexion">
                Se connecter
              </Link>
              <a className="btn btn--outline" href="#parcours">
                Comprendre le parcours
              </a>
            </div>

            <dl className="hero__facts">
              <div>
                <dt>Avant la mission</dt>
                <dd>Dossier et pièces validés par le centre de confiance.</dd>
              </div>
              <div>
                <dt>Pendant les travaux</dt>
                <dd>Devis accepté, arrivée vérifiée, étapes horodatées.</dd>
              </div>
              <div>
                <dt>Après l’intervention</dt>
                <dd>Réception validée, avis authentifié, recours possible.</dd>
              </div>
            </dl>
          </div>

          <figure className="board" aria-labelledby="board-title">
            <div className="board__head">
              <h2 id="board-title">Mise en service</h2>
              <span>Étape 0</span>
            </div>

            <ul className="board__list">
              {BOARD_ROWS.map((row) => (
                <li
                  key={row.label}
                  className={row.on ? 'board__row board__row--on' : 'board__row'}
                >
                  <span className="board__switch" aria-hidden="true" />
                  <div>
                    <strong>{row.label}</strong>
                    <small>{row.detail}</small>
                  </div>
                  <span className={`board__state board__state--${row.tone}`}>{row.state}</span>
                </li>
              ))}
            </ul>

            <p className="board__note">
              Aucune donnée métier n’est simulée. Le socle des trois clients est opérationnel et la
              connexion réelle est livrée à l’<strong>étape 1</strong>. Seule la décision du canal
              des codes (SMS, WhatsApp ou les deux) reste ouverte.
            </p>
          </figure>
        </div>
      </section>

      <section className="section section--surface" id="parcours" aria-labelledby="parcours-title">
        <div className="container">
          <div className="section__head">
            <h2 id="parcours-title">De la panne à l’avis, chaque étape est encadrée.</h2>
            <p>
              Le client garde la main : il accepte le devis avant les travaux et valide la réception
              avant de noter. Le professionnel ne reçoit aucune mission avant validation de son
              dossier.
            </p>
          </div>

          <ol className="journey">
            {JOURNEY.map((step, index) => (
              <li className="journey__step" key={step.title}>
                <span className="journey__index" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3>{step.title}</h3>
                <p>{step.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" id="socle" aria-labelledby="socle-title">
        <div className="container">
          <div className="section__head">
            <h2 id="socle-title">Le socle des trois clients est en place. Le parcours commence ensuite.</h2>
            <p>
              Cette page reflète l’avancement réel du plan de travail. Une fonction n’est annoncée
              terminée qu’après vérification de sa condition de passage.
            </p>
          </div>

          <div className="socle">
            <div className="socle__block">
              <h3>Livré et vérifié</h3>
              <ul className="socle__list">
                {DELIVERED.map((item) => (
                  <li className="socle__item" key={item.title}>
                    <span className="socle__icon" aria-hidden="true">
                      <CheckCircle2 size={17} />
                    </span>
                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.detail}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="socle__block">
              <h3>Reste à faire</h3>
              <ul className="socle__list">
                {REMAINING.map((item) => (
                  <li className="socle__item" key={item.title}>
                    <span
                      className={
                        item.ref === 'É0' ? 'socle__icon socle__icon--wait' : 'socle__icon'
                      }
                      aria-hidden="true"
                    >
                      {item.ref === 'É0' ? <MinusCircle size={17} /> : <CircleDashed size={17} />}
                    </span>
                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.detail}</span>
                    </div>
                    <span className="socle__ref">{item.ref}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}