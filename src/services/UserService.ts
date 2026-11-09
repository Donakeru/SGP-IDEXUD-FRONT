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
