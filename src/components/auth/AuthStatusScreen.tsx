import type { ReactNode } from 'react'
import EmptyState from '../EmptyState'
import logo from '../../assets/logo_idexud.png'

type AuthStatusScreenProps = {
  icon: ReactNode
  title: string
  description?: string
  /** Líneas de apoyo bajo la descripción (por ejemplo, variables que faltan). */
  details?: string[]
  /** Botones de acción. */
  actions?: ReactNode
  /** `alert` para errores; `status` para estados informativos como "cargando". */
  role?: 'alert' | 'status'
}

/**
 * Pantalla completa de estado de la sesión (cargando, error, inactivo,
 * configuración). Usa el mismo aspecto que `pages/NoAccess`.
 *
 * TODO: unificar con `NoAccess`, que hoy repite este mismo marcado.
 */
export default function AuthStatusScreen({
  icon,
  title,
  description,
  details = [],
  actions,
  role = 'status',
}: AuthStatusScreenProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-5 py-10">
      <div
        className="w-full max-w-[460px] rounded-lg border border-line bg-white p-6 shadow-[0_4px_14px_rgba(38,38,38,0.05)]"
        role={role}
      >
        <div className="mb-2 flex justify-center">
          <img
            src={logo}
            alt="Logo Unidad de Extensión - Universidad Distrital Francisco José de Caldas"
            className="h-16 max-w-[260px] object-contain"
            decoding="async"
          />
        </div>
        <EmptyState icon={icon} title={title} description={description} action={actions} />
        {details.length > 0 && (
          <ul className="mx-auto -mt-4 max-w-[340px] space-y-1 pb-2 text-center font-mono text-[10px] leading-4 text-muted">
            {details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
