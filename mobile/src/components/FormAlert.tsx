import { AlertCircle, CheckCircle2, Info } from 'lucide-react-native'
import { StyleSheet, Text, View } from 'react-native'
import { useTheme, useThemedStyles } from '../theme/ThemeProvider'
import { fonts, fontSize, lineHeight, radii, spacing } from '../theme/tokens'
import type { ThemeColors } from '../theme/tokens'

type AlertTone = 'error' | 'info' | 'success'

export function FormAlert({ tone = 'info', message }: { tone?: AlertTone; message: string }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const Icon = tone === 'error' ? AlertCircle : tone === 'success' ? CheckCircle2 : Info
  const iconColor =
    tone === 'error' ? colors.danger : tone === 'success' ? colors.success : colors.info

  return (
    <View
      style={[
        styles.root,
        tone === 'error' ? styles.error : null,
        tone === 'info' ? styles.info : null,
        tone === 'success' ? styles.success : null,
      ]}
      accessibilityRole={tone === 'error' ? 'alert' : 'text'}
      accessibilityLiveRegion="polite"
    >
      <Icon size={20} color={iconColor} aria-hidden />
      <Text
        style={[
          styles.text,
          tone === 'error' ? styles.textError : null,
          tone === 'info' ? styles.textInfo : null,
          tone === 'success' ? styles.textSuccess : null,
        ]}
      >
        {message}
      </Text>
    </View>
  )
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    root: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
      padding: spacing.base,
      borderRadius: radii.sm,
      borderWidth: 1,
      borderLeftWidth: 3,
    },
    error: {
      backgroundColor: colors.dangerBg,
      borderColor: colors.danger,
    },
    info: {
      backgroundColor: colors.infoBg,
      borderColor: colors.info,
    },
    success: {
      backgroundColor: colors.successBg,
      borderColor: colors.success,
    },
    text: {
      flex: 1,
      fontFamily: fonts.body,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
    },
    textError: { color: colors.danger },
    textInfo: { color: colors.info },
    textSuccess: { color: colors.success },
  })
}
