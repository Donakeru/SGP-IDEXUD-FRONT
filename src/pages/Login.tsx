/**
 * Pantalla de bienvenida reservada para uso futuro. No está conectada: Keycloak
 * redirige directo (onLoad login-required). Para usarla: cambiar a check-sso,
 * mostrarla cuando no haya sesión y usar keycloak.login como onLogin.
 */
import { ArrowRightIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'
import Alert from '../components/Alert'
import Button from '../components/Button'
import logo from '../assets/logo_idexud.png'

type LoginProps = {
  /** Acción del botón "Ingresar" (por ejemplo, `keycloak.login`). */
  onLogin: () => void
  /** Muestra el botón en estado de carga y lo deshabilita. */
  isLoading?: boolean
  /** Mensaje de error a mostrar bajo el botón. */
  errorMessage?: string | null
}

export default function Login({ onLogin, isLoading = false, errorMessage = null }: LoginProps) {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[60%_40%]">
      <section
        className="relative hidden min-h-screen overflow-hidden bg-primary lg:block"
        aria-label="Imagen institucional"
      >
        {/* <img
          src={banner}
          alt="Banner institucional de IDEXUD"
          className="absolute inset-0 h-full w-full object-cover object-center"
        /> */}
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-[390px]">
          <div className="mb-8 text-center">
            <div className="mb-6 flex justify-center">
              <img
                src={logo}
                alt="Logo Unidad de Extensión - Universidad Distrital Francisco José de Caldas"
                className="h-20 max-w-[320px] object-contain sm:h-24"
                decoding="async"
              />
            </div>
            <h1 className="text-[24px] font-semibold leading-8 tracking-[-0.025em] text-ink">
              Iniciar sesión
            </h1>
            <p className="mt-1.5 text-[10px] leading-4 text-muted">
              Ingresa tus credenciales para acceder a la plataforma.
            </p>
          </div>

          <Button
            className="mt-1 w-full !h-11 !text-[10px]"
            type="button"
            isLoading={isLoading}
            loadingText="Ingresando…"
            onClick={onLogin}
          >
            Ingresar
            <ArrowRightIcon className="size-4" strokeWidth={1.8} aria-hidden="true" />
          </Button>

          {errorMessage && (
            <Alert
              open
              variant="danger"
              role="alert"
              title="No fue posible iniciar sesión"
              description={errorMessage}
              icon={<QuestionMarkCircleIcon className="size-[18px]" strokeWidth={1.8} aria-hidden="true" />}
              placement="inline"
              className="mt-5"
            />
          )}

          <div className="mt-5 flex items-start gap-2 rounded-md border border-line bg-canvas px-3 py-2.5 text-[8px] leading-3.5 text-muted">
            <QuestionMarkCircleIcon className="mt-px size-4 shrink-0 text-primary-strong" strokeWidth={1.8} aria-hidden="true" />
            <span>
              <strong className="font-semibold text-body">¿Necesitas ayuda?</strong>{' '}
              Comunícate con el equipo de soporte de IDEXUD.
            </span>
          </div>
        </div>
      </section>
    </main>
  )
}
