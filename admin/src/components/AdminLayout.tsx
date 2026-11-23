import type { ReactNode } from 'react'
import {
  ClipboardCheck,
  FileSearch,
  Files,
  LayoutDashboard,
  LogOut,
  ScrollText,
  UserCog,
} from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useSession } from '../features/session/session-context'
import { Brand } from './Brand'
import { ThemeToggle } from './ThemeToggle'

const PAGE_TITLES: Record<string, string> = {
  '/app': "Vue d'ensemble",
  '/app/invitations': 'Utilisateurs et invitations',
  '/app/verifications': 'V\u00e9rifications',
  '/app/audit': "Journal d'audit",
}

interface NavItem {
  label: string
  to?: string
  icon: typeof LayoutDashboard
  tag?: string
}

const PILOTAGE: NavItem[] = [
  { label: "Vue d'ensemble", to: '/app', icon: LayoutDashboard },
  { label: 'V\u00e9rifications', to: '/app/verifications', icon: FileSearch },
  { label: "Journal d'audit", to: '/app/audit', icon: ScrollText },
  { label: 'Documents', icon: Files, tag: '\u00c93' },
]

const ORGANISATION: NavItem[] = [
  { label: 'Utilisateurs et invitations', to: '/app/invitations', icon: UserCog },
  { label: '\u00c9valuations', icon: ClipboardCheck, tag: '\u00c94' },
]

function NavList({ items }: { items: NavItem[] }) {
  return (
    <ul className="sidebar__list">
      {items.map(({ label, to, icon: Icon, tag }) => (
        <li key={label}>
          {to ? (
            <NavLink
              className={({ isActive }) =>
                isActive ? 'sidebar__link sidebar__link--active' : 'sidebar__link'
              }
              to={to}
              end
            >
              <Icon size={16} strokeWidth={1.9} aria-hidden="true" />
              {label}
            </NavLink>
          ) : (
            <span className="sidebar__link sidebar__link--muted" aria-disabled="true">
              <Icon size={16} strokeWidth={1.9} aria-hidden="true" />
              {label}
              {tag ? <span className="sidebar__tag">{tag}</span> : null}
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}

export function AdminLayout({ children }: { children?: ReactNode }) {
  const { pathname } = useLocation()
  const { session, signOut } = useSession()
  const pageTitle = PAGE_TITLES[pathname] ?? 'Centre de confiance'

  return (
    <>
      <a className="skip-link" href="#contenu">
        Aller au contenu principal
      </a>

      <div className="admin-shell">
        <aside className="sidebar" aria-label="Navigation de l'administration">
          <div className="sidebar__brand">
            <Brand />
            <span className="sidebar__scope">
              <span className="sidebar__scope-dot" aria-hidden="true" />
              Accès interne
            </span>
          </div>

          <nav className="sidebar__nav" aria-label="Sections">
            <div>
              <p className="sidebar__section-label">Pilotage</p>
              <NavList items={PILOTAGE} />
            </div>
            <div>
              <p className="sidebar__section-label">Organisation</p>
              <NavList items={ORGANISATION} />
            </div>
          </nav>

          <div className="sidebar__footer">
            <strong>Environnement</strong>
            Développement · contrat 106c383
          </div>
        </aside>

        <div className="admin-main">
          <header className="topbar">
            <div className="topbar__crumb">
              <span>Centre de confiance</span>
              <span aria-hidden="true">/</span>
              <strong>{pageTitle}</strong>
            </div>

            <div className="topbar__meta">
              <span className="topbar__env">
                <span className="topbar__env-dot" aria-hidden="true" />
                Développement
              </span>
              <span>{session?.user.roles.join(' · ') ?? 'Session ouverte'}</span>
              <ThemeToggle />
              <button
                className="topbar__signout"
                type="button"
                onClick={() => void signOut()}
                aria-label="Se déconnecter de la console"
              >
                <LogOut size={15} aria-hidden="true" />
                Quitter
              </button>
            </div>
          </header>

          <main id="contenu" className="admin-content">
            {children ?? <Outlet />}
          </main>
        </div>
      </div>
    </>
  )
}
