import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AuthError, authenticate } from '../services/authService'
import { AuthContext, type AuthContextValue } from './AuthContext'
import {
  SESSION_STORAGE_KEY,
  clearSession,
  loadSession,
  saveSession,
} from './sessionPersistence'
import type { User } from '../types/user/User'

/**
 * Proveedor del modo `dev`: login provisional por ID de usuario, sin
 * autenticación real. Conserva el comportamiento de siempre (persistencia en
 * `localStorage` con "Recordarme" o `sessionStorage` sin él).
 *
 * TODO: eliminar el modo `dev` (este proveedor, `pages/Login` y `authService`)
 * antes de desplegar. Un build de producción con `VITE_AUTH_MODE=dev` se bloquea.
 */
export default function DevAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadSession())
  const [hasSignedOut, setHasSignedOut] = useState(false)

  // Mantiene sincronizadas las pestañas: cerrar sesión en una cierra en todas.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === SESSION_STORAGE_KEY) {
        setUser(loadSession())
      }
    }

    window.addEventListener('storage', handleStorage)

    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const login = useCallback<AuthContextValue['login']>(
    async (credentials, options) => {
      if (!credentials) {
        throw new AuthError('INVALID_INPUT')
      }

      const authenticatedUser = await authenticate(credentials)

      saveSession(authenticatedUser, options?.remember ?? false)
      setHasSignedOut(false)
      setUser(authenticatedUser)

      return authenticatedUser
    },
    [],
  )

  const logout = useCallback(() => {
    clearSession()
    setHasSignedOut(true)
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      roles: user ? user.roles.map((role) => role.codigo) : [],
      isAuthenticated: user !== null,
      isLoading: false,
      hasSignedOut,
      login,
      logout,
    }),
    [hasSignedOut, login, logout, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
