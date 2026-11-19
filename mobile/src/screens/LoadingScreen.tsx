import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { Brand } from '../components/Brand'
import { useTheme, useThemedStyles } from '../theme/ThemeProvider'
import { fonts, fontSize, spacing } from '../theme/tokens'
import type { ThemeColors } from '../theme/tokens'

export function LoadingScreen({ label = 'Vérification de la session…' }: { label?: string }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)

  return (
    <View style={styles.root} accessibilityLiveRegion="polite">
      <Brand tone="light" />
      <ActivityIndicator color={colors.primary500} style={styles.spinner} />
      <Text style={styles.label}>{label}</Text>
    </View>
  )
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    root: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.md,
      padding: spacing.xl,
      backgroundColor: colors.ink900,
    },
    spinner: {
      marginTop: spacing.base,
    },
    label: {
      fontFamily: fonts.body,
      fontSize: fontSize.caption,
      color: '#94A3B8',
    },
  })
}
