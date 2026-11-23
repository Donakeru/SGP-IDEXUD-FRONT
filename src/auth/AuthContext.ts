import { createContext } from 'react'
import type { User } from '../types/user/User'

export type AuthContextValue = {
  user: User | null
  /** Códigos de rol del usuario (por ejemplo `administrador`). */
  roles: readonly string[]
  isAuthenticated: boolean
  /** `true` mientras se inicializa la sesión o se carga el usuario. */
  isLoading: boolean
  /** `true` si la persona cerró sesión voluntariamente en esta carga de la página. */
  hasSignedOut: boolean
  /** Redirige al inicio de sesión de Keycloak. */
  login: () => Promise<void>
  /** Cierra la sesión en Keycloak y vuelve al origen de la aplicación. */
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
