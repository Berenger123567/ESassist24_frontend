import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { Brand } from './Brand'
import { ThemeToggle } from './ThemeToggle'

export function SiteLayout({ children }: { children?: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#contenu">
        Aller au contenu principal
      </a>

      <header className="site-header">
        <div className="container site-header__inner">
          <Brand />

          <div className="site-header__right">
            <nav className="site-nav" aria-label="Navigation principale">
              <a className="site-nav__link" href="/#parcours">
                Le parcours
              </a>
              <a className="site-nav__link" href="/#socle">
                État du socle
              </a>
            </nav>
            <span className="dev-badge">
              <span className="dev-badge__dot" aria-hidden="true" />
              Version de développement
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main id="contenu">{children ?? <Outlet />}</main>

      <footer className="site-footer">
        <div className="container site-footer__inner">
          <div>
            <Brand />
            <p className="site-footer__note" style={{ marginTop: 18 }}>
              Plateforme de mise en relation entre clients et électriciens vérifiés. Le badge
              « Certifié ÉLECTRO ASSIST » atteste d’une évaluation interne réussie : il ne constitue
              pas un diplôme.
            </p>
          </div>

          <div className="site-footer__meta">
            <span>Étape 1 — identité et accès</span>
            <span>Cotonou, Bénin</span>
            <span>© 2026 ÉLECTRO ASSIST 24H</span>
          </div>
        </div>
      </footer>
    </>
  )
}
