import { httpClient } from './http/httpClient'
import type { AuthMode } from '../config/env'

/**
 * `GET /health` (público): indica el modo de autenticación del backend. Se pide
 * SIN token. Cualquier fallo (red, 5xx, respuesta inesperada) devuelve `null`:
 * es solo una ayuda para detectar que el front y el backend usan modos distintos.
 */
export async function getBackendAuthMode(signal?: AbortSignal): Promise<AuthMode | null> {
  try {
    const data = await httpClient.getJson<{ auth_mode?: unknown }>('/health', signal, {
      auth: false,
      handleAuthErrors: false,
    })

    return data?.auth_mode === 'dev' || data?.auth_mode === 'keycloak' ? data.auth_mode : null
  } catch {
    return null
  }
}
