import {
  ArrowRightIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  QuestionMarkCircleIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import Alert from '../components/Alert'
import Button from '../components/Button'
import TextField from '../components/forms/TextField'
import { useAuth } from '../auth/useAuth'
import { usePermissions } from '../auth/usePermissions'
import { getDefaultPath } from '../router/routeConfig'
import { AuthError, parseUserId } from '../services/authService'
import logo from '../assets/logo_idexud.png'

type FieldErrors = {
  userId?: string
  password?: string
}

const USER_ID_FIELD = 'login-user-id'
const PASSWORD_FIELD = 'login-password'

/** Solo se aceptan rutas internas, para evitar redirecciones abiertas. */
function isSafeInternalPath(path: unknown): path is string {
  return (
    typeof path === 'string' &&
    path.startsWith('/') &&
    !path.startsWith('//') &&
    !path.startsWith('/login')
  )
}

function validate(userId: string, password: string): FieldErrors {
  const errors: FieldErrors = {}

  if (!userId.trim()) {
    errors.userId = 'Ingresa tu ID de usuario.'
  } else if (parseUserId(userId) === null) {
    errors.userId = 'El ID debe ser un número entero positivo.'
  }

  if (!password) {
    errors.password = 'Ingresa tu contraseña.'
  }

  return errors
}

export default function Login() {
  const location = useLocation()
  const { isAuthenticated, login } = useAuth()
  const { can } = usePermissions()

  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) {
    const from = (location.state as { from?: unknown } | null)?.from

    return (
      <Navigate to={isSafeInternalPath(from) ? from : getDefaultPath(can)} replace />
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    setSubmitError(null)

    const errors = validate(userId, password)
    setFieldErrors(errors)

    if (errors.userId || errors.password) {
      document.getElementById(errors.userId ? USER_ID_FIELD : PASSWORD_FIELD)?.focus()
      return
    }

    setIsSubmitting(true)

    try {
      // Al iniciar sesión, este componente redirige solo (ver `isAuthenticated`).
      await login({ userId, password }, { remember: rememberMe })
    } catch (error) {
      setSubmitError(
        error instanceof AuthError
          ? error.message
          : 'No fue posible iniciar sesión. Inténtalo de nuevo.',
      )
      setIsSubmitting(false)
    }
  }

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

          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <TextField
              id={USER_ID_FIELD}
              label="ID de usuario"
              required
              type="text"
              inputMode="numeric"
              autoComplete="username"
              placeholder="Ej. 1"
              value={userId}
              error={fieldErrors.userId}
              // TODO: acceso temporal de desarrollo. Pasar a correo o token compartido (ver authService).
              help="Acceso temporal de desarrollo: usa tu ID numérico de usuario."
              leading={<UserIcon className="size-4" strokeWidth={1.8} aria-hidden="true" />}
              disabled={isSubmitting}
              onChange={(event) => {
                setUserId(event.target.value)
                setFieldErrors((current) => ({ ...current, userId: undefined }))
              }}
            />

            <TextField
              id={PASSWORD_FIELD}
              label="Contraseña"
              required
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Ingresa tu contraseña"
              value={password}
              error={fieldErrors.password}
              leading={<LockClosedIcon className="size-4" strokeWidth={1.8} aria-hidden="true" />}
              trailing={
                <button
                  className="rounded p-1 text-muted hover:bg-primary-soft hover:text-primary-strong"
                  type="button"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="size-4" strokeWidth={1.8} aria-hidden="true" />
                  ) : (
                    <EyeIcon className="size-4" strokeWidth={1.8} aria-hidden="true" />
                  )}
                </button>
              }
              disabled={isSubmitting}
              onChange={(event) => {
                setPassword(event.target.value)
                setFieldErrors((current) => ({ ...current, password: undefined }))
              }}
            />

            <div className="flex items-center justify-between gap-3 text-[9px]">
              <label className="flex items-center gap-1.5 text-muted">
                <input
                  className="size-3.5 accent-primary"
                  type="checkbox"
                  checked={rememberMe}
                  disabled={isSubmitting}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                Recordarme
              </label>
              <button
                className="border-0 bg-transparent p-0 font-semibold text-primary-strong hover:underline"
                type="button"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <Button
              className="mt-1 !h-11 !text-[10px]"
              type="submit"
              isLoading={isSubmitting}
              loadingText="Ingresando…"
            >
              Ingresar a la plataforma
              <ArrowRightIcon className="size-4" strokeWidth={1.8} aria-hidden="true" />
            </Button>
          </form>

          {submitError && (
            <Alert
              open
              variant="danger"
              role="alert"
              title="No fue posible iniciar sesión"
              description={submitError}
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
