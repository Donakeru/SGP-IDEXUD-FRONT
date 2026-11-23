/**
 * Configuración del front, leída y validada en un solo lugar.
 *
 * Variables obligatorias (todas con prefijo `VITE_`, públicas en el navegador):
 * - `VITE_API_BASE_URL`: URL base del backend (incluye `/api`).
 * - `VITE_KEYCLOAK_URL`, `VITE_KEYCLOAK_REALM`, `VITE_KEYCLOAK_CLIENT_ID`:
 *   cliente público de Keycloak (Authorization Code con PKCE).
 *
 * Si falta alguna, la aplicación no arranca y muestra una pantalla de error
 * con los nombres de las variables que faltan.
 */

export type KeycloakSettings = {
  url: string
  realm: string
  clientId: string
}

export type ConfigErrorCode = 'missing-env-vars'

export type AppConfig =
  | { status: 'ok'; keycloak: KeycloakSettings }
  | {
      status: 'error'
      code: ConfigErrorCode
      title: string
      message: string
      details: string[]
    }

type EnvSource = {
  VITE_API_BASE_URL?: string
  VITE_KEYCLOAK_URL?: string
  VITE_KEYCLOAK_REALM?: string
  VITE_KEYCLOAK_CLIENT_ID?: string
}

const REQUIRED_VARIABLES = [
  'VITE_API_BASE_URL',
  'VITE_KEYCLOAK_URL',
  'VITE_KEYCLOAK_REALM',
  'VITE_KEYCLOAK_CLIENT_ID',
] as const

/** Función pura: decide la configuración a partir de las variables de entorno. */
export function resolveAppConfig(env: EnvSource): AppConfig {
  const missing = REQUIRED_VARIABLES.filter((variable) => !env[variable]?.trim())

  if (missing.length > 0) {
    return {
      status: 'error',
      code: 'missing-env-vars',
      title: 'Falta configurar la aplicación',
      message: 'Faltan variables de entorno obligatorias.',
      details: missing.map((variable) => `${variable} no está definida.`),
    }
  }

  return {
    status: 'ok',
    keycloak: {
      url: (env.VITE_KEYCLOAK_URL ?? '').trim().replace(/\/+$/, ''),
      realm: (env.VITE_KEYCLOAK_REALM ?? '').trim(),
      clientId: (env.VITE_KEYCLOAK_CLIENT_ID ?? '').trim(),
    },
  }
}

// Se lee cada variable por separado: así el empaquetador solo incrusta estas
// cuatro y no el objeto `import.meta.env` completo (con cualquier otra VITE_*).
export const appConfig: AppConfig = resolveAppConfig({
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_KEYCLOAK_URL: import.meta.env.VITE_KEYCLOAK_URL,
  VITE_KEYCLOAK_REALM: import.meta.env.VITE_KEYCLOAK_REALM,
  VITE_KEYCLOAK_CLIENT_ID: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
})
