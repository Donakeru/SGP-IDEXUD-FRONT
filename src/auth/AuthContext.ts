import { createContext } from 'react'
import type { Credentials } from '../services/authService'
import type { User } from '../types/user/User'

export type LoginOptions = {
  /** `true`: guarda la sesión en `localStorage`; `false`: en `sessionStorage`. */
  remember?: boolean
}

export type AuthContextValue = {
  user: User | null
  /** Códigos de rol del usuario (por ejemplo `administrador`). */
  roles: readonly string[]
  isAuthenticated: boolean
  /**
   * `true` si la persona cerró sesión voluntariamente en esta carga de la
   * página. Evita recordar la última pantalla como "destino original".
   */
  hasSignedOut: boolean
  /** Lanza `AuthError` si no se puede iniciar sesión. */
  login: (credentials: Credentials, options?: LoginOptions) => Promise<User>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
