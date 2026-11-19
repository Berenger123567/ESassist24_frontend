import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="not-found">
      <div>
        <div className="not-found__code">404</div>
        <h1>Cette page n’existe pas</h1>
        <p>Le lien est peut-être obsolète, ou la page n’a pas encore été livrée.</p>
        <Link className="btn btn--primary" to="/">
          <ArrowLeft size={17} aria-hidden="true" />
          Retour à l’accueil
        </Link>
      </div>
    </div>
  )
}
