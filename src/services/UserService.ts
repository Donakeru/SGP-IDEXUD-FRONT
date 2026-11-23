import { httpClient } from './http/httpClient'

/**
 * `GET /users/me`: el usuario autenticado con sus roles, según el token. Responde
 * 200 aunque el usuario esté inactivo o sin roles, para poder mostrar el estado
 * real de la cuenta. Es la única consulta de usuarios que hace el front.
 *
 * Se pide con `handleAuthErrors: false`: un 401 persistente o un 403 los maneja
 * quien llama con una pantalla propia, sin `login()` automático (evita un bucle
 * de redirecciones) y sin aviso global duplicado.
 */
export async function getCurrentUser(signal?: AbortSignal): Promise<unknown> {
  return httpClient.getJson<unknown>('/users/me', signal, { handleAuthErrors: false })
}
