import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ArrowRight, CheckCircle2, KeyRound, ShieldCheck, Smartphone } from 'lucide-react-native'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { ActionButton } from '../components/ActionButton'
import { Brand } from '../components/Brand'
import { StatusRow } from '../components/StatusRow'
import { ThemeButton } from '../components/ThemeButton'
import { useTheme, useThemedStyles } from '../theme/ThemeProvider'
import { fonts, fontSize, lineHeight, radii, spacing } from '../theme/tokens'
import type { ThemeColors } from '../theme/tokens'
import type { RootStackParamList } from '../navigation/types'

type Props = NativeStackScreenProps<RootStackParamList, 'Accueil'>

const MILESTONES = [
  {
    label: 'Contrat API',
    detail: 'OpenAPI et mock Prism disponibles',
    state: 'Prêt',
    tone: 'done' as const,
  },
  {
    label: 'Application web',
    detail: 'React, Vite et TypeScript',
    state: 'Livré',
    tone: 'done' as const,
  },
  {
    label: "Console d'administration",
    detail: 'Coquille et garde de session',
    state: 'Livré',
    tone: 'done' as const,
  },
  {
    label: 'Application mobile',
    detail: 'Expo, navigation, connexion et profil',
    state: 'Livré',
    tone: 'done' as const,
  },
]

const FOUNDATIONS = [
  {
    icon: Smartphone,
    title: 'Navigation et garde',
    detail: 'Parcours public et espace protégé séparés dès le premier écran.',
  },
  {
    icon: ShieldCheck,
    title: 'Client conforme',
    detail: 'Types générés depuis OpenAPI, erreurs normatives, idempotence.',
  },
  {
    icon: KeyRound,
    title: 'Accès réel, sans simulation',
    detail: 'Téléphone, code à 6 chiffres et profil branchés sur le contrat et le mock.',
  },
]

export function HomeScreen({ navigation }: Props) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <Brand tone="light" />
            <ThemeButton inverted />
          </View>

          <View style={styles.kickerRow}>
            <View style={styles.kickerDot} />
            <Text style={styles.kicker}>Mise en relation · République du Bénin</Text>
          </View>

          <Text style={styles.title}>
            Un électricien vérifié.{'\n'}
            <Text style={styles.titleAccent}>Une intervention tracée.</Text>
          </Text>

          <Text style={styles.lead}>
            Dossier validé avant toute mission, devis accepté avant les travaux, compte rendu et
            avis authentifié après l’intervention.
          </Text>

          <View style={styles.ctaRow}>
            <ActionButton
              label="Se connecter"
              onPress={() => navigation.navigate('Connexion')}
              icon={<ArrowRight size={20} color="#0F172A" />}
              accessibilityHint="Ouvre l’écran de connexion"
            />
          </View>

          <Text style={styles.heroNote}>
            Aucun compte de démonstration. Le parcours réel commence avec l’étape 1.
          </Text>
        </View>

        <View style={styles.boardWrap}>
          <View style={styles.board}>
            <View style={styles.boardHead}>
              <Text style={styles.boardTitle}>Mise en service</Text>
              <Text style={styles.boardRef}>Étape 0</Text>
            </View>

            {MILESTONES.map((row) => (
              <StatusRow
                key={row.label}
                label={row.label}
                detail={row.detail}
                state={row.state}
                tone={row.tone}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionKicker}>Socle mobile</Text>
          <Text style={styles.sectionTitle}>Ce qui est déjà en place.</Text>

          <View style={styles.foundations}>
            {FOUNDATIONS.map(({ icon: Icon, title, detail }) => (
              <View style={styles.foundation} key={title}>
                <View style={styles.foundationIcon}>
                  <Icon size={20} color={colors.primaryInk} strokeWidth={2} />
                </View>
                <View style={styles.foundationBody}>
                  <Text style={styles.foundationTitle}>{title}</Text>
                  <Text style={styles.foundationDetail}>{detail}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionKicker}>Étape 1</Text>
          <Text style={styles.sectionTitle}>La connexion, sans raccourci.</Text>

          <View style={styles.nextPanel}>
            <View style={styles.nextHead}>
              <Text style={styles.nextBadge}>C-01 → C-03 · livré</Text>
              <CheckCircle2 size={20} color={colors.success} aria-hidden />
            </View>

            <View style={styles.nextList}>
              <View style={styles.nextItem}>
                <CheckCircle2 size={20} color={colors.success} aria-hidden />
                <Text style={styles.nextText}>
                  Numéro béninois à 10 chiffres (01…), puis code à 6 chiffres valable 5 minutes.
                </Text>
              </View>
              <View style={styles.nextItem}>
                <CheckCircle2 size={20} color={colors.success} aria-hidden />
                <Text style={styles.nextText}>
                  WhatsApp par défaut, SMS disponible. Trois tentatives, sans révéler si un numéro
                  existe.
                </Text>
              </View>
              <View style={styles.nextItem}>
                <CheckCircle2 size={20} color={colors.success} aria-hidden />
                <Text style={styles.nextText}>
                  Profil : prénom, nom et commune choisis dans le référentiel du serveur.
                </Text>
              </View>
            </View>

            <Text style={styles.nextNote}>
              La prochaine livraison est le dossier professionnel, les zones d’intervention et les
              documents justificatifs (étape 2).
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerBrand}>ÉLECTRO ASSIST 24H</Text>
          <Text style={styles.footerMeta}>Cotonou · Contrat API 106c383 · Version 0.0.0</Text>
        </View>
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
    scroll: {
      backgroundColor: colors.canvas,
    },
    hero: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.base,
      paddingBottom: spacing.xxl + spacing.base,
      backgroundColor: colors.ink900,
    },
    heroTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.base,
    },
    kickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.xxl,
    },
    kickerDot: {
      width: 24,
      height: 2,
      backgroundColor: colors.primary500,
    },
    kicker: {
      flex: 1,
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: '#94A3B8',
    },
    title: {
      marginTop: spacing.md,
      fontFamily: fonts.headingBold,
      fontSize: fontSize.display,
      lineHeight: lineHeight.display,
      letterSpacing: -0.4,
      color: '#F8FAFC',
    },
    titleAccent: {
      color: colors.primary500,
    },
    lead: {
      marginTop: spacing.base,
      maxWidth: 520,
      fontFamily: fonts.body,
      fontSize: fontSize.text,
      lineHeight: lineHeight.text,
      color: '#CBD5E1',
    },
    ctaRow: {
      marginTop: spacing.xl,
      alignItems: 'stretch',
    },
    heroNote: {
      marginTop: spacing.md,
      fontFamily: fonts.body,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: '#94A3B8',
    },
    boardWrap: {
      paddingHorizontal: spacing.base,
      marginTop: -spacing.lg,
    },
    board: {
      paddingHorizontal: spacing.base,
      paddingTop: spacing.xs,
      paddingBottom: spacing.xs,
      borderRadius: radii.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.rule,
    },
    boardHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.rule,
    },
    boardTitle: {
      fontFamily: fonts.heading,
      fontSize: fontSize.text,
      lineHeight: lineHeight.text,
      color: colors.text,
    },
    boardRef: {
      fontFamily: fonts.bodyMedium,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: colors.text3,
    },
    section: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xxl,
    },
    sectionKicker: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: colors.primaryInk,
    },
    sectionTitle: {
      marginTop: spacing.sm,
      fontFamily: fonts.heading,
      fontSize: fontSize.title,
      lineHeight: lineHeight.title,
      letterSpacing: -0.2,
      color: colors.text,
    },
    foundations: {
      marginTop: spacing.base,
      gap: spacing.sm,
    },
    foundation: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
      padding: spacing.base,
      borderRadius: radii.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.rule,
    },
    foundationIcon: {
      width: 40,
      height: 40,
      borderRadius: radii.sm,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary100,
    },
    foundationBody: {
      flex: 1,
      minWidth: 0,
    },
    foundationTitle: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.text,
      lineHeight: lineHeight.text,
      color: colors.text,
    },
    foundationDetail: {
      marginTop: 2,
      fontFamily: fonts.body,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.text2,
    },
    nextPanel: {
      marginTop: spacing.base,
      padding: spacing.base,
      borderRadius: radii.md,
      backgroundColor: colors.infoBg,
      borderWidth: 1,
      borderColor: colors.info,
      borderLeftWidth: 3,
    },
    nextHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    nextBadge: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: colors.info,
    },
    nextList: {
      marginTop: spacing.md,
      gap: spacing.sm,
    },
    nextItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    nextText: {
      flex: 1,
      fontFamily: fonts.body,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.text2,
    },
    nextNote: {
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.rule,
      fontFamily: fonts.body,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.text3,
    },
    footer: {
      marginTop: spacing.xxl,
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xxl,
    },
    footerBrand: {
      fontFamily: fonts.heading,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      letterSpacing: 0.6,
      color: colors.text,
    },
    footerMeta: {
      marginTop: 2,
      fontFamily: fonts.body,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.text3,
    },
  })
}
