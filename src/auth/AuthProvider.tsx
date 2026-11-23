import { lazy, Suspense, type ReactNode } from 'react'
import { AuthLoadingScreen } from '../components/auth/AuthStateScreens'
import ConfigErrorScreen from '../components/auth/ConfigErrorScreen'
import { appConfig } from '../config/env'
import DevAuthProvider from './DevAuthProvider'

// Carga diferida: en modo `dev` no se descarga ni se ejecuta `keycloak-js`.
const KeycloakAuthProvider = lazy(() => import('./KeycloakAuthProvider'))

/**
 * ÚNICO lugar donde se elige el proveedor de autenticación según
 * `VITE_AUTH_MODE`. Ambos publican el mismo `AuthContext`, así que el resto de
 * la app (`useAuth`, guards, pantallas) no sabe en qué modo corre.
 */
export default function AuthProvider({ children }: { children: ReactNode }) {
  if (appConfig.status === 'error') {
    // Antes de crear el router o hacer cualquier petición.
    return <ConfigErrorScreen config={appConfig} />
  }

  if (appConfig.authMode === 'dev') {
    return <DevAuthProvider>{children}</DevAuthProvider>
  }

  return (
    <Suspense fallback={<AuthLoadingScreen message="Cargando…" />}>
      <KeycloakAuthProvider settings={appConfig.keycloak}>{children}</KeycloakAuthProvider>
    </Suspense>
  )
}
