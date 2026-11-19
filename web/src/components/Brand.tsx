import { Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

interface BrandProps {
  to?: string
}

export function Brand({ to = '/' }: BrandProps) {
  return (
    <Link className="brand" to={to} aria-label="ÉLECTRO ASSIST 24H — accueil">
      <span className="brand__mark" aria-hidden="true">
        <Zap size={20} strokeWidth={2.4} />
      </span>
      <span>
        <span className="brand__name">ÉLECTRO ASSIST 24H</span>
        <span className="brand__tagline">Électriciens vérifiés · Bénin</span>
      </span>
    </Link>
  )
}
