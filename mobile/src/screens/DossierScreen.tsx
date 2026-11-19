import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { CheckCircle2, ChevronRight, Clock3, FileText, ShieldAlert, UserRound } from 'lucide-react-native'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Brand } from '../components/Brand'
import { FormAlert } from '../components/FormAlert'
import { ThemeButton } from '../components/ThemeButton'
import { ApiError } from '../lib/api/client'
import { getProfessionalProfile, listDocuments } from '../features/session/session-api'
import type { DocumentDto, ProfessionalProfile } from '../features/session/session-api'
import { useTheme, useThemedStyles } from '../theme/ThemeProvider'
import { fonts, fontSize, lineHeight, radii, spacing } from '../theme/tokens'
import type { ThemeColors } from '../theme/tokens'
import type { RootStackParamList } from '../navigation/types'

type Props = NativeStackScreenProps<RootStackParamList, 'Dossier'>

const STATUS_META: Record<string, { label: string; colorKey: keyof ThemeColors }> = {
  PENDING: { label: 'En attente', colorKey: 'warning' },
  APPROVED: { label: 'Approuv\u00e9', colorKey: 'success' },
  REJECTED: { label: 'Refus\u00e9', colorKey: 'danger' },
}

function docStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'En attente',
    SUBMITTED: 'Soumis',
    APPROVED: 'Approuv\u00e9',
    REJECTED: 'Refus\u00e9',
    EXPIRED: 'Expir\u00e9',
  }
  return map[status] ?? status
}

function docTypeLabel(type: string): string {
  const map: Record<string, string> = {
    ID_CARD: 'Carte d\u2019identit\u00e9',
    PROFILE_PHOTO: 'Photo de profil',
    DIPLOMA: 'Dipl\u00f4me',
    PROFESSIONAL_CERTIFICATE: 'Certificat professionnel',
    REFERENCE_LETTER: 'Lettre de r\u00e9f\u00e9rence',
    WORK_PHOTO: 'Photo de chantier',
  }
  return map[type] ?? type
}

export function DossierScreen({ navigation }: Props) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)

  const [profile, setProfile] = useState<ProfessionalProfile | null>(null)
  const [docs, setDocs] = useState<DocumentDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    let active = true
    setLoading(true)
    setError(null)

    Promise.all([getProfessionalProfile(), listDocuments()])
      .then(([prof, documents]) => {
        if (!active) return
        setProfile(prof)
        setDocs(documents)
      })
      .catch((cause) => {
        if (!active) return
        setError(
          cause instanceof ApiError
            ? cause.message
            : 'Le dossier n\u2019a pas pu \u00eatre charg\u00e9.',
        )
      })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [])

  useEffect(() => { const cleanup = load(); return cleanup }, [load])

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load)
    return unsubscribe
  }, [navigation, load])

  const statusMeta = profile ? (STATUS_META[profile.status] ?? STATUS_META['PENDING']) : null

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <StatusBar style="auto" />

      <View style={styles.header}>
        <Brand compact />
        <ThemeButton />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.pageHead}>
          <Text style={styles.kicker}>Étape 2 · E-02</Text>
          <Text style={styles.title}>Dossier professionnel</Text>
          <Text style={styles.lead}>
            Sp\u00e9cialit\u00e9s, zones d\u2019intervention et pi\u00e8ces justificatives examin\u00e9es par le centre de
            confiance avant toute mission.
          </Text>
          {profile && statusMeta ? (
            <View style={[styles.statusBadge, { borderColor: colors[statusMeta.colorKey] as string }]}>
              <Text style={[styles.statusLabel, { color: colors[statusMeta.colorKey] as string }]}>
                {statusMeta.label}
              </Text>
            </View>
          ) : null}
        </View>

        {error ? (
          <FormAlert tone="error" message={error} />
        ) : loading ? (
          <View style={styles.loadingRow} accessibilityLiveRegion="polite">
            <ActivityIndicator color={colors.primary600} />
            <Text style={styles.muted}>Chargement\u2026</Text>
          </View>
        ) : (
          <>
            <Pressable
              style={styles.card}
              accessibilityRole="button"
              accessibilityLabel="Profil professionnel"
              onPress={() => navigation.navigate('ProfilPro')}
            >
              <View style={styles.cardHead}>
                <View style={styles.cardTitleRow}>
                  <UserRound size={18} color={colors.primaryInk} aria-hidden />
                  <Text style={styles.cardTitle}>Profil professionnel</Text>
                </View>
                <ChevronRight size={18} color={colors.text3} aria-hidden />
              </View>

              {profile ? (
                <>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Exp\u00e9rience</Text>
                    <Text style={styles.rowValue}>{profile.experienceYears} ans</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Sp\u00e9cialit\u00e9s</Text>
                    <Text style={[styles.rowValue, styles.rowValueWrap]}>
                      {profile.specialties.length > 0
                        ? profile.specialties.map((s) => s.label).join(', ')
                        : '\u2014'}
                    </Text>
                  </View>
                  <View style={[styles.row, styles.rowLast]}>
                    <Text style={styles.rowLabel}>Zones</Text>
                    <Text style={[styles.rowValue, styles.rowValueWrap]}>
                      {profile.zones.length > 0
                        ? profile.zones.map((z) => z.name).join(', ')
                        : '\u2014'}
                    </Text>
                  </View>
                </>
              ) : (
                <Text style={styles.empty}>
                  Aucun profil. Appuyez pour renseigner vos sp\u00e9cialit\u00e9s et zones.
                </Text>
              )}
            </Pressable>

            <Pressable
              style={[styles.card, { marginTop: spacing.base }]}
              accessibilityRole="button"
              accessibilityLabel="Pi\u00e8ces justificatives"
              onPress={() => navigation.navigate('Documents')}
            >
              <View style={styles.cardHead}>
                <View style={styles.cardTitleRow}>
                  <FileText size={18} color={colors.primaryInk} aria-hidden />
                  <Text style={styles.cardTitle}>Pi\u00e8ces justificatives</Text>
                </View>
                <ChevronRight size={18} color={colors.text3} aria-hidden />
              </View>

              {docs.length > 0 ? (
                docs.slice(0, 4).map((doc) => {
                  const docColor =
                    doc.status === 'APPROVED'
                      ? colors.success
                      : doc.status === 'REJECTED'
                        ? colors.danger
                        : colors.warning
                  return (
                    <View key={doc.id} style={styles.docRow}>
                      <FileText size={15} color={colors.text3} aria-hidden />
                      <Text style={styles.docName} numberOfLines={1}>
                        {docTypeLabel(doc.type)}
                      </Text>
                      <Text style={[styles.docStatus, { color: docColor }]}>
                        {docStatusLabel(doc.status)}
                      </Text>
                    </View>
                  )
                })
              ) : (
                <Text style={styles.empty}>
                  Aucune pi\u00e8ce d\u00e9pos\u00e9e. Appuyez pour t\u00e9l\u00e9verser vos documents.
                </Text>
              )}
              {docs.length > 4 ? (
                <Text style={styles.muted}>+{docs.length - 4} autre(s)\u2026</Text>
              ) : null}
            </Pressable>

            {profile?.decisionReason ? (
              <View style={styles.decisionCard}>
                <ShieldAlert size={18} color={colors.danger} aria-hidden />
                <View style={styles.decisionBody}>
                  <Text style={styles.decisionTitle}>Motif de la d\u00e9cision</Text>
                  <Text style={styles.decisionText}>{typeof profile.decisionReason === 'string' ? profile.decisionReason : ''}</Text>
                </View>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.canvas },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.base,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.rule,
    },
    scroll: { flex: 1 },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: spacing.xxxl,
    },
    pageHead: { marginBottom: spacing.lg },
    kicker: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: colors.primaryInk,
    },
    title: {
      marginTop: spacing.sm,
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
    statusBadge: {
      alignSelf: 'flex-start',
      marginTop: spacing.base,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radii.pill,
      borderWidth: 1,
    },
    statusLabel: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
    },
    loadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.xl,
    },
    muted: {
      fontFamily: fonts.body,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.text3,
    },
    card: {
      padding: spacing.base,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.rule,
      backgroundColor: colors.surface,
    },
    cardHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: spacing.md,
      marginBottom: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.rule,
    },
    cardTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    cardTitle: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.text,
      lineHeight: lineHeight.text,
      color: colors.text,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.base,
      paddingVertical: spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.rule,
    },
    rowLast: { borderBottomWidth: 0 },
    rowLabel: {
      fontFamily: fonts.bodyMedium,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      color: colors.text3,
    },
    rowValue: {
      fontFamily: fonts.body,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.text,
      textAlign: 'right',
      flexShrink: 1,
    },
    rowValueWrap: { flexShrink: 1 },
    empty: {
      marginTop: spacing.sm,
      fontFamily: fonts.body,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.text2,
    },
    docRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.rule,
    },
    docName: {
      flex: 1,
      fontFamily: fonts.body,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.text,
    },
    docStatus: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
    },
    decisionCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
      marginTop: spacing.base,
      padding: spacing.base,
      borderRadius: radii.md,
      borderWidth: 1,
      borderLeftWidth: 3,
      borderColor: colors.danger,
      backgroundColor: colors.dangerBg,
    },
    decisionBody: { flex: 1, minWidth: 0 },
    decisionTitle: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.danger,
    },
    decisionText: {
      marginTop: spacing.xs,
      fontFamily: fonts.body,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.text2,
    },
  })
}
