import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

interface UpcomingPageProps {
  title: string
  step: string
  description: string
  screens: string
}

export function UpcomingPage({ title, step, description, screens }: UpcomingPageProps) {
  return (
    <div className="upcoming">
      <div className="upcoming__inner">
        <span className="upcoming__step">{step}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-3)' }}>
          Écrans concernés : {screens}.
        </p>

        <div className="upcoming__actions">
          <Link className="btn btn--primary" to="/">
            <ArrowLeft size={17} aria-hidden="true" />
            Retour à l’accueil
          </Link>
          <a className="btn btn--outline" href="/#socle">
            Voir l’état du socle
          </a>
        </div>
      </div>
    </div>
  )
}
