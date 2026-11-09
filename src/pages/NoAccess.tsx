import { ShieldExclamationIcon } from '@heroicons/react/24/outline'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import { getRoleLabel } from '../auth/userDisplay'
import { useAuth } from '../auth/useAuth'
import { useSignOut } from '../auth/useSignOut'
import logo from '../assets/logo_idexud.png'

/** Pantalla completa para usuarios autenticados sin ningún rol configurado. */
export default function NoAccess() {
  const { user } = useAuth()
  const signOut = useSignOut()
  const roleLabel = user ? getRoleLabel(user) : ''

  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-5 py-10">
      <div className="w-full max-w-[460px] rounded-lg border border-line bg-white p-6 shadow-[0_4px_14px_rgba(38,38,38,0.05)]">
        <div className="mb-2 flex justify-center">
          <img
            src={logo}
            alt="Logo Unidad de Extensión - Universidad Distrital Francisco José de Caldas"
            className="h-16 max-w-[260px] object-contain"
            decoding="async"
          />
        </div>
        <EmptyState
          icon={<ShieldExclamationIcon className="size-6" strokeWidth={1.8} aria-hidden="true" />}
          title="Tu rol aún no tiene acceso configurado"
          description={
            roleLabel
              ? `Tu usuario tiene el rol “${roleLabel}”, que todavía no tiene permisos en esta aplicación. Comunícate con el administrador del sistema.`
              : 'Tu usuario no tiene roles asignados. Comunícate con el administrador del sistema.'
          }
          action={
            <Button variant="secondary" onClick={signOut}>
              Cerrar sesión
            </Button>
          }
        />
      </div>
    </main>
  )
}
