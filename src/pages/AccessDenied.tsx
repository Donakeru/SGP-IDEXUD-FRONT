import { LockClosedIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import { usePermissions } from '../auth/usePermissions'
import { getDefaultPath } from '../router/routeConfig'

/** Se muestra dentro del layout cuando el usuario no tiene la capacidad de la ruta. */
export default function AccessDenied() {
  const navigate = useNavigate()
  const { can } = usePermissions()

  return (
    <div className="mx-auto w-full max-w-[1216px] px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-line bg-white shadow-[0_4px_14px_rgba(38,38,38,0.05)]">
        <EmptyState
          icon={<LockClosedIcon className="size-6" strokeWidth={1.8} aria-hidden="true" />}
          title="No tienes acceso a esta sección"
          description="Tu rol no tiene permiso para ver esta página. Si crees que es un error, comunícate con el administrador del sistema."
          action={
            <Button variant="secondary" onClick={() => navigate(getDefaultPath(can))}>
              Volver al inicio
            </Button>
          }
        />
      </div>
    </div>
  )
}
