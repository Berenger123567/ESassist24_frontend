/**
 * Authentification et profil — contrat OpenAPI uniquement.
 *
 * Le serveur décide de la validité du numéro, de la durée du code, du nombre
 * de tentatives et de la rotation des jetons. Le client transmet et affiche.
 */

import { ApiError, api } from '../../lib/api/client'
import type { components } from '../../lib/api/schema'
import {
  getDeviceId,
  getStoredCsrfToken,
  getStoredRefreshToken,
} from './token-store'

export type AuthTokens = components['schemas']['AuthTokensDto']
export type Me = components['schemas']['MeResponseDto']
export type Zone = components['schemas']['ZoneDto']
export type RequestOtpResult = components['schemas']['RequestOtpResponseDto']

/**
 * Canal d'envoi du code. WhatsApp est le canal par défaut (décision produit) ;
 * le SMS reste proposé quand WhatsApp n'est pas installé sur l'appareil.
 */
export type OtpChannel = 'WHATSAPP' | 'SMS'

export const DEFAULT_OTP_CHANNEL: OtpChannel = 'WHATSAPP'

const USER_AGENT = 'electro-assist-mobile/0.0.0'

function baseHeaders(): { 'user-agent': string; 'x-client-platform': string } {
  return { 'user-agent': USER_AGENT, 'x-client-platform': 'mobile' }
}

async function deviceHeaders(): Promise<{
  'user-agent': string
  'x-client-platform': string
  'x-device-id': string
}> {
  return { ...baseHeaders(), 'x-device-id': await getDeviceId() }
}

function emptyResponse(): never {
  throw new ApiError('Le serveur a renvoyé une réponse vide.', 'EMPTY_RESPONSE', 0)
}

export async function requestOtp(
  phone: string,
  channel: OtpChannel = DEFAULT_OTP_CHANNEL,
): Promise<RequestOtpResult> {
  const deviceId = await getDeviceId()

  const { data } = await api.POST('/api/v1/auth/otp/request', {
    params: { header: baseHeaders() },
    body: { phone, channel, deviceId },
  })

  return data ?? emptyResponse()
}

export async function verifyOtp(phone: string, code: string): Promise<AuthTokens> {
  const deviceId = await getDeviceId()

  const { data } = await api.POST('/api/v1/auth/otp/verify', {
    params: { header: await deviceHeaders() },
    body: { phone, code, deviceId },
  })

  return data ?? emptyResponse()
}

export async function refreshSession(): Promise<AuthTokens> {
  const [refreshToken, csrfToken, deviceId] = await Promise.all([
    getStoredRefreshToken(),
    getStoredCsrfToken(),
    getDeviceId(),
  ])

  if (!refreshToken) {
    throw new ApiError('Aucun jeton de renouvellement disponible.', 'NO_REFRESH_TOKEN', 401)
  }
  if (!csrfToken) {
    throw new ApiError('Aucun jeton CSRF disponible.', 'NO_CSRF_TOKEN', 401)
  }

  const { data } = await api.POST('/api/v1/auth/refresh', {
    params: {
      header: { ...(await deviceHeaders()), 'x-csrf-token': csrfToken },
    },
    body: { refreshToken, deviceId },
  })

  return data ?? emptyResponse()
}

export async function logoutSession(): Promise<void> {
  await api.POST('/api/v1/auth/logout', {})
}

export async function getMe(): Promise<Me> {
  const { data } = await api.GET('/api/v1/me', {})
  return data ?? emptyResponse()
}

export async function updateProfile(input: {
  firstName: string
  lastName: string
  zoneId: string
}): Promise<Me> {
  const { data } = await api.PUT('/api/v1/me/profile', { body: input })
  return data ?? emptyResponse()
}

export async function listZones(query: string): Promise<Zone[]> {
  const { data } = await api.GET('/api/v1/zones', {
    params: { query: { limit: 50, q: query.trim() || undefined } },
  })
  return data?.data ?? []
}

// ─── Étape 2 — Dossier professionnel ────────────────────────────────────────

export type Specialty = components['schemas']['SpecialtyDto']
export type ProfessionalProfile = components['schemas']['ProfessionalProfileResponseDto']
export type DocumentDto = components['schemas']['DocumentDto']
export type DocumentUploadUrl = components['schemas']['DocumentUploadUrlResponseDto']
export type DocumentType = components['schemas']['CreateDocumentUploadUrlDto']['type']
export type DocumentContentType = components['schemas']['CreateDocumentUploadUrlDto']['contentType']

export async function listSpecialties(): Promise<Specialty[]> {
  const { data } = await api.GET('/api/v1/specialties', {})
  return data?.data ?? []
}

export async function getProfessionalProfile(): Promise<ProfessionalProfile | null> {
  const { data, response } = await api.GET('/api/v1/professionals/me', {})
  if (response.status === 404) return null
  return data ?? null
}

export async function updateProfessionalProfile(input: {
  specialtyIds: string[]
  zoneIds: string[]
  experienceYears: number
  bio?: string
}): Promise<ProfessionalProfile> {
  const { data } = await api.PATCH('/api/v1/professionals/me', { body: input })
  return data ?? emptyResponse()
}

export async function listDocuments(): Promise<DocumentDto[]> {
  const { data } = await api.GET('/api/v1/pro/documents', {})
  // Le contrat retourne un tableau direct, pas un objet paginé
  return Array.isArray(data) ? data : []
}

export async function getDocumentUploadUrl(input: {
  type: DocumentType
  fileName: string
  contentType: DocumentContentType
  sizeBytes: number
}): Promise<DocumentUploadUrl> {
  const { data } = await api.POST('/api/v1/pro/documents/upload-url', { body: input })
  return data ?? emptyResponse()
}

export async function uploadDocumentBlob(
  uploadUrl: string,
  blob: Blob,
  contentType: string,
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: blob,
  })
  if (!response.ok) {
    throw new ApiError('Le téléversement a échoué. Réessayez.', 'UPLOAD_FAILED', response.status)
  }
}

/**
 * Le contrat type `firstName`/`lastName` comme `object` sur `/me`. On n'affiche
 * qu'une valeur texte, jamais un objet.
 */
export function textValue(value: unknown): string {
  return typeof value === 'string' ? value : ''
}
