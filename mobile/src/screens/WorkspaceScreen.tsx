import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { FileText, LogOut, MapPin, ShieldCheck } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { ActionButton } from '../components/ActionButton'
import { Brand } from '../components/Brand'
import { FormAlert } from '../components/FormAlert'
import { ThemeButton } from '../components/ThemeButton'
import { ApiError } from '../lib/api/client'
import { useSession } from '../features/session/session-context'
import { getMe, textValue } from '../features/session/session-api'
import type { Me } from '../features/session/session-api'
import { useTheme, useThemedStyles } from '../theme/ThemeProvider'
import { fonts, fontSize, lineHeight, radii, spacing } from '../theme/tokens'
import type { ThemeColors } from '../theme/tokens'
import type { RootStackParamList } from '../navigation/types'

type Props = NativeStackScreenProps<RootStackParamList, 'Espace'>

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '\u2014'
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(date)
}

export function WorkspaceScreen({ navigation }: Props) {
  const { signOut } = useSession()
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)

  const [me, setMe] = useState<Me | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    let active = true

    getMe()
      .then((data) => {
        if (active) setMe(data)
      })
      .catch((cause) => {
        if (active) {
          setError(cause instanceof ApiError ? cause.message : 'Le profil n\u2019a pas pu \u00eatre charg\u00e9.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut()
    } finally {
      setSigningOut(false)
    }
  }

  const displayName = [textValue(me?.firstName), textValue(me?.lastName)]
    .filter(Boolean)
    .join(' ')

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Brand tone="light" compact />
        <ThemeButton inverted />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.badge}>
          <ShieldCheck size={16} color={colors.ink900} aria-hidden />
          <Text style={styles.badgeText}>Session active</Text>
        </View>

        <Text style={styles.title}>
          {displayName ? `Bonjour, ${textValue(me?.firstName)}` : 'Espace personnel'}
        </Text>
        <Text style={styles.lead}>
          Votre session est ouverte. Le jeton d&apos;acc\u00e8s reste en m\u00e9moire et le renouvellement passe
          par le stockage s\u00e9curis\u00e9 de l&apos;appareil.
        </Text>

        {error ? (
          <View style={styles.alertWrap}>
            <FormAlert tone="error" message={error} />
          </View>
        ) : null}

        {loading ? (
          <View style={styles.loadingRow} accessibilityLiveRegion="polite">
            <ActivityIndicator color={colors.primary600} />
            <Text style={styles.muted}>Chargement du profil\u2026</Text>
          </View>
        ) : me ? (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Identit\u00e9</Text>

              <View style={styles.row}>
                <Text style={styles.rowLabel}>Nom</Text>
                <Text style={styles.rowValue}>{displayName || 'Non renseign\u00e9'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>T\u00e9l\u00e9phone</Text>
                <Text style={styles.rowValue}>{me.phone}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Statut</Text>
                <Text style={styles.rowValue}>{me.status}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>R\u00f4les</Text>
                <Text style={styles.rowValue}>{me.roles.join(', ') || '\u2014'}</Text>
              </View>
              <View style={[styles.row, styles.rowLast]}>
                <Text style={styles.rowLabel}>Compte cr\u00e9\u00e9 le</Text>
                <Text style={styles.rowValue}>{formatDate(me.createdAt)}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <MapPin size={18} color={colors.primaryInk} aria-hidden />
                <Text style={styles.cardTitle}>Commune</Text>
              </View>

              {me.zone ? (
                <>
                  <Text style={styles.zoneName}>{me.zone.name}</Text>
                  <Text style={styles.zoneMeta}>
                    {me.zone.department} \u00b7 {me.zone.code}
                  </Text>
                </>
              ) : (
                <Text style={styles.muted}>Aucune commune n\u2019est encore rattach\u00e9e au profil.</Text>
              )}

              <Text style={styles.cardFoot}>
                L\u2019adresse exacte n\u2019est jamais affich\u00e9e ni publi\u00e9e. Seule la zone sert \u00e0 la mise en
                relation.
              </Text>
            </View>
          </>
        ) : null}

        {/* Dossier professionnel — \u00e9tape 2 */}
        <View style={styles.nextCard}>
          <Text style={styles.nextTitle}>Dossier professionnel</Text>
          <Text style={styles.muted}>
            D\u00e9clarez vos sp\u00e9cialit\u00e9s, zones d\u2019intervention et d\u00e9posez vos pi\u00e8ces pour soumettre
            votre dossier au centre de confiance.
          </Text>
        </View>

        <View style={{ marginBottom: spacing.base }}>
          <ActionButton
            label="Acc\u00e9der au dossier"
            tone="secondary"
            onPress={() => navigation.navigate('Dossier')}
            icon={<FileText size={20} color={colors.text} aria-hidden />}
          />
        </View>

        <ActionButton
          label={signingOut ? 'D\u00e9connexion\u2026' : 'Se d\u00e9connecter'}
          tone="secondary"
          onPress={() => void handleSignOut()}
          loading={signingOut}
          icon={<LogOut size={20} color={colors.text} aria-hidden />}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.ink900,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.base,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    scroll: {
      flex: 1,
      backgroundColor: colors.canvas,
      borderTopLeftRadius: radii.xl,
      borderTopRightRadius: radii.xl,
    },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: spacing.xxxl,
    },
    badge: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radii.pill,
      backgroundColor: colors.primary500,
    },
    badgeText: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      color: colors.ink900,
    },
    title: {
      marginTop: spacing.base,
      fontFamily: fonts.headingBold,
      fontSize: fontSize.display,
      lineHeight: lineHeight.display,
      letterSpacing: -0.4,
      color: colors.text,
    },
    lead: {
      marginTop: spacing.sm,
      fontFamily: fonts.body,
      fontSize: fontSize.text,
      lineHeight: lineHeight.text,
      color: colors.text2,
    },
    alertWrap: {
      marginTop: spacing.base,
    },
    loadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.xl,
    },
    card: {
      marginTop: spacing.base,
      padding: spacing.base,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.rule,
      backgroundColor: colors.surface,
    },
    cardTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    cardTitle: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      color: colors.text3,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: spacing.base,
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.rule,
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    rowLabel: {
      fontFamily: fonts.bodyMedium,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      color: colors.text3,
    },
    rowValue: {
      flexShrink: 1,
      textAlign: 'right',
      fontFamily: fonts.body,
      fontSize: fontSize.text,
      lineHeight: lineHeight.text,
      color: colors.text,
    },
    zoneName: {
      marginTop: spacing.md,
      fontFamily: fonts.heading,
      fontSize: fontSize.title,
      lineHeight: lineHeight.title,
      color: colors.text,
    },
    zoneMeta: {
      marginTop: 2,
      fontFamily: fonts.body,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.text2,
    },
    muted: {
      marginTop: spacing.sm,
      fontFamily: fonts.body,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.text2,
    },
    cardFoot: {
      marginTop: spacing.base,
      paddingTop: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.rule,
      fontFamily: fonts.body,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.text3,
    },
    nextCard: {
      marginTop: spacing.base,
      marginBottom: spacing.base,
      padding: spacing.base,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.info,
      borderLeftWidth: 3,
      backgroundColor: colors.infoBg,
    },
    nextTitle: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      color: colors.info,
    },
  })
}
