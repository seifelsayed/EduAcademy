import { STORAGE_KEYS } from '@/shared/config/env'

/**
 * Wraps localStorage so a disabled or full storage (private browsing, quota)
 * degrades to an in-memory token rather than throwing on every request.
 */

let memoryToken: string | null = null

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Ignored on purpose — the in-memory copy keeps the session alive.
  }
}

function safeRemove(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // Ignored on purpose.
  }
}

export const tokenStorage = {
  get(): string | null {
    return memoryToken ?? safeGet(STORAGE_KEYS.token)
  },

  set(token: string): void {
    memoryToken = token
    safeSet(STORAGE_KEYS.token, token)
  },

  clear(): void {
    memoryToken = null
    safeRemove(STORAGE_KEYS.token)
  },
}
