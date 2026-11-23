import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  AuthLoadingScreen,
  AuthProblemScreen,
  InactiveUserScreen,
} from '../components/auth/AuthStateScreens'
import ConfigErrorScreen from '../components/auth/ConfigErrorScreen'
import { appConfig, type KeycloakSettings } from '../config/env'
import { getCurrentUser } from '../services/UserService'
import {
  AuthRequiredError,
  HttpError,
  NetworkError,
  isAbortError,
} from '../services/http/errors'
import { DEFAULT_FORBIDDEN_MESSAGE } from '../services/http/forbiddenNotifier'
import { setTokenProvider } from '../services/http/tokenProvider'
import type { User } from '../types/user/User'
import { AuthContext, type AuthContextValue } from './AuthContext'
import { createTokenProvider, getKeycloak, initKeycloak } from './keycloak/keycloakClient'
import { normalizeUser } from './userGuards'

type Phase =
  | { name: 'initializing' }
  | { name: 'loading-user' }
  | { name: 'ready'; user: User }
  | { name: 'inactive' }
  | { name: 'unavailable'; message: string }
  | { name: 'session-invalid' }
  | { name: 'forbidden'; detail: string }
  | { name: 'signing-out' }

const MESSAGES = {
  keycloakDown:
    'No pudimos conectar con el servicio de autenticación. Inténtalo de nuevo en unos minutos.',
  network: 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
  unavailable:
    'El servicio no está disponible en este momento. Inténtalo de nuevo en unos minutos.',
  unexpected: 'El servidor respondió de forma inesperada. Inténtalo de nuevo en unos minutos.',
}

/** Convierte un error al cargar `/users/me` en la pantalla correspondiente. */
function toPhase(error: unknown): Phase {
  if (error instanceof AuthRequiredError) {
    // Se está redirigiendo a Keycloak: se mantiene el spinner.
    return { name: 'initializing' }
  }
  if (error instanceof HttpError) {
    if (error.status === 401) {
      return { name: 'session-invalid' }
    }
    if (error.status === 403) {
      return { name: 'forbidden', detail: error.detail ?? DEFAULT_FORBIDDEN_MESSAGE }
    }

    return {
      name: 'unavailable',
      message: error.status === 503 ? MESSAGES.unavailable : MESSAGES.unexpected,
    }
  }
  if (error instanceof NetworkError) {
    return { name: 'unavailable', message: MESSAGES.network }
  }

  return { name: 'unavailable', message: MESSAGES.unexpected }
}

/**
 * Proveedor de autenticación: Keycloak es el único método. Con una
 * configuración inválida muestra la pantalla de error antes de crear la sesión
 * o hacer cualquier petición.
 */
export default function AuthProvider({ children }: { children: ReactNode }) {
  if (appConfig.status === 'error') {
    return <ConfigErrorScreen config={appConfig} />
  }

  return <KeycloakSession settings={appConfig.keycloak}>{children}</KeycloakSession>
}

/**
 * Sesión de Keycloak: inicializa (`login-required`), pide el usuario a
 * `GET /users/me` y publica el `AuthContext`. Los roles salen de la base de
 * datos (`/users/me`), no del token.
 *
 * Mientras no hay un usuario listo muestra pantallas de estado en lugar de la
 * aplicación; un usuario sin roles pasa de largo y lo atrapa `ProtectedRoute`
 * con la pantalla existente "Tu rol aún no tiene acceso configurado".
 *
 * TODO: leer roles del token (hoy no se hace a propósito) y soportar
 * `VITE_APP_SUBPATH` en el `redirectUri` del logout.
 */
function KeycloakSession({
  settings,
  children,
}: {
  settings: KeycloakSettings
  children: ReactNode
}) {
  const [phase, setPhase] = useState<Phase>({ name: 'initializing' })
  const [attempt, setAttempt] = useState(0)
  const [hasSignedOut, setHasSignedOut] = useState(false)

  useEffect(() => {
    // StrictMode ejecuta este efecto dos veces: la primera ejecución se aborta y
    // la inicialización de Keycloak se comparte (una sola promesa).
    const controller = new AbortController()
    const { signal } = controller

    const run = async () => {
      setPhase({ name: 'initializing' })

      try {
        await initKeycloak(settings)
      } catch (error) {
        if (!signal.aborted) {
          console.error('[auth] No se pudo inicializar Keycloak:', error)
          setPhase({ name: 'unavailable', message: MESSAGES.keycloakDown })
        }

        return
      }

      if (signal.aborted) {
        return
      }

      const keycloak = getKeycloak(settings)

      if (!keycloak.authenticated) {
        void keycloak.login()
        return
      }

      setTokenProvider(createTokenProvider(keycloak))
      setPhase({ name: 'loading-user' })

      try {
        const user = normalizeUser(await getCurrentUser(signal))

        if (signal.aborted) {
          return
        }

        if (!user) {
          setPhase({ name: 'unavailable', message: MESSAGES.unexpected })
        } else {
          setPhase(user.es_activo ? { name: 'ready', user } : { name: 'inactive' })
        }
      } catch (error) {
        if (!signal.aborted && !isAbortError(error)) {
          setPhase(toPhase(error))
        }
      }
    }

    void run()

    return () => {
      controller.abort()
      setTokenProvider(null)
    }
  }, [settings, attempt])

  const retry = useCallback(() => setAttempt((current) => current + 1), [])

  const login = useCallback<AuthContextValue['login']>(async () => {
    await getKeycloak(settings).login()
  }, [settings])

  const logout = useCallback(() => {
    setHasSignedOut(true)
    setTokenProvider(null)
    setPhase({ name: 'signing-out' })
    void getKeycloak(settings).logout({ redirectUri: window.location.origin })
  }, [settings])

  const user = phase.name === 'ready' ? phase.user : null
  const isLoading =
    phase.name === 'initializing' ||
    phase.name === 'loading-user' ||
    phase.name === 'signing-out'

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      roles: user ? user.roles.map((role) => role.codigo) : [],
      isAuthenticated: user !== null,
      isLoading,
      hasSignedOut,
      login,
      logout,
    }),
    [hasSignedOut, isLoading, login, logout, user],
  )

  let content: ReactNode

  switch (phase.name) {
    case 'ready':
      content = children
      break
    case 'initializing':
      content = <AuthLoadingScreen message="Iniciando sesión…" />
      break
    case 'loading-user':
      content = <AuthLoadingScreen message="Cargando tu información…" />
      break
    case 'signing-out':
      content = <AuthLoadingScreen message="Cerrando sesión…" />
      break
    case 'inactive':
      content = <InactiveUserScreen onLogout={logout} />
      break
    case 'unavailable':
      content = (
        <AuthProblemScreen
          title="Servicio no disponible"
          description={phase.message}
          onRetry={retry}
        />
      )
      break
    case 'session-invalid':
      content = (
        <AuthProblemScreen
          title="No pudimos validar tu sesión"
          description="El servidor no aceptó tu sesión. Inténtalo de nuevo o cierra sesión para volver a ingresar."
          onRetry={retry}
          onLogout={logout}
        />
      )
      break
    case 'forbidden':
      content = (
        <AuthProblemScreen
          title="No tienes acceso"
          description={phase.detail}
          onRetry={retry}
          onLogout={logout}
        />
      )
      break
  }

  return <AuthContext.Provider value={value}>{content}</AuthContext.Provider>
}
