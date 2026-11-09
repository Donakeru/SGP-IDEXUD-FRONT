import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authenticate } from '../services/authService'
import { AuthContext, type AuthContextValue } from './AuthContext'
import {
  SESSION_STORAGE_KEY,
  clearSession,
  loadSession,
  saveSession,
} from './sessionPersistence'
import type { User } from '../types/user/User'

export default function AuthProvider({ children }: { children: ReactNode }) {
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
      hasSignedOut,
      login,
      logout,
    }),
    [hasSignedOut, login, logout, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
