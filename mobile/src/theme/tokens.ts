/**
 * Design tokens — ÉLECTRO ASSIST 24H (mobile)
 *
 * Source de vérité : Document 2 « Normes et standards » §3 (19 novembre 2026).
 * Thème ambre électrique sur encre, Inter uniquement, grille d'espacement 4,
 * mode clair et mode sombre. Mêmes valeurs sémantiques que le web.
 */

export type ThemeMode = 'light' | 'dark'
export type ThemePreference = 'system' | 'light' | 'dark'

export interface ThemeColors {
  canvas: string
  surface: string
  surface2: string
  surface3: string
  border: string
  borderStrong: string
  rule: string

  text: string
  text2: string
  text3: string
  textInverse: string

  primary500: string
  primary600: string
  primary100: string
  primaryInk: string

  action: string
  success: string
  successBg: string
  warning: string
  warningBg: string
  danger: string
  dangerBg: string
  info: string
  infoBg: string

  white: string
  overlay: string
  /** Encre fixe pour le texte posé sur l'ambre, quel que soit le thème. */
  ink900: string
}

export const lightColors: ThemeColors = {
  canvas: '#F1F5F9',
  surface: '#FFFFFF',
  surface2: '#F8FAFC',
  surface3: '#E7EDF5',
  border: '#CBD5E1',
  borderStrong: '#64748B',
  rule: '#CBD5E1',

  text: '#0F172A',
  text2: '#334155',
  text3: '#64748B',
  textInverse: '#F8FAFC',

  primary500: '#FFB300',
  primary600: '#E69A00',
  primary100: '#FFF3CD',
  primaryInk: '#B45309',

  action: '#2563EB',
  success: '#15803D',
  successBg: '#DCFCE7',
  warning: '#B45309',
  warningBg: '#FEF3C7',
  danger: '#DC2626',
  dangerBg: '#FEE2E2',
  info: '#0369A1',
  infoBg: '#E0F2FE',

  white: '#FFFFFF',
  overlay: 'rgba(15, 23, 42, 0.45)',
  ink900: '#0F172A',
}

export const darkColors: ThemeColors = {
  canvas: '#0B1220',
  surface: '#111A2E',
  surface2: '#1B263B',
  surface3: '#243049',
  border: '#2A3650',
  borderStrong: '#3A4868',
  rule: '#2A3650',

  text: '#F8FAFC',
  text2: '#94A3B8',
  text3: '#94A3B8',
  textInverse: '#0B1220',

  primary500: '#FFB300',
  primary600: '#FFC233',
  primary100: '#3A2E0C',
  primaryInk: '#FBBF24',

  action: '#60A5FA',
  success: '#4ADE80',
  successBg: '#0C2A1A',
  warning: '#FBBF24',
  warningBg: '#3A2A0C',
  danger: '#F87171',
  dangerBg: '#3B1216',
  info: '#38BDF8',
  infoBg: '#0B2A3F',

  white: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.6)',
  ink900: '#0F172A',
}

/** Grille de base 4 : 4, 8, 12, 16, 24, 32, 48. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 48,
} as const

/** Champs 8, cartes 12, panneaux du bas 16, pastilles 999. */
export const radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 12,
  xl: 16,
  pill: 999,
} as const

/** Échelle Doc 2 : 13/18, 16/24, 18/24, 22/28, 28/34, bouton 16. */
export const fontSize = {
  caption: 13,
  text: 16,
  subtitle: 18,
  title: 22,
  display: 28,
  button: 16,
  xs: 13,
  sm: 16,
  base: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
} as const

export const lineHeight = {
  caption: 18,
  text: 24,
  subtitle: 24,
  title: 28,
  display: 34,
} as const

/** Cible tactile minimale imposée par le Document 2 (48 dp). */
export const minTouchTarget = 48

/** Inter uniquement, embarquée avec l'application via expo-font. */
export const fonts = {
  heading: 'Inter_600SemiBold',
  headingBold: 'Inter_700Bold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
} as const

/** Durées Doc 2 §4, en millisecondes. */
export const motion = {
  touch: 100,
  state: 150,
  appear: 200,
  sheet: 280,
  screen: 250,
  skeleton: 1200,
} as const

export function getShadows(mode: ThemeMode) {
  if (mode === 'dark') {
    // En mode sombre, la surface distingue les niveaux plutôt que l'ombre.
    return {
      card: {},
      sheet: {},
      modal: {},
    } as const
  }

  return {
    card: {
      shadowColor: '#0F172A',
      shadowOpacity: 0.06,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
      elevation: 2,
    },
    sheet: {
      shadowColor: '#0F172A',
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    modal: {
      shadowColor: '#0F172A',
      shadowOpacity: 0.18,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 18 },
      elevation: 16,
    },
  } as const
}
