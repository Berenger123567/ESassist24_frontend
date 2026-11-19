import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ArrowLeft, CheckCircle2, Clock3, FileText, Upload } from 'lucide-react-native'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { ActionButton } from '../components/ActionButton'
import { FormAlert } from '../components/FormAlert'
import { ThemeButton } from '../components/ThemeButton'
import { ApiError } from '../lib/api/client'
import {
  getDocumentUploadUrl,
  listDocuments,
  uploadDocumentBlob,
} from '../features/session/session-api'
import type { DocumentDto, DocumentType, DocumentContentType } from '../features/session/session-api'
import { useTheme, useThemedStyles } from '../theme/ThemeProvider'
import { fonts, fontSize, lineHeight, minTouchTarget, radii, spacing } from '../theme/tokens'
import type { ThemeColors } from '../theme/tokens'
import type { RootStackParamList } from '../navigation/types'

type Props = NativeStackScreenProps<RootStackParamList, 'Documents'>

const DOC_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'ID_CARD', label: 'Carte d\u2019identit\u00e9' },
  { value: 'DIPLOMA', label: 'Dipl\u00f4me' },
  { value: 'PROFESSIONAL_CERTIFICATE', label: 'Certificat professionnel' },
  { value: 'REFERENCE_LETTER', label: 'Lettre de r\u00e9f\u00e9rence' },
  { value: 'WORK_PHOTO', label: 'Photo de chantier' },
]

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'En attente',
    SUBMITTED: 'Soumis',
    APPROVED: 'Approuv\u00e9',
    REJECTED: 'Refus\u00e9',
    EXPIRED: 'Expir\u00e9',
  }
  return map[status] ?? status
}

function typeLabel(type: string): string {
  return DOC_TYPES.find((d) => d.value === type)?.label ?? type
}

async function pickAndUpload(
  docType: DocumentType,
  onProgress: (msg: string) => void,
): Promise<{ fileName: string; documentId: string } | null> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const DocumentPicker = require('expo-document-picker')

  const result = await DocumentPicker.getDocumentAsync({
    type: ['image/jpeg', 'image/png', 'application/pdf'],
    copyToCacheDirectory: true,
  })

  if (result.canceled || !result.assets || result.assets.length === 0) return null

  const asset = result.assets[0]
  const fileName = asset.name ?? 'document'
  const mimeType = (asset.mimeType ?? 'application/pdf') as DocumentContentType
  const sizeBytes = asset.size ?? 0

  if (sizeBytes > 5 * 1024 * 1024) {
    throw new ApiError('Le fichier d\u00e9passe 5\u00a0Mo.', 'FILE_TOO_LARGE', 0)
  }

  onProgress('Pr\u00e9paration du t\u00e9l\u00e9versement\u2026')
  const urlResult = await getDocumentUploadUrl({
    type: docType,
    fileName,
    contentType: mimeType,
    sizeBytes,
  })

  onProgress('T\u00e9l\u00e9versement en cours\u2026')
  const fileResponse = await fetch(asset.uri)
  const blob = await fileResponse.blob()
  await uploadDocumentBlob(urlResult.uploadUrl, blob, mimeType)

  return { fileName, documentId: urlResult.documentId }
}

export function DocumentsScreen({ navigation }: Props) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)

  const [docs, setDocs] = useState<DocumentDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [uploadType, setUploadType] = useState<DocumentType>('ID_CARD')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)

  const loadDocs = useCallback(() => {
    let active = true
    setLoading(true)

    listDocuments()
      .then((data) => { if (active) setDocs(data) })
      .catch((cause) => {
        if (active)
          setError(
            cause instanceof ApiError
              ? cause.message
              : 'La liste n\u2019a pas pu \u00eatre charg\u00e9e.',
          )
      })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [])

  useEffect(() => { const cleanup = loadDocs(); return cleanup }, [loadDocs])

  async function handleUpload() {
    setUploadError(null)
    setUploadSuccess(null)
    setUploading(true)

    try {
      const result = await pickAndUpload(uploadType, setUploadProgress)
      if (!result) return

      setUploadSuccess(`${typeLabel(uploadType)} d\u00e9pos\u00e9 avec succ\u00e8s.`)
      const updated = await listDocuments()
      setDocs(updated)
    } catch (cause) {
      setUploadError(
        cause instanceof ApiError
          ? cause.message
          : 'Le t\u00e9l\u00e9versement a \u00e9chou\u00e9. R\u00e9essayez.',
      )
    } finally {
      setUploading(false)
      setUploadProgress(null)
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
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
        <Text style={styles.headerTitle}>Pi\u00e8ces justificatives</Text>
        <ThemeButton />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {error ? <FormAlert tone="error" message={error} /> : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>D\u00e9poser un document</Text>
          <Text style={styles.hint}>Choisissez le type, puis s\u00e9lectionnez le fichier.</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typeRow}
          >
            {DOC_TYPES.map((dt) => (
              <Pressable
                key={dt.value}
                accessibilityRole="radio"
                accessibilityState={{ selected: uploadType === dt.value }}
                accessibilityLabel={dt.label}
                onPress={() => setUploadType(dt.value)}
                style={[styles.typeChip, uploadType === dt.value ? styles.typeChipActive : null]}
              >
                <Text
                  style={[
                    styles.typeChipLabel,
                    uploadType === dt.value ? styles.typeChipLabelActive : null,
                  ]}
                >
                  {dt.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {uploadError ? <FormAlert tone="error" message={uploadError} /> : null}
          {uploadSuccess ? <FormAlert tone="success" message={uploadSuccess} /> : null}
          {uploadProgress ? (
            <View style={styles.progressRow}>
              <ActivityIndicator size="small" color={colors.primary600} />
              <Text style={styles.hint}>{uploadProgress}</Text>
            </View>
          ) : null}

          <ActionButton
            label={uploading ? 'T\u00e9l\u00e9versement\u2026' : 'Choisir un fichier'}
            onPress={() => void handleUpload()}
            loading={uploading}
            icon={<Upload size={20} color={colors.ink900} aria-hidden />}
          />
        </View>

        <View style={[styles.section, { marginTop: spacing.base }]}>
          <Text style={styles.sectionTitle}>Documents d\u00e9pos\u00e9s</Text>

          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.primary600} />
              <Text style={styles.hint}>Chargement\u2026</Text>
            </View>
          ) : docs.length === 0 ? (
            <Text style={styles.empty}>Aucun document d\u00e9pos\u00e9 pour le moment.</Text>
          ) : (
            docs.map((doc) => {
              const docColor =
                doc.status === 'APPROVED'
                  ? colors.success
                  : doc.status === 'REJECTED' || doc.status === 'EXPIRED'
                    ? colors.danger
                    : colors.warning
              return (
                <View key={doc.id} style={styles.docRow}>
                  <FileText size={18} color={colors.text3} aria-hidden />
                  <View style={styles.docBody}>
                    <Text style={styles.docType}>{typeLabel(doc.type)}</Text>
                    <Text style={styles.docFile} numberOfLines={1}>{doc.fileName}</Text>
                  </View>
                  <Text style={[styles.docStatus, { color: docColor }]}>
                    {statusLabel(doc.status)}
                  </Text>
                </View>
              )
            })
          )}
        </View>

        <View style={[styles.section, styles.sectionMuted, { marginTop: spacing.base }]}>
          <Text style={styles.sectionTitle}>Documents requis</Text>
          {DOC_TYPES.map((dt) => {
            const deposited = docs.some((d) => d.type === dt.value)
            return (
              <View key={dt.value} style={styles.requiredRow}>
                {deposited ? (
                  <CheckCircle2 size={16} color={colors.success} aria-hidden />
                ) : (
                  <Clock3 size={16} color={colors.text3} aria-hidden />
                )}
                <Text style={[styles.requiredLabel, deposited ? styles.requiredDone : null]}>
                  {dt.label}
                </Text>
              </View>
            )
          })}
        </View>
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
    scroll: { flex: 1 },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: spacing.xxxl,
    },
    section: {
      padding: spacing.base,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.rule,
      backgroundColor: colors.surface,
      gap: spacing.base,
    },
    sectionMuted: { backgroundColor: colors.surface2 },
    sectionTitle: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.text,
      lineHeight: lineHeight.text,
      color: colors.text,
      paddingBottom: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.rule,
    },
    hint: {
      fontFamily: fonts.body,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.text3,
    },
    typeRow: { gap: spacing.sm, paddingVertical: spacing.xs },
    typeChip: {
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      borderRadius: radii.pill,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      backgroundColor: colors.surface,
    },
    typeChipActive: {
      borderColor: colors.primary600,
      backgroundColor: colors.primary100,
    },
    typeChipLabel: {
      fontFamily: fonts.bodyMedium,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.text2,
    },
    typeChipLabelActive: {
      color: colors.primaryInk,
      fontFamily: fonts.bodySemiBold,
    },
    progressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    loadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    empty: {
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
    docBody: { flex: 1, minWidth: 0 },
    docType: {
      fontFamily: fonts.bodyMedium,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.text,
    },
    docFile: {
      marginTop: 1,
      fontFamily: fonts.body,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.text3,
    },
    docStatus: {
      fontFamily: fonts.bodySemiBold,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
    },
    requiredRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.rule,
    },
    requiredLabel: {
      fontFamily: fonts.body,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.text2,
    },
    requiredDone: { color: colors.text },
  })
}
