import { AlertCircle } from 'lucide-react-native'
import type { TextInputProps } from 'react-native'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { useTheme, useThemedStyles } from '../theme/ThemeProvider'
import { fonts, fontSize, lineHeight, minTouchTarget, radii, spacing } from '../theme/tokens'
import type { ThemeColors } from '../theme/tokens'

interface FormFieldProps extends TextInputProps {
  label: string
  hint?: string
  error?: string | null
}

export function FormField({ label, hint, error, style, ...inputProps }: FormFieldProps) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.text3}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...inputProps}
      />
      {error ? (
        <View style={styles.errorRow} accessibilityLiveRegion="polite" accessibilityRole="alert">
          <AlertCircle size={20} color={colors.danger} aria-hidden />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  )
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    field: {
      gap: spacing.sm,
    },
    label: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.text,
      lineHeight: lineHeight.text,
      color: colors.text,
    },
    input: {
      minHeight: minTouchTarget,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
      borderRadius: radii.sm,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      backgroundColor: colors.surface,
      color: colors.text,
      fontFamily: fonts.body,
      fontSize: fontSize.text,
    },
    inputError: {
      borderColor: colors.danger,
    },
    hint: {
      fontFamily: fonts.body,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.text3,
    },
    errorRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 6,
    },
    error: {
      flex: 1,
      fontFamily: fonts.bodyMedium,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.danger,
    },
  })
}
