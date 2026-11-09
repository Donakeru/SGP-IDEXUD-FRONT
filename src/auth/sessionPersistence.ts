import type { User } from '../types/user/User'
import { normalizeUser } from './userGuards'

export const SESSION_STORAGE_KEY = 'sgp.session'

/** Devuelve el almacenamiento solo si el navegador lo permite (puede estar bloqueado). */
function getStorage(kind: 'local' | 'session'): Storage | null {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

function readUser(storage: Storage | null): User | null {
  if (!storage) {
    return null
  }

  try {
    const raw = storage.getItem(SESSION_STORAGE_KEY)

    if (!raw) {
      return null
    }

    const parsed: unknown = JSON.parse(raw)
    const user = normalizeUser((parsed as { user?: unknown } | null)?.user)

    if (!user) {
      // Forma inesperada: se descarta.
      storage.removeItem(SESSION_STORAGE_KEY)
    }

    return user
  } catch {
    // JSON corrupto: se descarta.
    storage.removeItem(SESSION_STORAGE_KEY)
    return null
  }
}

/** Restaura la sesión: primero la recordada (`localStorage`), luego la de la pestaña. */
export function loadSession(): User | null {
  return readUser(getStorage('local')) ?? readUser(getStorage('session'))
}

/**
 * Guarda solo el usuario (nunca la contraseña). Con `remember` usa
 * `localStorage`; si no, `sessionStorage`. Borra el otro para no dejar
 * sesiones duplicadas.
 */
export function saveSession(user: User, remember: boolean) {
  const target = getStorage(remember ? 'local' : 'session')
  const other = getStorage(remember ? 'session' : 'local')

  other?.removeItem(SESSION_STORAGE_KEY)

  try {
    target?.setItem(SESSION_STORAGE_KEY, JSON.stringify({ user }))
  } catch {
    // Sin espacio o almacenamiento bloqueado: la sesión vive solo en memoria.
  }
}

export function clearSession() {
  getStorage('local')?.removeItem(SESSION_STORAGE_KEY)
  getStorage('session')?.removeItem(SESSION_STORAGE_KEY)
}
