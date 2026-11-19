import { Monitor, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  applyTheme,
  nextThemePreference,
  readThemePreference,
  storeThemePreference,
  systemTheme,
} from '../features/theme/theme'
import type { ResolvedTheme, ThemePreference } from '../features/theme/theme'

const LABELS: Record<ThemePreference, string> = {
  system: 'Automatique',
  light: 'Clair',
  dark: 'Sombre',
}

export function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>(readThemePreference)
  const [system, setSystem] = useState<ResolvedTheme>(() => systemTheme())

  useEffect(() => {
    applyTheme(preference)
  }, [preference])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystem(media.matches ? 'dark' : 'light')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const resolved = preference === 'system' ? system : preference

  function cycle() {
    const next = nextThemePreference(preference)
    setPreference(next)
    storeThemePreference(next)
  }

  const Icon = preference === 'system' ? Monitor : resolved === 'dark' ? Moon : Sun

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={cycle}
      aria-label={`Thème : ${LABELS[preference]} (${resolved === 'dark' ? 'sombre' : 'clair'}). Changer de thème.`}
      title={`Thème : ${LABELS[preference]}`}
    >
      <Icon size={20} aria-hidden="true" />
      <span>{LABELS[preference]}</span>
    </button>
  )
}
