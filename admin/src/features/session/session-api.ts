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

// ─── Étape 3 — Vérifications ─────────────────────────────────────────────────

export type VerificationSummary = components['schemas']['VerificationSummaryDto']
export type VerificationDetail = components['schemas']['VerificationDetailDto']
export type VerificationDecision = components['schemas']['VerificationDecisionDto']
export type VerificationDecisionResponse = components['schemas']['VerificationDecisionResponseDto']
export type VerificationDocument = components['schemas']['VerificationDocumentDto']
export type VerificationPage = components['schemas']['VerificationPageDto']
export type AuditLogResponse = components['schemas']['AuditLogResponseDto']
export type AuditLogPage = components['schemas']['AuditLogPageDto']
export type EvaluatorResponse = components['schemas']['EvaluatorResponseDto']

export async function listVerifications(params?: {
  status?: string
  cursor?: string
  limit?: number
}): Promise<VerificationPage> {
  const { data } = await api.GET('/api/v1/admin/verifications', {
    params: {
      query: {
        status: params?.status as VerificationSummary['status'] | undefined,
        cursor: params?.cursor,
        limit: params?.limit,
      },
    },
  })
  return data ?? emptyResponse()
}

export async function getVerificationDetail(id: string): Promise<VerificationDetail> {
  const { data } = await api.GET('/api/v1/admin/verifications/{id}', {
    params: { path: { id } },
  })
  return data ?? emptyResponse()
}

export async function submitVerificationDecision(
  id: string,
  body: VerificationDecision,
  idempotencyKey: string,
): Promise<VerificationDecisionResponse> {
  const { data } = await api.POST('/api/v1/admin/verifications/{id}/decision', {
    params: {
      path: { id },
      header: { 'Idempotency-Key': idempotencyKey },
    },
    body,
  })
  return data ?? emptyResponse()
}

export async function getAdminDocumentViewUrl(id: string): Promise<{ viewUrl: string; expiresInSeconds: number }> {
  const { data } = await api.GET('/api/v1/admin/documents/{id}/view-url', {
    params: { path: { id } },
  })
  return data ?? emptyResponse()
}

export async function listAuditLogs(params?: {
  cursor?: string
  limit?: number
  action?: string
  actorId?: string
}): Promise<AuditLogPage> {
  const { data } = await api.GET('/api/v1/admin/audit-logs', {
    params: {
      query: {
        cursor: params?.cursor,
        limit: params?.limit,
        action: params?.action,
        actorId: params?.actorId,
      },
    },
  })
  return data ?? emptyResponse()
}

export async function listEvaluators(params?: {
  cursor?: string
  limit?: number
}): Promise<components['schemas']['EvaluatorPageDto']> {
  const { data } = await api.GET('/api/v1/admin/evaluators', {
    params: { query: { cursor: params?.cursor, limit: params?.limit } },
  })
  return data ?? emptyResponse()
}

// ─── Étape 4 — Évaluations ───────────────────────────────────────────────────

export type EvaluationAssignmentResponse = components['schemas']['EvaluationAssignmentResponseDto']
export type EvaluationAssignmentPage = components['schemas']['EvaluationAssignmentPageDto']
export type EvaluationGridResponse = components['schemas']['EvaluationGridResponseDto']
export type EvaluationGridPage = components['schemas']['EvaluationGridPageDto']

export async function listEvaluationAssignments(params?: {
  cursor?: string
  limit?: number
  status?: string
}): Promise<EvaluationAssignmentPage> {
  const { data } = await api.GET('/api/v1/admin/evaluations/assignments', {
    params: {
      query: {
        cursor: params?.cursor,
        limit: params?.limit,
        status: params?.status as components['schemas']['EvaluationAssignmentResponseDto']['status'] | undefined,
      },
    },
  })
  return data ?? emptyResponse()
}

export async function createEvaluationAssignment(input: {
  profileId: string
  evaluatorId: string
  gridId: string
  dueAt?: string
  notes?: string
}): Promise<EvaluationAssignmentResponse> {
  const { data } = await api.POST('/api/v1/admin/evaluations/assignments', { body: input })
  return data ?? emptyResponse()
}

export async function listEvaluationGrids(): Promise<EvaluationGridPage> {
  const { data } = await api.GET('/api/v1/admin/evaluation-grids', {})
  return data ?? emptyResponse()
}

// ─── RGPD — Demandes de données admin ────────────────────────────────────────

export type AdminDataRequest = components['schemas']['AdminDataRequestResponseDto']

export async function listAdminDataRequests(): Promise<AdminDataRequest[]> {
  const { data } = await api.GET('/api/v1/admin/data-requests', {})
  return Array.isArray(data) ? data : []
}

export async function updateAdminDataRequestStatus(
  id: string,
  input: { status: components['schemas']['DataRequestStatus']; resolutionNote?: string },
): Promise<void> {
  await api.PATCH('/api/v1/admin/data-requests/{id}', {
    params: { path: { id } },
    body: input,
  })
}
