/**
 * Appels d'authentification et de profil — contrat OpenAPI uniquement.
 *
 * Les règles (durée du code, tentatives, rotation du refresh) appartiennent au
 * serveur. Le client se contente de transmettre et d'afficher ses réponses.
 */

import { ApiError, api } from '../../lib/api/client'
import type { components } from '../../lib/api/schema'
import { getCsrfToken, getDeviceId } from './token-store'

export type AuthTokens = components['schemas']['AuthTokensDto']
export type Me = components['schemas']['MeResponseDto']
export type Zone = components['schemas']['ZoneDto']
export type RequestOtpResult = components['schemas']['RequestOtpResponseDto']

function baseHeaders(): { 'user-agent': string; 'x-client-platform': string } {
  return {
    // Le navigateur ignore User-Agent : l'en-tête est requis par le contrat
    // mais ne peut pas être forgé côté client. Voir la note de contrat.
    'user-agent': typeof navigator === 'undefined' ? 'web' : navigator.userAgent,
    'x-client-platform': 'web',
  }
}

function deviceHeaders(): {
  'user-agent': string
  'x-client-platform': string
  'x-device-id': string
} {
  return { ...baseHeaders(), 'x-device-id': getDeviceId() }
}

export type OtpChannel = 'SMS' | 'WHATSAPP'

export async function requestOtp(
  phone: string,
  channel: OtpChannel = 'WHATSAPP',
): Promise<RequestOtpResult> {
  const { data } = await api.POST('/api/v1/auth/otp/request', {
    params: { header: baseHeaders() },
    // Décision produit : SMS et WhatsApp sont disponibles, WhatsApp par défaut.
    body: { phone, channel, deviceId: getDeviceId() },
  })

  return data ?? emptyResponse()
}

export async function verifyOtp(phone: string, code: string): Promise<AuthTokens> {
  const { data } = await api.POST('/api/v1/auth/otp/verify', {
    params: { header: deviceHeaders() },
    body: { phone, code, deviceId: getDeviceId() },
  })

  return data ?? emptyResponse()
}

export async function refreshSession(): Promise<AuthTokens> {
  const csrfToken = getCsrfToken()
  if (!csrfToken) {
    throw new ApiError('Aucun jeton de renouvellement disponible.', 'NO_CSRF_TOKEN', 401)
  }

  const { data } = await api.POST('/api/v1/auth/refresh', {
    params: {
      header: { ...deviceHeaders(), 'x-csrf-token': csrfToken },
    },
    body: { deviceId: getDeviceId() },
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

export async function uploadDocumentFile(
  uploadUrl: string,
  file: File,
  contentType: string,
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file,
  })
  if (!response.ok) {
    throw new ApiError(
      'Le téléversement a échoué. Réessayez.',
      'UPLOAD_FAILED',
      response.status,
    )
  }
}

function emptyResponse(): never {
  throw new ApiError('Le serveur a renvoyé une réponse vide.', 'EMPTY_RESPONSE', 0)
}
