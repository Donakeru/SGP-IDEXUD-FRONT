/**
 * Canal para avisar a la interfaz de un 403 (el cliente HTTP no es React).
 * Un mismo mensaje repetido en pocos segundos se publica una sola vez.
 */

export const DEFAULT_FORBIDDEN_MESSAGE = 'No tienes permisos para esta operación.'

const REPEAT_WINDOW_MS = 5000

type Listener = (message: string) => void

const listeners = new Set<Listener>()
let lastNotice: { message: string; at: number } | null = null

export function notifyForbidden(detail?: string) {
  const message = detail?.trim() || DEFAULT_FORBIDDEN_MESSAGE
  const now = Date.now()

  if (lastNotice && lastNotice.message === message && now - lastNotice.at < REPEAT_WINDOW_MS) {
    return
  }

  lastNotice = { message, at: now }
  listeners.forEach((listener) => listener(message))
}

export function subscribeForbidden(listener: Listener) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}
