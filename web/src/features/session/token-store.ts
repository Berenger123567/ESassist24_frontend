/**
 * Jetons et identifiants de l'appareil — web.
 *
 * Règle du plan : le jeton d'accès reste en mémoire, jamais dans le stockage
 * persistant. Le jeton de rafraîchissement est détenu par le cookie httpOnly
 * posé par le serveur. Seuls l'identifiant d'appareil et le jeton CSRF
 * (nécessaire au renouvellement après rechargement) sont conservés.
 */

const DEVICE_KEY = 'ea24.device-id'
const CSRF_KEY = 'ea24.csrf-token'

let accessToken: string | null = null
let cachedDeviceId: string | null = null

function readStorage(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(storage: Storage, key: string, value: string | null): void {
  try {
    if (value === null) storage.removeItem(key)
    else storage.setItem(key, value)
  } catch {
    // Stockage indisponible (navigation privée stricte) : on reste en mémoire.
  }
}

function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function getDeviceId(): string {
  if (cachedDeviceId) return cachedDeviceId

  const stored = readStorage(window.localStorage, DEVICE_KEY)
  if (stored) {
    cachedDeviceId = stored
    return stored
  }

  const created = randomId()
  cachedDeviceId = created
  writeStorage(window.localStorage, DEVICE_KEY, created)
  return created
}

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string | null): void {
  accessToken = token
}

export function getCsrfToken(): string | null {
  return readStorage(window.sessionStorage, CSRF_KEY)
}

export function setCsrfToken(token: string | null): void {
  writeStorage(window.sessionStorage, CSRF_KEY, token)
}

export function clearStoredAuth(): void {
  accessToken = null
  setCsrfToken(null)
}
