import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import type { AppConfig } from '../../config/env'
import AuthStatusScreen from './AuthStatusScreen'

type ConfigErrorScreenProps = {
  config: Extract<AppConfig, { status: 'error' }>
}

/**
 * Pantalla bloqueante: faltan variables de entorno obligatorias. Se muestra
 * antes de crear el router, la sesión o cualquier petición, y no ofrece
 * acciones para continuar.
 */
export default function ConfigErrorScreen({ config }: ConfigErrorScreenProps) {
  return (
    <AuthStatusScreen
      role="alert"
      icon={<ExclamationTriangleIcon className="size-6" strokeWidth={1.8} aria-hidden="true" />}
      title={config.title}
      description={config.message}
      details={config.details}
    />
  )
}
