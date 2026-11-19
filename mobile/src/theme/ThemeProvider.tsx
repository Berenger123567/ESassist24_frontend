import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { useColorScheme } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { darkColors, lightColors } from './tokens'
import type { ThemeColors, ThemeMode, ThemePreference } from './tokens'

const STORAGE_KEY = 'ea24.theme'

interface ThemeContextValue {
  mode: ThemeMode
  preference: ThemePreference
  colors: ThemeColors
  setPreference: (preference: ThemePreference) => void
  cyclePreference: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function isPreference(value: string | null): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark'
}

/**
 * Thème Doc 2 §3.3 : suit le réglage du téléphone par défaut, avec une option
 * manuelle. La préférence n'est pas sensible et reste dans le stockage local.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme()
  const [preference, setPreferenceState] = useState<ThemePreference>('system')

  useEffect(() => {
    let active = true

    SecureStore.getItemAsync(STORAGE_KEY)
      .then((stored) => {
        if (active && isPreference(stored)) setPreferenceState(stored)
      })
      .catch(() => {
        // Stockage indisponible : on suit le système.
      })

    return () => {
      active = false
    }
  }, [])

  const persist = useCallback((next: ThemePreference) => {
    SecureStore.setItemAsync(STORAGE_KEY, next).catch(() => {
      // La préférence reste en mémoire pour cette exécution.
    })
  }, [])

  const setPreference = useCallback(
    (next: ThemePreference) => {
      setPreferenceState(next)
      persist(next)
    },
    [persist],
  )

  const cyclePreference = useCallback(() => {
    setPreferenceState((current) => {
      const next: ThemePreference =
        current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system'
      persist(next)
      return next
    })
  }, [persist])

  const mode: ThemeMode =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      preference,
      colors: mode === 'dark' ? darkColors : lightColors,
      setPreference,
      cyclePreference,
    }),
    [mode, preference, setPreference, cyclePreference],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext)
  if (!value) throw new Error('useTheme doit être utilisé dans ThemeProvider.')
  return value
}

/** Styles dépendants du thème, recalculés uniquement quand la palette change. */
export function useThemedStyles<T>(factory: (colors: ThemeColors) => T): T {
  const { colors } = useTheme()
  return useMemo(() => factory(colors), [colors, factory])
}
