import { CheckCircle2, Circle, CircleDashed, Clock3 } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useTheme, useThemedStyles } from '../theme/ThemeProvider'
import { fonts, fontSize, lineHeight, radii, spacing } from '../theme/tokens'
import type { ThemeColors } from '../theme/tokens'

interface StatusRowProps {
  label: string
  detail: string
  state: string
  tone: 'done' | 'active' | 'next' | 'wait'
  icon?: ReactNode
}

export function StatusRow({ label, detail, state, tone, icon }: StatusRowProps) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const Icon =
    tone === 'done'
      ? CheckCircle2
      : tone === 'active'
        ? Clock3
        : tone === 'next'
          ? CircleDashed
          : Circle

  const badgeStyle =
    tone === 'done'
      ? styles.badgeDone
      : tone === 'active' || tone === 'next'
        ? styles.badgeNext
        : styles.badgeWait
  const badgeTextStyle =
    tone === 'done'
      ? styles.badgeTextDone
      : tone === 'active' || tone === 'next'
        ? styles.badgeTextNext
        : styles.badgeTextWait
  const badgeColor =
    tone === 'done' ? colors.success : tone === 'active' || tone === 'next' ? colors.warning : colors.text3

  return (
    <View style={styles.row}>
      <View style={[styles.dot, tone === 'done' ? styles.dotDone : styles.dotNext]} aria-hidden />
      <View style={styles.body}>
        <View style={styles.line}>
          <Text style={styles.label}>{label}</Text>
          {icon}
        </View>
        <Text style={styles.detail}>{detail}</Text>
      </View>
      <View style={[styles.badge, badgeStyle]}>
        <Icon size={16} color={badgeColor} aria-hidden />
        <Text style={[styles.badgeText, badgeTextStyle]}>{state}</Text>
      </View>
    </View>
  )
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.rule,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginTop: 8,
    },
    dotDone: { backgroundColor: colors.success },
    dotNext: { backgroundColor: colors.primary500 },
    body: {
      flex: 1,
      minWidth: 0,
    },
    line: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    label: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.text,
      lineHeight: lineHeight.text,
      color: colors.text,
    },
    detail: {
      marginTop: 2,
      fontFamily: fonts.body,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.text2,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radii.pill,
      borderWidth: 1,
    },
    badgeDone: {
      borderColor: colors.success,
      backgroundColor: colors.successBg,
    },
    badgeNext: {
      borderColor: colors.warning,
      backgroundColor: colors.warningBg,
    },
    badgeWait: {
      borderColor: colors.border,
      backgroundColor: colors.surface2,
    },
    badgeText: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
    },
    badgeTextDone: { color: colors.success },
    badgeTextNext: { color: colors.warning },
    badgeTextWait: { color: colors.text3 },
  })
}
