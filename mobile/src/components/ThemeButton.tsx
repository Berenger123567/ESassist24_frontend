import { Monitor, Moon, Sun } from 'lucide-react-native'
import { Pressable, StyleSheet } from 'react-native'
import { useTheme, useThemedStyles } from '../theme/ThemeProvider'
import { minTouchTarget, radii } from '../theme/tokens'
import type { ThemeColors } from '../theme/tokens'

const LABELS = {
  system: 'Automatique',
  light: 'Clair',
  dark: 'Sombre',
} as const

export function ThemeButton({ inverted = false }: { inverted?: boolean }) {
  const { mode, preference, cyclePreference } = useTheme()
  const styles = useThemedStyles(createStyles)
  const Icon = preference === 'system' ? Monitor : mode === 'dark' ? Moon : Sun

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Thème : ${LABELS[preference]} (${mode === 'dark' ? 'sombre' : 'clair'}). Changer de thème.`}
      onPress={cyclePreference}
      hitSlop={4}
      style={({ pressed }) => [
        styles.button,
        inverted ? styles.inverted : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <Icon size={20} color={inverted ? '#F8FAFC' : undefined} aria-hidden />
    </Pressable>
  )
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    button: {
      width: minTouchTarget,
      height: minTouchTarget,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radii.sm,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface2,
    },
    inverted: {
      borderColor: '#2A3650',
      backgroundColor: '#1B263B',
    },
    pressed: {
      opacity: 0.8,
      transform: [{ scale: 0.97 }],
    },
  })
}
