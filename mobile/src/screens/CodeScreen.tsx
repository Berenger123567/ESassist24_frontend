import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ArrowLeft, KeyRound, MessageCircle, MessageSquare, ShieldCheck } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import type { ComponentRef } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { ActionButton } from '../components/ActionButton'
import { Brand } from '../components/Brand'
import { FormAlert } from '../components/FormAlert'
import { ThemeButton } from '../components/ThemeButton'
import { ApiError } from '../lib/api/client'
import { useSession } from '../features/session/session-context'
import { requestOtp, verifyOtp } from '../features/session/session-api'
import { useTheme, useThemedStyles } from '../theme/ThemeProvider'
import { fonts, fontSize, lineHeight, minTouchTarget, radii, spacing } from '../theme/tokens'
import type { ThemeColors } from '../theme/tokens'
import type { RootStackParamList } from '../navigation/types'

type Props = NativeStackScreenProps<RootStackParamList, 'Verification'>

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return 'La vérification a échoué. Réessayez dans un instant.'
}

function maskPhone(phone: string): string {
  if (phone.length < 8) return phone
  return `${phone.slice(0, 4)} •• •• ${phone.slice(-2)}`
}

export function CodeScreen({ navigation, route }: Props) {
  const { phone, channel, resendAfterSeconds, expiresInSeconds } = route.params
  const { signIn } = useSession()
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)

  const [code, setCode] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendIn, setResendIn] = useState(resendAfterSeconds)
  const [expiresIn, setExpiresIn] = useState(expiresInSeconds)
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setResendIn((value) => Math.max(0, value - 1))
      setExpiresIn((value) => Math.max(0, value - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const expired = expiresIn <= 0
  const channelLabel = channel === 'WHATSAPP' ? 'WhatsApp' : 'SMS'
  const ChannelIcon = channel === 'WHATSAPP' ? MessageCircle : MessageSquare

  async function handleSubmit() {
    setError(null)

    if (!/^\d{6}$/.test(code)) {
      setError('Le code comporte exactement 6 chiffres.')
      return
    }

    setPending(true)
    try {
      const tokens = await verifyOtp(phone, code)
      // La garde de navigation bascule sur l'espace authentifié ; si le compte
      // est nouveau, la pile démarre sur le profil (C-03).
      await signIn(tokens, phone)
    } catch (cause) {
      setError(errorMessage(cause))
      setCode('')
      inputRef.current?.focus()
    } finally {
      setPending(false)
    }
  }

  async function handleResend() {
    setError(null)
    setPending(true)
    try {
      // Même canal qu'à l'envoi initial : l'utilisateur n'a pas à le rechoisir.
      const result = await requestOtp(phone, channel)
      setResendIn(result.resendAfterSeconds ?? result.retryAfterSeconds ?? 60)
      setExpiresIn(result.expiresInSeconds ?? 300)
      setCode('')
      inputRef.current?.focus()
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
          accessibilityLabel="Modifier le numéro"
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={styles.backButton}
        >
          <ArrowLeft size={20} color={colors.text2} aria-hidden />
          <Text style={styles.backLabel}>Numéro</Text>
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
            <Text style={styles.stepBadgeText}>Étape 1 · C-02</Text>
          </View>

          <Text style={styles.title}>Vérifier le code</Text>
          <Text style={styles.lead}>
            Code envoyé au {maskPhone(phone)}. Saisissez les 6 chiffres reçus pour ouvrir votre
            session.
          </Text>

          <View style={styles.channelPill}>
            <ChannelIcon size={18} color={colors.primaryInk} aria-hidden />
            <Text style={styles.channelPillText}>Reçu par {channelLabel}</Text>
          </View>

          {error ? <FormAlert tone="error" message={error} /> : null}

          <View style={styles.form}>
            <Text style={styles.label}>Code à 6 chiffres</Text>
            <TextInput
              ref={inputRef}
              accessibilityLabel="Code à 6 chiffres"
              value={code}
              onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              maxLength={6}
              autoFocus
              placeholder="••••••"
              placeholderTextColor={colors.text3}
              style={styles.otpInput}
              onSubmitEditing={() => void handleSubmit()}
            />

            <Text style={expired ? styles.expired : styles.hint}>
              {expired
                ? 'Ce code a expiré. Demandez-en un nouveau.'
                : `Valable encore ${Math.floor(expiresIn / 60)} min ${String(expiresIn % 60).padStart(2, '0')} s · 3 tentatives maximum.`}
            </Text>

            <ActionButton
              label={pending ? 'Vérification…' : 'Valider le code'}
              onPress={() => void handleSubmit()}
              loading={pending}
              disabled={expired}
              icon={<KeyRound size={20} color={colors.ink900} aria-hidden />}
            />

            <ActionButton
              label={resendIn > 0 ? `Renvoyer le code (${resendIn} s)` : 'Renvoyer le code'}
              onPress={() => void handleResend()}
              tone="secondary"
              disabled={pending || resendIn > 0}
            />
          </View>

          <View style={styles.fact}>
            <ShieldCheck size={20} color={colors.text2} aria-hidden />
            <Text style={styles.factText}>
              Si ce numéro peut être utilisé, un code vient d’être envoyé. Le message ne révèle
              jamais si un compte existe.
            </Text>
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
    channelPill: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.base,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radii.pill,
      backgroundColor: colors.surface2,
      borderWidth: 1,
      borderColor: colors.rule,
    },
    channelPillText: {
      fontFamily: fonts.bodyMedium,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.text2,
    },
    form: {
      marginTop: spacing.xl,
      gap: spacing.md,
    },
    label: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.text,
      lineHeight: lineHeight.text,
      color: colors.text,
    },
    otpInput: {
      minHeight: 64,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.base,
      borderRadius: radii.sm,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      backgroundColor: colors.surface,
      color: colors.text,
      fontFamily: fonts.headingBold,
      fontSize: fontSize.display,
      letterSpacing: 10,
      textAlign: 'center',
    },
    hint: {
      fontFamily: fonts.body,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.text3,
    },
    expired: {
      fontFamily: fonts.bodyMedium,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.danger,
    },
    fact: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
      marginTop: spacing.xl,
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
