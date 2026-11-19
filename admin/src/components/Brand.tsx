import { Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

interface BrandProps {
  to?: string
}

export function Brand({ to = '/' }: BrandProps) {
  return (
    <Link className="brand" to={to} aria-label="ÉLECTRO ASSIST 24H — console d'administration">
      <span className="brand__mark" aria-hidden="true">
        <Zap size={18} strokeWidth={2.4} />
      </span>
      <span>
        <span className="brand__name">ÉLECTRO ASSIST 24H</span>
        <span className="brand__tagline">Centre de confiance</span>
      </span>
    </Link>
  )
}
