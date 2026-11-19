import type { ReactNode } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { useTheme, useThemedStyles } from '../theme/ThemeProvider'
import { fonts, fontSize, minTouchTarget, radii, spacing } from '../theme/tokens'
import type { ThemeColors } from '../theme/tokens'

type ButtonTone = 'primary' | 'secondary' | 'text' | 'danger'

interface ActionButtonProps {
  label: string
  onPress: () => void
  tone?: ButtonTone
  icon?: ReactNode
  accessibilityHint?: string
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
}

export function ActionButton({
  label,
  onPress,
  tone = 'primary',
  icon,
  accessibilityHint,
  disabled = false,
  loading = false,
  fullWidth = true,
}: ActionButtonProps) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const blocked = disabled || loading

  const contentColor =
    tone === 'primary'
      ? colors.ink900
      : tone === 'danger'
        ? colors.white
        : tone === 'secondary'
          ? colors.text
          : colors.action

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: blocked, busy: loading }}
      disabled={blocked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        fullWidth ? styles.fullWidth : null,
        tone === 'primary' ? styles.primary : null,
        tone === 'secondary' ? styles.secondary : null,
        tone === 'text' ? styles.text : null,
        tone === 'danger' ? styles.danger : null,
        pressed && !blocked ? styles.pressed : null,
        blocked ? styles.blocked : null,
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={contentColor} /> : null}
      <Text
        style={[
          styles.label,
          tone === 'primary' ? styles.labelPrimary : null,
          tone === 'secondary' ? styles.labelSecondary : null,
          tone === 'text' ? styles.labelText : null,
          tone === 'danger' ? styles.labelDanger : null,
        ]}
      >
        {label}
      </Text>
      {icon && !loading ? <View style={styles.icon}>{icon}</View> : null}
    </Pressable>
  )
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    base: {
      minHeight: minTouchTarget,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: radii.sm,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    fullWidth: {
      width: '100%',
    },
    primary: {
      backgroundColor: colors.primary500,
      borderColor: colors.primary500,
    },
    secondary: {
      borderColor: colors.borderStrong,
      backgroundColor: 'transparent',
    },
    text: {
      borderColor: 'transparent',
      backgroundColor: 'transparent',
      paddingHorizontal: spacing.md,
    },
    danger: {
      backgroundColor: colors.danger,
      borderColor: colors.danger,
    },
    pressed: {
      opacity: 0.9,
      transform: [{ scale: 0.97 }],
    },
    blocked: {
      opacity: 0.5,
    },
    label: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.button,
      lineHeight: 24,
    },
    labelPrimary: {
      color: colors.ink900,
    },
    labelSecondary: {
      color: colors.text,
    },
    labelText: {
      color: colors.action,
    },
    labelDanger: {
      color: colors.white,
    },
    icon: {
      marginLeft: 2,
    },
  })
}
