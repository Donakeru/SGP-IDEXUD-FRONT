import {
  ArrowRightIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  QuestionMarkCircleIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert'
import Field from '../components/forms/Field'
import Input from '../components/forms/Input'
import { getUserById } from '../services/UserService'
import type { UserResponse } from '../types/user/UserResponse'
import logo from '../assets/logo_idexud.png'

const DEMO_USER_ID = 1

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [user, setUser] = useState<UserResponse | null>(null)
  const [userError, setUserError] = useState<string | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setUser(null)
    setUserError(null)
    setIsLoadingUser(true)

    try {
      const userResponse = await getUserById(DEMO_USER_ID)
      console.log(userResponse)
      setUser(userResponse)
      navigate('/dashboard')
    } catch (error) {
      setUserError(
        error instanceof Error
          ? error.message
          : 'No fue posible consultar la información del usuario.',
      )
    } finally {
      setIsLoadingUser(false)
    }
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[60%_40%]">
      <section
        className="relative hidden min-h-screen overflow-hidden bg-[#1f315f] lg:block"
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

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Field label="Correo institucional" required>
              <div className="relative">
                <UserIcon
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                <Input
                  className="pl-9"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nombre@udistrital.edu.co"
                  autoComplete="email"
                  required
                />
              </div>
            </Field>

            <Field label="Contraseña" required>
              <div className="relative">
                <LockClosedIcon
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                <Input
                  className="px-9"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  required
                />
                <button
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted hover:bg-primary-soft hover:text-primary-strong"
                  type="button"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="size-4" strokeWidth={1.8} aria-hidden="true" />
                  ) : (
                    <EyeIcon className="size-4" strokeWidth={1.8} aria-hidden="true" />
                  )}
                </button>
              </div>
            </Field>

            <div className="flex items-center justify-between gap-3 text-[9px]">
              <label className="flex items-center gap-1.5 text-muted">
                <input
                  className="size-3.5 accent-primary"
                  type="checkbox"
                  checked={rememberMe}
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

            <button
              className="mt-1 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#1f315f] px-4 text-[10px] font-semibold text-white shadow-[0_4px_12px_rgba(31,49,95,0.2)] transition-colors hover:bg-[#17264b]"
              type="submit"
              disabled={isLoadingUser}
            >
              {isLoadingUser ? 'Consultando usuario…' : 'Ingresar a la plataforma'}
              <ArrowRightIcon className="size-4" strokeWidth={1.8} aria-hidden="true" />
            </button>
          </form>

          {user && (
            <Alert
              open
              variant="success"
              title={`Usuario consultado: ${user.nombre}`}
              description={`${user.correo} · ${user.roles.map((role) => role.nombre).join(', ')}`}
              icon={<UserIcon className="size-[18px]" strokeWidth={1.8} aria-hidden="true" />}
              placement="inline"
              className="mt-5"
            />
          )}
          {userError && (
            <Alert
              open
              variant="danger"
              role="alert"
              title="No fue posible consultar el usuario"
              description={userError}
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
