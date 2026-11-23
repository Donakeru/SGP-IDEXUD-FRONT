import { Outlet } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { usePermissions } from '../../auth/usePermissions'
import { AuthLoadingScreen } from './AuthStateScreens'
import NoAccess from './NoAccess'

/**
 * Ruta de layout para todo lo que exige sesión:
 * - Con sesión pero sin ningún rol configurado: pantalla "sin acceso configurado".
 * - Si no: renderiza las rutas hijas.
 *
 * El proveedor de autenticación solo monta la aplicación cuando ya hay un
 * usuario (Keycloak inicia sesión antes), así que la rama sin sesión es solo un
 * resguardo: muestra la pantalla de carga y nunca redirige a otra ruta.
 *
 * Es solo experiencia de usuario; el backend debe validar cada petición.
 */
export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const { hasAccess } = usePermissions()

  if (!isAuthenticated) {
    return <AuthLoadingScreen message="Iniciando sesión…" />
  }

  if (!hasAccess) {
    return <NoAccess />
  }

  return <Outlet />
}
