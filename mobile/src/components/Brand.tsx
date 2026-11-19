import { Zap } from 'lucide-react-native'
import { StyleSheet, Text, View } from 'react-native'
import { useThemedStyles } from '../theme/ThemeProvider'
import { fonts, fontSize, lineHeight, radii, spacing } from '../theme/tokens'
import type { ThemeColors } from '../theme/tokens'

interface BrandProps {
  tone?: 'light' | 'dark'
  compact?: boolean
}

export function Brand({ tone = 'dark', compact = false }: BrandProps) {
  const styles = useThemedStyles(createStyles)
  const isLight = tone === 'light'

  return (
    <View style={styles.root} accessibilityRole="header">
      <View style={styles.mark} accessibilityElementsHidden importantForAccessibility="no">
        <Zap size={compact ? 18 : 20} color="#0F172A" strokeWidth={2.4} />
      </View>
      <View>
        <Text style={[styles.name, isLight ? styles.nameLight : null]}>ÉLECTRO ASSIST 24H</Text>
        {compact ? null : (
          <Text style={[styles.tagline, isLight ? styles.taglineLight : null]}>
            Électricité vérifiée · Bénin
          </Text>
        )}
      </View>
    </View>
  )
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    root: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    mark: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radii.sm,
      backgroundColor: colors.primary500,
    },
    name: {
      fontFamily: fonts.headingBold,
      fontSize: fontSize.text,
      letterSpacing: 0.2,
      lineHeight: lineHeight.text,
      color: colors.text,
    },
    nameLight: {
      color: '#F8FAFC',
    },
    tagline: {
      marginTop: 1,
      fontFamily: fonts.body,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.text3,
    },
    taglineLight: {
      color: '#94A3B8',
    },
  })
}
