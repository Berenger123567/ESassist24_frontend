import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="not-found">
      <div>
        <div className="not-found__code">404</div>
        <h1>Cette page n’existe pas</h1>
        <p>Le lien est obsolète, ou l’écran n’a pas encore été livré.</p>
        <Link className="btn btn--outline" to="/app">
          <ArrowLeft size={16} aria-hidden="true" />
          Retour à la console
        </Link>
      </div>
    </div>
  )
}
