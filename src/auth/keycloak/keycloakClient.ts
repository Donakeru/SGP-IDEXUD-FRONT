import Keycloak from 'keycloak-js'
import type { KeycloakSettings } from '../../config/env'
import type { TokenProvider } from '../../services/http/tokenProvider'

/**
 * Cliente de Keycloak (cliente público, flujo Authorization Code con PKCE),
 * portado de `keycloak.js` de la plantilla de IDEXUD.
 *
 * Diferencias a propósito respecto a la plantilla:
 * - `onLoad: 'login-required'` (la plantilla usa `check-sso`).
 * - No se porta el polyfill de `crypto`/SHA-256: Keycloak exige `localhost` o HTTPS.
 * - Si la inicialización falla se descarta la promesa y la instancia, para poder
 *   reintentar sin recargar la página.
 *
 * Los tokens los guarda `keycloak-js` solo en memoria: la aplicación no los
 * escribe en ningún almacenamiento del navegador.
 */

let instance: Keycloak | null = null
let initPromise: Promise<boolean> | null = null

const REACHABILITY_TIMEOUT_MS = 8000

/**
 * Comprueba que el servidor de Keycloak responda ANTES de inicializar.
 *
 * Con `login-required`, `keycloak-js` no contacta a Keycloak al arrancar: solo
 * arma la URL y redirige el navegador. Si Keycloak está caído, la persona
 * terminaría en la página de error del navegador y nunca vería nuestra pantalla
 * "Servicio no disponible" con "Reintentar".
 *
 * La petición es `no-cors`: se resuelve (con una respuesta opaca) en cuanto el
 * servidor contesta, sea cual sea el estado, y solo se rechaza si no hay
 * conexión. No depende de la configuración CORS de Keycloak, así que no puede
 * dar un falso "no disponible" con un Keycloak en funcionamiento.
 */
async function assertKeycloakReachable(settings: KeycloakSettings) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REACHABILITY_TIMEOUT_MS)

  try {
    await fetch(
      `${settings.url}/realms/${encodeURIComponent(settings.realm)}/.well-known/openid-configuration`,
      { mode: 'no-cors', cache: 'no-store', signal: controller.signal },
    )
  } finally {
    clearTimeout(timer)
  }
}

export function getKeycloak(settings: KeycloakSettings) {
  if (!instance) {
    instance = new Keycloak({
      url: settings.url,
      realm: settings.realm,
      clientId: settings.clientId,
    })
  }

  return instance
}

/**
 * Inicializa la sesión UNA sola vez. Es seguro con React StrictMode: las
 * llamadas repetidas reciben la misma promesa. Resuelve `true` si el usuario
 * está autenticado (con `login-required`, si no lo está redirige a Keycloak).
 */
export function initKeycloak(settings: KeycloakSettings): Promise<boolean> {
  if (!initPromise) {
    const keycloak = getKeycloak(settings)

    initPromise = assertKeycloakReachable(settings)
      .then(() =>
        keycloak.init({
          onLoad: 'login-required',
          pkceMethod: 'S256',
          checkLoginIframe: false,
        }),
      )
      .catch((error: unknown) => {
        // keycloak-js solo permite un `init` por instancia: se crea otra al reintentar.
        initPromise = null
        instance = null

        throw error
      })
  }

  return initPromise
}

/** Adaptador para el cliente HTTP: renovar con `updateToken` y redirigir con `login`. */
export function createTokenProvider(keycloak: Keycloak): TokenProvider {
  const currentToken = () => {
    if (!keycloak.token) {
      throw new Error('No hay token de Keycloak.')
    }

    return keycloak.token
  }

  return {
    getToken: async () => {
      // Renueva si expira en menos de 30 segundos.
      await keycloak.updateToken(30)

      return currentToken()
    },
    refreshToken: async () => {
      // -1 fuerza la renovación (tras un 401).
      await keycloak.updateToken(-1)

      return currentToken()
    },
    login: () => {
      void keycloak.login()
    },
  }
}
