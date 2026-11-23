import { httpClient } from './http/httpClient'
import type { UserResponse } from '../types/user/UserResponse'

/**
 * `GET /users/{id_usuario}`. Lanza `HttpError` (con `status`) si el backend
 * responde fuera de 2xx; por ejemplo 404 cuando el usuario no existe.
 */
export async function getUserById(
  idUsuario: number | string,
  signal?: AbortSignal,
): Promise<UserResponse> {
  const normalizedId = String(idUsuario).trim()

  if (!normalizedId) {
    throw new Error('El id del usuario es obligatorio.')
  }

  return httpClient.getJson<UserResponse>(
    `/users/${encodeURIComponent(normalizedId)}`,
    signal,
  )
}

/**
 * `GET /users/me`: el usuario autenticado con sus roles (modo `keycloak`, con
 * token). Responde 200 aunque el usuario esté inactivo o sin roles, para poder
 * mostrar el estado real de la cuenta. En modo `dev` el backend responde 404.
 *
 * Se pide con `handleAuthErrors: false`: un 401 persistente o un 403 los maneja
 * quien llama con una pantalla propia, sin `login()` automático (evita un bucle
 * de redirecciones) y sin aviso global duplicado.
 */
export async function getCurrentUser(signal?: AbortSignal): Promise<unknown> {
  return httpClient.getJson<unknown>('/users/me', signal, { handleAuthErrors: false })
}
