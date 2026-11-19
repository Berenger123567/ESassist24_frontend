import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ArrowLeft, Briefcase, Check, MapPin, Save, Search } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
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
import { FormAlert } from '../components/FormAlert'
import { FormField } from '../components/FormField'
import { ThemeButton } from '../components/ThemeButton'
import { ApiError } from '../lib/api/client'
import {
  getProfessionalProfile,
  listSpecialties,
  listZones,
  updateProfessionalProfile,
} from '../features/session/session-api'
import type { ProfessionalProfile, Specialty, Zone } from '../features/session/session-api'
import { useTheme, useThemedStyles } from '../theme/ThemeProvider'
import { fonts, fontSize, lineHeight, minTouchTarget, radii, spacing } from '../theme/tokens'
import type { ThemeColors } from '../theme/tokens'
import type { RootStackParamList } from '../navigation/types'

type Props = NativeStackScreenProps<RootStackParamList, 'ProfilPro'>

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return 'Le profil n\u2019a pas pu \u00eatre enregistr\u00e9. R\u00e9essayez dans un instant.'
}

export function ProfilProScreen({ navigation }: Props) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)

  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [zoneQuery, setZoneQuery] = useState('')
  const [zonesLoading, setZonesLoading] = useState(true)

  const [selectedSpecialtyIds, setSelectedSpecialtyIds] = useState<string[]>([])
  const [selectedZoneIds, setSelectedZoneIds] = useState<string[]>([])
  const [experienceYears, setExperienceYears] = useState('')
  const [bio, setBio] = useState('')

  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    Promise.all([listSpecialties(), getProfessionalProfile()])
      .then(([specs, profile]) => {
        if (!active) return
        setSpecialties(specs)
        if (profile) {
          setSelectedSpecialtyIds(profile.specialties.map((s) => s.id))
          setSelectedZoneIds(profile.zones.map((z) => z.id))
          setExperienceYears(String(profile.experienceYears))
          setBio(typeof profile.bio === 'string' ? profile.bio : '')
        }
      })
      .catch(() => {
        if (active) setError('Les donn\u00e9es n\u2019ont pas pu \u00eatre charg\u00e9es.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    setZonesLoading(true)

    const timer = setTimeout(() => {
      listZones(zoneQuery)
        .then((data) => { if (active) setZones(data) })
        .catch(() => { if (active) setZones([]) })
        .finally(() => { if (active) setZonesLoading(false) })
    }, 300)

    return () => { active = false; clearTimeout(timer) }
  }, [zoneQuery])

  function toggleSpecialty(id: string) {
    setSelectedSpecialtyIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function toggleZone(id: string) {
    setSelectedZoneIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  async function handleSave() {
    setError(null)

    const years = parseInt(experienceYears, 10)
    if (!experienceYears || isNaN(years) || years < 0 || years > 60) {
      setError('Renseignez un nombre d\u2019ann\u00e9es d\u2019exp\u00e9rience entre 0 et 60.')
      return
    }
    if (selectedSpecialtyIds.length === 0) {
      setError('Choisissez au moins une sp\u00e9cialit\u00e9.')
      return
    }
    if (selectedZoneIds.length === 0) {
      setError('Choisissez au moins une zone d\u2019intervention.')
      return
    }

    setPending(true)
    try {
      await updateProfessionalProfile({
        specialtyIds: selectedSpecialtyIds,
        zoneIds: selectedZoneIds,
        experienceYears: years,
        bio: bio.trim() || undefined,
      })
      navigation.goBack()
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
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Retour"
          style={styles.backBtn}
        >
          <ArrowLeft size={22} color={colors.text} aria-hidden />
        </Pressable>
        <Text style={styles.headerTitle}>Profil pro</Text>
        <ThemeButton />
      </View>

      {loading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator color={colors.primary600} />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {error ? <FormAlert tone="error" message={error} /> : null}

            <View style={styles.section}>
              <View style={styles.sectionHead}>
                <Briefcase size={18} color={colors.primaryInk} aria-hidden />
                <Text style={styles.sectionTitle}>Exp\u00e9rience</Text>
              </View>

              <FormField
                label="Ann\u00e9es d\u2019exp\u00e9rience"
                value={experienceYears}
                onChangeText={setExperienceYears}
                keyboardType="number-pad"
                placeholder="ex. 5"
              />

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Bio (facultatif)</Text>
                <TextInput
                  accessibilityLabel="Bio"
                  value={bio}
                  onChangeText={setBio}
                  placeholder="D\u00e9crivez votre parcours en quelques lignes."
                  placeholderTextColor={colors.text3}
                  multiline
                  numberOfLines={3}
                  style={styles.textarea}
                />
              </View>
            </View>

            <View style={[styles.section, { marginTop: spacing.base }]}>
              <Text style={styles.sectionTitle}>Sp\u00e9cialit\u00e9s</Text>
              <Text style={styles.hint}>Cochez toutes les sp\u00e9cialit\u00e9s que vous pratiquez.</Text>
              <View style={styles.checkGrid}>
                {specialties.map((spec) => {
                  const checked = selectedSpecialtyIds.includes(spec.id)
                  return (
                    <Pressable
                      key={spec.id}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked }}
                      accessibilityLabel={spec.label}
                      onPress={() => toggleSpecialty(spec.id)}
                      style={[styles.checkItem, checked ? styles.checkItemActive : null]}
                    >
                      <Text
                        style={[styles.checkLabel, checked ? styles.checkLabelActive : null]}
                        numberOfLines={2}
                      >
                        {spec.label}
                      </Text>
                      {checked ? <Check size={16} color={colors.primaryInk} aria-hidden /> : null}
                    </Pressable>
                  )
                })}
              </View>
            </View>

            <View style={[styles.section, { marginTop: spacing.base }]}>
              <View style={styles.sectionHead}>
                <MapPin size={18} color={colors.primaryInk} aria-hidden />
                <Text style={styles.sectionTitle}>Zones d\u2019intervention</Text>
              </View>
              <Text style={styles.hint}>
                S\u00e9lectionnez toutes les communes o\u00f9 vous intervenez.
              </Text>

              <View style={styles.searchRow}>
                <Search size={18} color={colors.text3} aria-hidden />
                <TextInput
                  accessibilityLabel="Rechercher une commune"
                  value={zoneQuery}
                  onChangeText={setZoneQuery}
                  placeholder="Cotonou, Porto-Novo\u2026"
                  placeholderTextColor={colors.text3}
                  style={styles.searchInput}
                  returnKeyType="search"
                />
              </View>

              <View style={styles.zoneList}>
                {zonesLoading ? (
                  <Text style={styles.hint} accessibilityLiveRegion="polite">
                    Chargement des communes\u2026
                  </Text>
                ) : zones.length === 0 ? (
                  <Text style={styles.hint}>Aucune commune ne correspond.</Text>
                ) : (
                  zones.map((zone) => {
                    const checked = selectedZoneIds.includes(zone.id)
                    return (
                      <Pressable
                        key={zone.id}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked }}
                        accessibilityLabel={`${zone.name}, ${zone.department}`}
                        onPress={() => toggleZone(zone.id)}
                        style={[styles.zoneRow, checked ? styles.zoneRowActive : null]}
                      >
                        <MapPin
                          size={16}
                          color={checked ? colors.primaryInk : colors.text3}
                          aria-hidden
                        />
                        <View style={styles.zoneBody}>
                          <Text style={styles.zoneName}>{zone.name}</Text>
                          <Text style={styles.zoneDept}>{zone.department}</Text>
                        </View>
                        {checked ? <Check size={18} color={colors.success} aria-hidden /> : null}
                      </Pressable>
                    )
                  })
                )}
              </View>

              {selectedZoneIds.length > 0 ? (
                <Text style={styles.hint}>
                  {selectedZoneIds.length} commune
                  {selectedZoneIds.length > 1 ? 's' : ''} s\u00e9lectionn\u00e9e
                  {selectedZoneIds.length > 1 ? 's' : ''}.
                </Text>
              ) : null}
            </View>

            <View style={styles.saveBtn}>
              <ActionButton
                label={pending ? 'Enregistrement\u2026' : 'Enregistrer le profil'}
                onPress={() => void handleSave()}
                loading={pending}
                icon={<Save size={20} color={colors.ink900} aria-hidden />}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  )
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.canvas },
    flex: { flex: 1 },
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
    backBtn: {
      minWidth: minTouchTarget,
      minHeight: minTouchTarget,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      flex: 1,
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.text,
      lineHeight: lineHeight.text,
      color: colors.text,
    },
    loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    scroll: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: spacing.xxxl,
      gap: spacing.base,
    },
    section: {
      padding: spacing.base,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.rule,
      backgroundColor: colors.surface,
      gap: spacing.base,
    },
    sectionHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingBottom: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.rule,
    },
    sectionTitle: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.text,
      lineHeight: lineHeight.text,
      color: colors.text,
    },
    hint: {
      fontFamily: fonts.body,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.text3,
    },
    field: { gap: spacing.sm },
    fieldLabel: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.text,
      lineHeight: lineHeight.text,
      color: colors.text,
    },
    textarea: {
      minHeight: 88,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
      borderRadius: radii.sm,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      backgroundColor: colors.surface,
      color: colors.text,
      fontFamily: fonts.body,
      fontSize: fontSize.text,
      textAlignVertical: 'top',
    },
    checkGrid: { gap: spacing.sm },
    checkItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: minTouchTarget,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
      borderRadius: radii.sm,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      backgroundColor: colors.surface,
      gap: spacing.sm,
    },
    checkItemActive: {
      borderColor: colors.primary600,
      backgroundColor: colors.primary100,
    },
    checkLabel: {
      flex: 1,
      fontFamily: fonts.body,
      fontSize: fontSize.text,
      lineHeight: lineHeight.text,
      color: colors.text2,
    },
    checkLabelActive: {
      color: colors.text,
      fontFamily: fonts.bodySemiBold,
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
    zoneList: {
      borderRadius: radii.sm,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      overflow: 'hidden',
      maxHeight: 260,
    },
    zoneRow: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: minTouchTarget,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      gap: spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.rule,
    },
    zoneRowActive: { backgroundColor: colors.primary100 },
    zoneBody: { flex: 1, minWidth: 0 },
    zoneName: {
      fontFamily: fonts.bodyMedium,
      fontSize: fontSize.text,
      lineHeight: lineHeight.text,
      color: colors.text,
    },
    zoneDept: {
      marginTop: 1,
      fontFamily: fonts.body,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.text3,
    },
    saveBtn: { marginTop: spacing.lg },
  })
}
