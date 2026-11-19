import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import {
  ArrowLeft,
  Check,
  KeyRound,
  MessageCircle,
  MessageSquare,
  ShieldCheck,
  Smartphone,
} from 'lucide-react-native'
import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { ActionButton } from '../components/ActionButton'
import { Brand } from '../components/Brand'
import { FormAlert } from '../components/FormAlert'
import { FormField } from '../components/FormField'
import { ThemeButton } from '../components/ThemeButton'
import { ApiError } from '../lib/api/client'
import { requestOtp } from '../features/session/session-api'
import type { OtpChannel } from '../features/session/session-api'
import { useTheme, useThemedStyles } from '../theme/ThemeProvider'
import { fonts, fontSize, lineHeight, minTouchTarget, radii, spacing } from '../theme/tokens'
import type { ThemeColors } from '../theme/tokens'
import type { RootStackParamList } from '../navigation/types'

type Props = NativeStackScreenProps<RootStackParamList, 'Connexion'>

const CHANNELS: { value: OtpChannel; label: string }[] = [
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'SMS', label: 'SMS' },
]

function normalizePhone(raw: string): string {
  const compact = raw.replace(/[\s.\-()]/g, '')

  if (compact.startsWith('00229')) return `+229${compact.slice(5)}`
  if (/^01\d{8}$/.test(compact)) return `+229${compact}`
  return compact
}

function isBeninPhone(value: string): boolean {
  // Bénin : 10 chiffres commençant par 01, précédés de l'indicatif +229.
  return /^\+22901\d{8}$/.test(value)
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return 'Une erreur inattendue est survenue. Réessayez dans un instant.'
}

export function PhoneScreen({ navigation }: Props) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)

  const [phone, setPhone] = useState('')
  const [channel, setChannel] = useState<OtpChannel>('WHATSAPP')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setError(null)

    const normalized = normalizePhone(phone)
    if (!isBeninPhone(normalized)) {
      setError(
        'Saisissez un numéro béninois à 10 chiffres commençant par 01, par exemple +229 01 97 00 00 00.',
      )
      return
    }

    setPending(true)
    try {
      const result = await requestOtp(normalized, channel)
      setPhone(normalized)
      navigation.navigate('Verification', {
        phone: normalized,
        channel,
        resendAfterSeconds: result.resendAfterSeconds ?? result.retryAfterSeconds ?? 60,
        expiresInSeconds: result.expiresInSeconds ?? 300,
      })
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setPending(false)
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="auto" />

      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour à l’accueil"
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={styles.backButton}
        >
          <ArrowLeft size={20} color={colors.text2} aria-hidden />
          <Text style={styles.backLabel}>Retour</Text>
        </Pressable>

        <View style={styles.headerRight}>
          <Brand compact />
          <ThemeButton />
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>Étape 1 · C-01</Text>
          </View>

          <Text style={styles.title}>Se connecter</Text>
          <Text style={styles.lead}>
            Un code à 6 chiffres confirme votre numéro. Aucun mot de passe n’est demandé au client.
          </Text>

          {error ? <FormAlert tone="error" message={error} /> : null}

          <View style={styles.form}>
            <FormField
              label="Numéro de téléphone"
              value={phone}
              onChangeText={setPhone}
              placeholder="+229 01 97 00 00 00"
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              maxLength={20}
              hint="10 chiffres commençant par 01, indicatif +229 inclus. Le numéro complet n’apparaît jamais dans les journaux."
              onSubmitEditing={() => void handleSubmit()}
              returnKeyType="send"
            />

            <View style={styles.channel}>
              <Text style={styles.label}>Canal d’envoi du code</Text>
              <View style={styles.channelRow}>
                {CHANNELS.map(({ value, label }) => {
                  const selected = channel === value
                  const Icon = value === 'WHATSAPP' ? MessageCircle : MessageSquare

                  return (
                    <Pressable
                      key={value}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selected }}
                      accessibilityLabel={label}
                      onPress={() => setChannel(value)}
                      style={({ pressed }) => [
                        styles.channelOption,
                        selected ? styles.channelOptionActive : null,
                        pressed ? styles.channelOptionPressed : null,
                      ]}
                    >
                      <Icon
                        size={20}
                        color={selected ? colors.primaryInk : colors.text2}
                        aria-hidden
                      />
                      <Text
                        style={[
                          styles.channelLabel,
                          selected ? styles.channelLabelActive : null,
                        ]}
                      >
                        {label}
                      </Text>
                      {selected ? <Check size={20} color={colors.primaryInk} aria-hidden /> : null}
                    </Pressable>
                  )
                })}
              </View>
              <Text style={styles.hint}>
                WhatsApp est proposé par défaut. Le SMS reste disponible si WhatsApp n’est pas
                installé sur le téléphone.
              </Text>
            </View>

            <ActionButton
              label={pending ? 'Envoi en cours…' : 'Recevoir le code'}
              onPress={() => void handleSubmit()}
              loading={pending}
              icon={<Smartphone size={20} color={colors.ink900} aria-hidden />}
            />
          </View>

          <View style={styles.facts}>
            <View style={styles.fact}>
              <ShieldCheck size={20} color={colors.text2} aria-hidden />
              <Text style={styles.factText}>
                Session courte, renouvellement par stockage sécurisé sur l’appareil.
              </Text>
            </View>
            <View style={styles.fact}>
              <KeyRound size={20} color={colors.text2} aria-hidden />
              <Text style={styles.factText}>
                Trois tentatives par code, sans révéler si un compte existe.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.canvas,
    },
    flex: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.rule,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      minHeight: minTouchTarget,
      minWidth: minTouchTarget,
    },
    backLabel: {
      fontFamily: fonts.bodyMedium,
      fontSize: fontSize.caption,
      color: colors.text2,
    },
    scroll: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: spacing.xxxl,
    },
    stepBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.md,
      paddingVertical: 4,
      borderRadius: radii.pill,
      backgroundColor: colors.primary100,
      borderWidth: 1,
      borderColor: colors.primary500,
    },
    stepBadgeText: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      color: colors.primaryInk,
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
    form: {
      marginTop: spacing.xl,
      gap: spacing.lg,
    },
    label: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.text,
      lineHeight: lineHeight.text,
      color: colors.text,
    },
    channel: {
      gap: spacing.sm,
    },
    channelRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    channelOption: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      minHeight: minTouchTarget,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      borderRadius: radii.sm,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      backgroundColor: colors.surface,
    },
    channelOptionActive: {
      borderColor: colors.primary600,
      backgroundColor: colors.primary100,
    },
    channelOptionPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.97 }],
    },
    channelLabel: {
      flex: 1,
      fontFamily: fonts.bodyMedium,
      fontSize: fontSize.text,
      color: colors.text2,
    },
    channelLabelActive: {
      color: colors.text,
      fontFamily: fonts.bodySemiBold,
    },
    hint: {
      fontFamily: fonts.body,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.text3,
    },
    facts: {
      marginTop: spacing.xl,
      gap: spacing.sm,
    },
    fact: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    factText: {
      flex: 1,
      fontFamily: fonts.body,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.text2,
    },
  })
}
