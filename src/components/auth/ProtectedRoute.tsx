import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { usePermissions } from '../../auth/usePermissions'
import NoAccess from '../../pages/NoAccess'

/**
 * Ruta de layout para todo lo que exige sesión:
 * - Sin sesión: redirige a /login conservando el destino original.
 * - Con sesión pero sin ningún rol configurado: pantalla "sin acceso configurado".
 * - Si no: renderiza las rutas hijas.
 *
 * Es solo experiencia de usuario; el backend debe validar cada petición.
 */
export default function ProtectedRoute() {
  const { isAuthenticated, hasSignedOut } = useAuth()
  const { hasAccess } = usePermissions()
  const location = useLocation()

  if (!isAuthenticated) {
    const from = `${location.pathname}${location.search}${location.hash}`

    // Quien cierra sesión voluntariamente no vuelve a la última pantalla al ingresar.
    return <Navigate to="/login" replace state={hasSignedOut ? undefined : { from }} />
  }

  if (!hasAccess) {
    return <NoAccess />
  }

  return <Outlet />
}
