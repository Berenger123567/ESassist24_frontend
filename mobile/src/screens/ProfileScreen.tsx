import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ArrowRight, Check, MapPin, Search, UserRound } from 'lucide-react-native'
import { useEffect, useMemo, useState } from 'react'
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
import { FormField } from '../components/FormField'
import { ThemeButton } from '../components/ThemeButton'
import { ApiError } from '../lib/api/client'
import { useSession } from '../features/session/session-context'
import { listZones, updateProfile } from '../features/session/session-api'
import type { Zone } from '../features/session/session-api'
import { useTheme, useThemedStyles } from '../theme/ThemeProvider'
import { fonts, fontSize, lineHeight, minTouchTarget, radii, spacing } from '../theme/tokens'
import type { ThemeColors } from '../theme/tokens'
import type { RootStackParamList } from '../navigation/types'

type Props = NativeStackScreenProps<RootStackParamList, 'Profil'>

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return 'Le profil n’a pas pu être enregistré. Réessayez dans un instant.'
}

export function ProfileScreen({ navigation }: Props) {
  const { session, markProfileComplete } = useSession()
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [zoneQuery, setZoneQuery] = useState('')
  const [zones, setZones] = useState<Zone[]>([])
  const [zonesLoading, setZonesLoading] = useState(true)
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setZonesLoading(true)

    const timer = setTimeout(() => {
      listZones(zoneQuery)
        .then((data) => {
          if (active) setZones(data)
        })
        .catch(() => {
          if (active) setZones([])
        })
        .finally(() => {
          if (active) setZonesLoading(false)
        })
    }, 300)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [zoneQuery])

  const options = useMemo(() => {
    if (!selectedZone || zones.some((zone) => zone.id === selectedZone.id)) return zones
    return [selectedZone, ...zones]
  }, [selectedZone, zones])

  async function handleSubmit() {
    setError(null)

    if (!firstName.trim() || !lastName.trim()) {
      setError('Renseignez votre prénom et votre nom.')
      return
    }
    if (!selectedZone) {
      setError('Choisissez votre commune de résidence.')
      return
    }

    setPending(true)
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        zoneId: selectedZone.id,
      })
      markProfileComplete()
      navigation.reset({ index: 0, routes: [{ name: 'Espace' }] })
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
        <Brand compact />
        <View style={styles.headerRight}>
          <Text style={styles.step}>Étape 1 · C-03</Text>
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
          <Text style={styles.title}>Votre profil</Text>
          <Text style={styles.lead}>
            Ces informations permettent de vous identifier dans l’espace personnel et de rattacher
            vos demandes à une commune. Vous pourrez les compléter plus tard.
          </Text>

          {session?.phone ? (
            <View style={styles.account}>
              <Text style={styles.accountText}>
                Compte vérifié : <Text style={styles.accountPhone}>{session.phone}</Text>
              </Text>
            </View>
          ) : null}

          {error ? <FormAlert tone="error" message={error} /> : null}

          <View style={styles.form}>
            <FormField
              label="Prénom"
              value={firstName}
              onChangeText={setFirstName}
              autoComplete="given-name"
              textContentType="givenName"
              returnKeyType="next"
            />

            <FormField
              label="Nom"
              value={lastName}
              onChangeText={setLastName}
              autoComplete="family-name"
              textContentType="familyName"
              returnKeyType="next"
            />

            <View style={styles.field}>
              <Text style={styles.label}>Rechercher une commune</Text>
              <View style={styles.searchRow}>
                <Search size={20} color={colors.text3} aria-hidden />
                <TextInput
                  accessibilityLabel="Rechercher une commune"
                  value={zoneQuery}
                  onChangeText={setZoneQuery}
                  placeholder="Cotonou, Porto-Novo, Abomey…"
                  placeholderTextColor={colors.text3}
                  style={styles.searchInput}
                  returnKeyType="search"
                />
              </View>
              <Text style={styles.hint}>
                La recherche interroge le référentiel des zones du serveur.
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Commune de résidence</Text>
              <View style={styles.zoneList}>
                {zonesLoading ? (
                  <Text style={styles.zoneEmpty} accessibilityLiveRegion="polite">
                    Chargement des communes…
                  </Text>
                ) : options.length === 0 ? (
                  <Text style={styles.zoneEmpty}>
                    Aucune commune ne correspond. Modifiez la recherche ou vérifiez le serveur.
                  </Text>
                ) : (
                  <ScrollView
                    style={styles.zoneScroll}
                    nestedScrollEnabled
                    showsVerticalScrollIndicator
                  >
                    {options.map((zone) => {
                      const selected = selectedZone?.id === zone.id
                      return (
                        <Pressable
                          key={zone.id}
                          accessibilityRole="radio"
                          accessibilityState={{ selected }}
                          accessibilityLabel={`${zone.name}, ${zone.department}`}
                          onPress={() => setSelectedZone(zone)}
                          style={[styles.zoneRow, selected ? styles.zoneRowSelected : null]}
                        >
                          <MapPin
                            size={18}
                            color={selected ? colors.primaryInk : colors.text3}
                            aria-hidden
                          />
                          <View style={styles.zoneBody}>
                            <Text style={styles.zoneName}>{zone.name}</Text>
                            <Text style={styles.zoneMeta}>{zone.department}</Text>
                          </View>
                          {selected ? (
                            <Check size={20} color={colors.success} aria-hidden />
                          ) : null}
                        </Pressable>
                      )
                    })}
                  </ScrollView>
                )}
              </View>
            </View>

            <ActionButton
              label={pending ? 'Enregistrement…' : 'Ouvrir mon espace'}
              onPress={() => void handleSubmit()}
              loading={pending}
              icon={<ArrowRight size={20} color={colors.ink900} aria-hidden />}
            />
          </View>

          <View style={styles.facts}>
            <View style={styles.fact}>
              <MapPin size={20} color={colors.text2} aria-hidden />
              <Text style={styles.factText}>
                La commune sert aux recherches de professionnels ; l’adresse précise reste privée.
              </Text>
            </View>
            <View style={styles.fact}>
              <UserRound size={20} color={colors.text2} aria-hidden />
              <Text style={styles.factText}>
                La photo de profil sera ajoutée à l’étape 2, avec le téléversement documentaire.
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
    step: {
      fontFamily: fonts.bodyMedium,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: colors.primaryInk,
    },
    scroll: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: spacing.xxxl,
    },
    title: {
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
    account: {
      marginTop: spacing.base,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radii.sm,
      backgroundColor: colors.surface2,
      borderWidth: 1,
      borderColor: colors.rule,
    },
    accountText: {
      fontFamily: fonts.body,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.text2,
    },
    accountPhone: {
      fontFamily: fonts.bodySemiBold,
      color: colors.text,
    },
    form: {
      marginTop: spacing.lg,
      gap: spacing.base,
    },
    field: {
      gap: spacing.sm,
    },
    label: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.text,
      lineHeight: lineHeight.text,
      color: colors.text,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      minHeight: minTouchTarget,
      paddingHorizontal: spacing.base,
      borderRadius: radii.sm,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      backgroundColor: colors.surface,
    },
    searchInput: {
      flex: 1,
      paddingVertical: spacing.sm,
      fontFamily: fonts.body,
      fontSize: fontSize.text,
      color: colors.text,
    },
    hint: {
      fontFamily: fonts.body,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.text3,
    },
    zoneList: {
      borderRadius: radii.sm,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      overflow: 'hidden',
    },
    zoneScroll: {
      maxHeight: 236,
    },
    zoneRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      minHeight: minTouchTarget,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.rule,
    },
    zoneRowSelected: {
      backgroundColor: colors.primary100,
    },
    zoneBody: {
      flex: 1,
      minWidth: 0,
    },
    zoneName: {
      fontFamily: fonts.bodyMedium,
      fontSize: fontSize.text,
      lineHeight: lineHeight.text,
      color: colors.text,
    },
    zoneMeta: {
      marginTop: 1,
      fontFamily: fonts.body,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.text3,
    },
    zoneEmpty: {
      padding: spacing.base,
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
