import { normalizeUser } from '../auth/userGuards'
import { ConfigError, HttpError, NetworkError, isAbortError } from './http/errors'
import { getUserById } from './UserService'
import type { User } from '../types/user/User'

/**
 * ⚠️ AUTENTICACIÓN TEMPORAL DE DESARROLLO. NO DESPLEGAR.
 *
 * El backend todavía no tiene contraseñas ni un endpoint de login. Mientras
 * tanto, "autenticar" es consultar `GET /users/{id_usuario}` con el ID que
 * escribe la persona, y la contraseña se ignora. Cualquiera que conozca un ID
 * puede entrar como ese usuario.
 *
 * TODO: reemplazar `authenticate()` por una de estas opciones, sin tocar las
 * vistas (solo dependen de `useAuth().login()`):
 *   1. El token compartido con los subsistemas de la Universidad (validarlo y
 *      obtener el usuario a partir de él).
 *   2. Un endpoint por correo, cuando el backend lo tenga.
 * La firma pública (`Credentials` -> `User`, errores `AuthError`) debe
 * mantenerse igual.
 */

export type Credentials = {
  userId: string
  /** TODO: sin uso. El backend actual no valida contraseñas. */
  password: string
}

export type AuthErrorCode =
  | 'INVALID_INPUT'
  | 'USER_NOT_FOUND'
  | 'USER_INACTIVE'
  | 'NETWORK'
  | 'SERVER'
  | 'CONFIG'

export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  INVALID_INPUT: 'Ingresa un ID de usuario válido (número entero positivo).',
  USER_NOT_FOUND:
    'No encontramos un usuario con ese ID. Verifica el número e inténtalo de nuevo.',
  USER_INACTIVE:
    'Tu usuario está inactivo. Comunícate con el administrador del sistema.',
  NETWORK:
    'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
  SERVER:
    'El servidor no pudo procesar la solicitud. Inténtalo de nuevo en unos minutos.',
  CONFIG: 'Falta configurar la URL del servidor (VITE_API_BASE_URL).',
}

export class AuthError extends Error {
  readonly code: AuthErrorCode

  constructor(code: AuthErrorCode) {
    super(AUTH_ERROR_MESSAGES[code])
    this.name = 'AuthError'
    this.code = code
  }
}

if (import.meta.env.PROD) {
  console.warn(
    '[authService] Autenticación temporal por ID de usuario activa. No debe desplegarse.',
  )
}

export function parseUserId(value: string): number | null {
  const trimmed = value.trim()

  if (!/^\d+$/.test(trimmed)) {
    return null
  }

  const id = Number(trimmed)

  return Number.isSafeInteger(id) && id > 0 ? id : null
}

export async function authenticate(
  credentials: Credentials,
  signal?: AbortSignal,
): Promise<User> {
  const userId = parseUserId(credentials.userId)

  if (userId === null) {
    throw new AuthError('INVALID_INPUT')
  }

  let response: unknown

  try {
    response = await getUserById(userId, signal)
  } catch (error) {
    if (isAbortError(error)) {
      throw error
    }
    if (error instanceof HttpError) {
      throw new AuthError(error.status === 404 ? 'USER_NOT_FOUND' : 'SERVER')
    }
    if (error instanceof NetworkError) {
      throw new AuthError('NETWORK')
    }
    if (error instanceof ConfigError) {
      throw new AuthError('CONFIG')
    }
    throw new AuthError('SERVER')
  }

  const user = normalizeUser(response)

  if (!user) {
    throw new AuthError('SERVER')
  }

  if (!user.es_activo) {
    throw new AuthError('USER_INACTIVE')
  }

  return user
}
