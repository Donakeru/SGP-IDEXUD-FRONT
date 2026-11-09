/** El backend respondió con un código de estado fuera de 2xx. */
export class HttpError extends Error {
  readonly status: number

  constructor(status: number, message?: string) {
    super(message ?? `La solicitud falló con el código ${status}.`)
    this.name = 'HttpError'
    this.status = status
  }
}

/** No se obtuvo respuesta (sin conexión, servidor caído, CORS). */
export class NetworkError extends Error {
  constructor(message = 'No fue posible conectar con el servidor.') {
    super(message)
    this.name = 'NetworkError'
  }
}

/** Falta configuración obligatoria, por ejemplo `VITE_API_BASE_URL`. */
export class ConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConfigError'
  }
}

export function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError'
}
