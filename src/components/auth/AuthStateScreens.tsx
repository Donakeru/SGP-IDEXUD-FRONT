import { ExclamationTriangleIcon, UserMinusIcon } from '@heroicons/react/24/outline'
import Button from '../Button'
import Spinner from '../Spinner'
import AuthStatusScreen from './AuthStatusScreen'

/** Spinner a pantalla completa mientras se inicializa la sesión o se carga el usuario. */
export function AuthLoadingScreen({ message }: { message: string }) {
  return (
    <AuthStatusScreen
      role="status"
      icon={<Spinner className="size-6" />}
      title={message}
    />
  )
}

type AuthProblemScreenProps = {
  title: string
  description: string
  onRetry?: () => void
  onLogout?: () => void
}

/** Error de la sesión con "Reintentar" y/o "Cerrar sesión". */
export function AuthProblemScreen({
  title,
  description,
  onRetry,
  onLogout,
}: AuthProblemScreenProps) {
  return (
    <AuthStatusScreen
      role="alert"
      icon={<ExclamationTriangleIcon className="size-6" strokeWidth={1.8} aria-hidden="true" />}
      title={title}
      description={description}
      actions={
        <div className="flex flex-wrap justify-center gap-2">
          {onRetry && <Button onClick={onRetry}>Reintentar</Button>}
          {onLogout && (
            <Button variant="secondary" onClick={onLogout}>
              Cerrar sesión
            </Button>
          )}
        </div>
      }
    />
  )
}

/** El usuario existe pero está desactivado: no ve la aplicación. */
export function InactiveUserScreen({ onLogout }: { onLogout: () => void }) {
  return (
    <AuthStatusScreen
      role="alert"
      icon={<UserMinusIcon className="size-6" strokeWidth={1.8} aria-hidden="true" />}
      title="Tu usuario está inactivo"
      description="Comunícate con el administrador del sistema para reactivar tu acceso."
      actions={
        <Button variant="secondary" onClick={onLogout}>
          Cerrar sesión
        </Button>
      }
    />
  )
}
