/**
 * Stockage des jetons — application mobile.
 *
 * Règle : le jeton d'accès ne quitte jamais la mémoire. Le jeton de
 * rafraîchissement, le jeton CSRF exigé par /auth/refresh et l'identifiant
 * d'appareil sont conservés dans le stockage sécurisé du système
 * (`expo-secure-store`), jamais en clair dans un fichier de préférences.
 */

import * as Crypto from 'expo-crypto'
import * as SecureStore from 'expo-secure-store'

const REFRESH_KEY = 'ea24.refresh-token'
const CSRF_KEY = 'ea24.csrf-token'
const DEVICE_KEY = 'ea24.device-id'

let accessToken: string | null = null
let cachedDeviceId: string | null = null

async function readItem(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key)
  } catch {
    // Stockage indisponible (aperçu web) : session non persistée.
    return null
  }
}

async function writeItem(key: string, value: string | null): Promise<void> {
  try {
    if (value === null) await SecureStore.deleteItemAsync(key)
    else await SecureStore.setItemAsync(key, value)
  } catch {
    // Écriture impossible : on reste en mémoire pour cette exécution.
  }
}

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string | null): void {
  accessToken = token
}

export function getStoredRefreshToken(): Promise<string | null> {
  return readItem(REFRESH_KEY)
}

export function setStoredRefreshToken(token: string | null): Promise<void> {
  return writeItem(REFRESH_KEY, token)
}

export function getStoredCsrfToken(): Promise<string | null> {
  return readItem(CSRF_KEY)
}

export function setStoredCsrfToken(token: string | null): Promise<void> {
  return writeItem(CSRF_KEY, token)
}

export async function getDeviceId(): Promise<string> {
  if (cachedDeviceId) return cachedDeviceId

  const stored = await readItem(DEVICE_KEY)
  if (stored) {
    cachedDeviceId = stored
    return stored
  }

  const created = Crypto.randomUUID()
  cachedDeviceId = created
  await writeItem(DEVICE_KEY, created)
  return created
}

export async function clearStoredAuth(): Promise<void> {
  accessToken = null
  await Promise.all([setStoredRefreshToken(null), setStoredCsrfToken(null)])
}
