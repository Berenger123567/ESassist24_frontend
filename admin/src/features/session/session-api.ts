/**
 * Authentification de la console — contrat OpenAPI uniquement.
 * Aucune règle de mot de passe, de verrouillage ou de TOTP n'est réimplémentée
 * côté client : le serveur décide et le client affiche.
 */

import { ApiError, api } from '../../lib/api/client'
import type { components } from '../../lib/api/schema'
import { getCsrfToken, getDeviceId } from './token-store'

export type AuthTokens = components['schemas']['AdminSessionResponseDto']
export type Me = components['schemas']['MeResponseDto']
export type AdminInvitation = components['schemas']['AdminInvitationResponseDto']
export type AcceptedInvitation = components['schemas']['AcceptAdminInvitationResponseDto']
export type TotpEnrollment = components['schemas']['AdminTotpEnrollResponseDto']

function baseHeaders(): { 'user-agent': string; 'x-client-platform': string } {
  return {
    'user-agent': typeof navigator === 'undefined' ? 'admin' : navigator.userAgent,
    'x-client-platform': 'admin',
  }
}

function deviceHeaders(): {
  'user-agent': string
  'x-client-platform': string
  'x-device-id': string
} {
  return { ...baseHeaders(), 'x-device-id': getDeviceId() }
}

function emptyResponse(): never {
  throw new ApiError('Le serveur a renvoyé une réponse vide.', 'EMPTY_RESPONSE', 0)
}

export async function adminLogin(input: {
  phone: string
  password: string
}): Promise<AuthTokens> {
  const { data } = await api.POST('/api/v1/admin/auth/login', {
    params: { header: deviceHeaders() },
    body: {
      phone: input.phone,
      password: input.password,
      deviceId: getDeviceId(),
    },
  })

  return data ?? emptyResponse()
}

export async function verifyAdminTotp(mfaToken: string, code: string): Promise<AuthTokens> {
  const { data } = await api.POST('/api/v1/admin/auth/totp/verify', {
    params: { header: deviceHeaders() },
    body: { mfaToken, code, deviceId: getDeviceId() },
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

  return (data as AuthTokens | undefined) ?? emptyResponse()
}

export async function logoutSession(): Promise<void> {
  await api.POST('/api/v1/auth/logout', {})
}

export async function acceptInvitation(input: {
  token: string
  password: string
  firstName?: string
  lastName?: string
}): Promise<AcceptedInvitation> {
  const { data } = await api.POST('/api/v1/admin/invitations/accept', {
    body: input,
  })

  return data ?? emptyResponse()
}

export async function enrollTotp(): Promise<TotpEnrollment> {
  const { data } = await api.POST('/api/v1/admin/auth/totp/enroll', {})
  return data ?? emptyResponse()
}

export async function activateTotp(code: string): Promise<{ enabled: boolean }> {
  const { data } = await api.POST('/api/v1/admin/auth/totp/activate', {
    body: { code },
  })
  return data ?? emptyResponse()
}

export async function getMe(): Promise<Me> {
  const { data } = await api.GET('/api/v1/me', {})
  return data ?? emptyResponse()
}

// ─── Étape 2 — Invitations (gestion depuis la console) ───────────────────────

export type CreatedInvitation = components['schemas']['CreatedAdminInvitationResponseDto']
export type InvitationRole = components['schemas']['CreateAdminInvitationDto']['role']

export async function listInvitations(): Promise<AdminInvitation[]> {
  const { data } = await api.GET('/api/v1/admin/invitations', {})
  return Array.isArray(data) ? data : []
}

export async function createInvitation(input: {
  phone: string
  role: InvitationRole
  email?: string
}): Promise<CreatedInvitation> {
  const { data } = await api.POST('/api/v1/admin/invitations', { body: input })
  return data ?? emptyResponse()
}
