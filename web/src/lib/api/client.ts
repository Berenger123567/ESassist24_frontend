/**
 * Client typé du contrat ÉLECTRO ASSIST 24H.
 *
 * Les types sont générés depuis `backend/docs/openapi.json` (commit 106c383)
 * avec `npm run api:generate`. Ne jamais modifier `schema.d.ts` à la main :
 * le contrat OpenAPI fait foi.
 *
 * Aucune règle métier ici : uniquement le transport, l'en-tête de plateforme,
 * le format d'erreur normatif et la clé d'idempotence.
 */

import createClient, { type Middleware } from 'openapi-fetch'
import { getAccessToken, getDeviceId } from '../../features/session/token-store'
import type { paths } from './schema'

/**
 * Origine de l'API, sans `/api/v1` : les chemins générés contiennent déjà le préfixe.
 * Vide = même origine (proxy Vite en développement, reverse proxy en production).
 */
export const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? ''

export interface ApiErrorPayload {
  code?: string
  message?: string
  details?: Record<string, unknown>
}

export class ApiError extends Error {
  readonly code: string
  readonly status: number
  readonly details?: Record<string, unknown>

  constructor(message: string, code: string, status: number, details?: Record<string, unknown>) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.details = details
  }
}

function isErrorBody(value: unknown): value is { error: ApiErrorPayload } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof (value as { error: unknown }).error === 'object'
  )
}

const platformMiddleware: Middleware = {
  onRequest({ request }) {
    request.headers.set('X-Client-Platform', 'web')
    const token = getAccessToken()
    if (token) request.headers.set('Authorization', `Bearer ${token}`)
    request.headers.set('X-Device-Id', getDeviceId())
    return request
  },

  async onResponse({ response }) {
    if (response.ok) return response

    const payload = (await response.clone().json().catch(() => null)) as unknown

    if (isErrorBody(payload)) {
      throw new ApiError(
        payload.error.message ?? 'La demande a été refusée.',
        payload.error.code ?? 'UNKNOWN_ERROR',
        response.status,
        payload.error.details,
      )
    }

    throw new ApiError('La demande a été refusée.', 'UNKNOWN_ERROR', response.status)
  },

  onError({ error }) {
    if (error instanceof ApiError) return error
    if (error instanceof DOMException && error.name === 'AbortError') return error
    return new ApiError(
      'Le serveur est injoignable. Vérifiez votre connexion puis réessayez.',
      'NETWORK_ERROR',
      0,
    )
  },
}

export const api = createClient<paths>({ baseUrl: API_BASE_URL, credentials: 'include' })
api.use(platformMiddleware)

export function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

/**
 * En-tête à transmettre en `params.header` sur les actions sensibles :
 * paiement, décision, devis accepté, réclamation.
 */
export function idempotencyHeaders(key = createIdempotencyKey()): { 'Idempotency-Key': string } {
  return { 'Idempotency-Key': key }
}
