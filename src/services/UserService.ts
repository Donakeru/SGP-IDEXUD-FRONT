import { httpClient } from './http/httpClient'
import type { UserResponse } from '../types/user/UserResponse'

export async function getUserById(
  idUsuario: number | string,
  signal?: AbortSignal,
): Promise<UserResponse> {
  const normalizedId = String(idUsuario).trim()

  if (!normalizedId) {
    throw new Error('El id del usuario es obligatorio.')
  }

  const response = await httpClient.get(
    `/users/${encodeURIComponent(normalizedId)}`,
    signal,
  )

  if (!response.ok) {
    throw new Error(`No fue posible consultar el usuario (${response.status}).`)
  }

  return response.json() as Promise<UserResponse>
}
