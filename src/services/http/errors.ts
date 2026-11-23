/** El backend respondió con un código de estado fuera de 2xx. */
export class HttpError extends Error {
  readonly status: number
  /** Texto de `{ "detail": "…" }` si la respuesta lo traía (por ejemplo en un 403). */
  readonly detail?: string

  constructor(status: number, message?: string, detail?: string) {
    super(message ?? `La solicitud falló con el código ${status}.`)
    this.name = 'HttpError'
    this.status = status
    this.detail = detail
  }
}

/** No se obtuvo respuesta (sin conexión, servidor caído, CORS). */
export class NetworkError extends Error {
  constructor(message = 'No fue posible conectar con el servidor.') {
    super(message)
    this.name = 'NetworkError'
  }
}

/** La petición superó el tiempo máximo. Se trata como un error de red. */
export class TimeoutError extends NetworkError {
  constructor() {
    super('La solicitud tardó demasiado.')
    this.name = 'TimeoutError'
  }
}

/**
 * No se pudo obtener un token válido: se está redirigiendo al inicio de sesión
 * de Keycloak y la petición no se envió.
 */
export class AuthRequiredError extends Error {
  constructor() {
    super('Tu sesión expiró. Redirigiendo al inicio de sesión…')
    this.name = 'AuthRequiredError'
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
