/**
 * Configuración de autenticación del front, leída y validada en un solo lugar.
 *
 * - `VITE_AUTH_MODE`: `dev` (login provisional por ID, sin autenticación real)
 *   o `keycloak`. Si falta o está vacía, vale `keycloak`.
 * - `VITE_KEYCLOAK_URL`, `VITE_KEYCLOAK_REALM`, `VITE_KEYCLOAK_CLIENT_ID`:
 *   obligatorias solo en modo `keycloak`.
 *
 * TODO (antes de desplegar): eliminar el modo `dev` y el login por ID
 * (`DevAuthProvider`, `pages/Login`, `authService`). Hasta entonces, un build de
 * producción con `VITE_AUTH_MODE=dev` se bloquea (ver `resolveAppConfig`).
 */

export type AuthMode = 'dev' | 'keycloak'

export type KeycloakSettings = {
  url: string
  realm: string
  clientId: string
}

export type ConfigErrorCode =
  | 'invalid-auth-mode'
  | 'dev-in-production'
  | 'missing-keycloak-vars'

export type AppConfig =
  | { status: 'ok'; authMode: 'dev' }
  | { status: 'ok'; authMode: 'keycloak'; keycloak: KeycloakSettings }
  | {
      status: 'error'
      code: ConfigErrorCode
      title: string
      message: string
      details: string[]
    }

type EnvSource = {
  VITE_AUTH_MODE?: string
  VITE_KEYCLOAK_URL?: string
  VITE_KEYCLOAK_REALM?: string
  VITE_KEYCLOAK_CLIENT_ID?: string
}

const VALID_MODES = ['dev', 'keycloak'] as const

const KEYCLOAK_VARIABLES = [
  ['VITE_KEYCLOAK_URL', 'url'],
  ['VITE_KEYCLOAK_REALM', 'realm'],
  ['VITE_KEYCLOAK_CLIENT_ID', 'clientId'],
] as const

/** Función pura: decide la configuración a partir de las variables de entorno. */
export function resolveAppConfig(env: EnvSource, isProduction: boolean): AppConfig {
  const rawMode = env.VITE_AUTH_MODE?.trim()
  const mode = rawMode ? rawMode : 'keycloak'

  if (!(VALID_MODES as readonly string[]).includes(mode)) {
    return {
      status: 'error',
      code: 'invalid-auth-mode',
      title: 'Error de configuración',
      message: 'La variable VITE_AUTH_MODE tiene un valor no válido.',
      details: [`Valor recibido: "${mode}".`, 'Valores válidos: "dev" o "keycloak".'],
    }
  }

  if (mode === 'dev') {
    if (isProduction) {
      return {
        status: 'error',
        code: 'dev-in-production',
        title: 'El modo dev no está permitido en producción',
        message:
          'Esta compilación de producción tiene VITE_AUTH_MODE="dev", que usa un acceso provisional sin autenticación real. Cambia VITE_AUTH_MODE a "keycloak" y vuelve a compilar.',
        details: [],
      }
    }

    return { status: 'ok', authMode: 'dev' }
  }

  const values: Record<string, string> = {}
  const missing: string[] = []

  for (const [variable, key] of KEYCLOAK_VARIABLES) {
    const value = env[variable]?.trim()

    if (value) {
      values[key] = value
    } else {
      missing.push(variable)
    }
  }

  if (missing.length > 0) {
    return {
      status: 'error',
      code: 'missing-keycloak-vars',
      title: 'Falta configurar Keycloak',
      message:
        'VITE_AUTH_MODE está en "keycloak", pero faltan variables de entorno obligatorias.',
      details: missing.map((variable) => `${variable} no está definida.`),
    }
  }

  return {
    status: 'ok',
    authMode: 'keycloak',
    keycloak: {
      url: values.url.replace(/\/+$/, ''),
      realm: values.realm,
      clientId: values.clientId,
    },
  }
}

export const appConfig: AppConfig = resolveAppConfig(import.meta.env, import.meta.env.PROD)

/** `true` solo si la configuración es válida y el modo es `dev`. */
export const isDevAuthMode = appConfig.status === 'ok' && appConfig.authMode === 'dev'

let startupLogged = false

/** Advertencias de arranque en consola. Se ejecuta una sola vez. */
export function logStartupWarnings(config: AppConfig) {
  if (startupLogged) {
    return
  }

  startupLogged = true

  if (config.status === 'ok' && config.authMode === 'dev') {
    console.warn(
      '[auth] Modo "dev": login provisional por ID, sin autenticación real. No debe desplegarse. TODO: eliminar el modo dev antes de desplegar.',
    )
  } else if (config.status === 'error') {
    console.error(`[config] ${config.title}. ${config.message} ${config.details.join(' ')}`)
  }
}
