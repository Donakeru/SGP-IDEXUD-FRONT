import { createContext } from 'react'
import type { Credentials } from '../services/authService'
import type { User } from '../types/user/User'

export type LoginOptions = {
  /** `true`: guarda la sesión en `localStorage`; `false`: en `sessionStorage`. Solo modo `dev`. */
  remember?: boolean
}

export type AuthContextValue = {
  user: User | null
  /** Códigos de rol del usuario (por ejemplo `administrador`). */
  roles: readonly string[]
  isAuthenticated: boolean
  /** `true` mientras se inicializa la sesión o se carga el usuario. */
  isLoading: boolean
  /**
   * `true` si la persona cerró sesión voluntariamente en esta carga de la
   * página. Evita recordar la última pantalla como "destino original".
   */
  hasSignedOut: boolean
  /**
   * Modo `dev`: valida las credenciales (ID de usuario) y devuelve el usuario;
   * lanza `AuthError` si no se puede iniciar sesión.
   * Modo `keycloak`: redirige a Keycloak (ignora las credenciales) y devuelve `null`.
   */
  login: (credentials?: Credentials, options?: LoginOptions) => Promise<User | null>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
