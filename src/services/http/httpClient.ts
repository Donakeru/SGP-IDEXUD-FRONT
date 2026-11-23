import {
  AuthRequiredError,
  ConfigError,
  HttpError,
  NetworkError,
  TimeoutError,
  isAbortError,
} from './errors'
import { notifyForbidden } from './forbiddenNotifier'
import { getTokenProvider, type TokenProvider } from './tokenProvider'

/** Peticiones normales. */
export const DEFAULT_TIMEOUT_MS = 30_000
/** Subidas (cuerpo `FormData`) y descargas de archivos (`getBlob`). */
export const TRANSFER_TIMEOUT_MS = 120_000

type RequestExtras = {
  /** Tiempo máximo en ms. Por defecto 30 s, o 120 s si el cuerpo es `FormData`. */
  timeoutMs?: number
  /**
   * `false` desactiva el `login()` automático cuando el 401 persiste tras
   * renovar el token y el aviso global de 403. Lo usa la carga inicial de
   * `/users/me`, que muestra su propia pantalla y debe evitar un bucle de
   * redirecciones. El reintento único tras un 401 se hace siempre. Por defecto `true`.
   */
  handleAuthErrors?: boolean
}

type HttpRequestOptions = Omit<RequestInit, 'method'> &
  RequestExtras & {
    method: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT'
  }

const getApiBaseUrl = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

  if (!baseUrl) {
    throw new ConfigError('Configura VITE_API_BASE_URL antes de realizar peticiones.')
  }

  return baseUrl.replace(/\/$/, '')
}

const buildUrl = (endpoint: string) => {
  const normalizedEndpoint = endpoint.trim().replace(/^\//, '')
  return `${getApiBaseUrl()}/${normalizedEndpoint}`
}

type Attempt = {
  response: Response
  /** Detiene el temporizador y suelta la señal del llamador. */
  finish: () => void
  hasTimedOut: () => boolean
}

/**
 * Un envío con temporizador. La señal del llamador y el temporizador se enlazan
 * con un `AbortController` propio: cancelar propaga `AbortError` y vencer el
 * tiempo produce `TimeoutError`. No fija `Content-Type`: con `FormData` el
 * navegador agrega el `boundary`.
 */
const send = async (
  url: string,
  init: RequestInit,
  token: string | null,
  timeoutMs: number,
): Promise<Attempt> => {
  const controller = new AbortController()
  const external = init.signal ?? null
  let timedOut = false

  const timer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, timeoutMs)
  const onExternalAbort = () => controller.abort()

  if (external) {
    if (external.aborted) {
      controller.abort()
    } else {
      external.addEventListener('abort', onExternalAbort, { once: true })
    }
  }

  const finish = () => {
    clearTimeout(timer)
    external?.removeEventListener('abort', onExternalAbort)
  }

  const headers = new Headers(init.headers)

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  try {
    const response = await fetch(url, { ...init, headers, signal: controller.signal })

    return { response, finish, hasTimedOut: () => timedOut }
  } catch (error) {
    finish()

    if (timedOut) {
      throw new TimeoutError()
    }
    if (isAbortError(error)) {
      throw error
    }

    throw new NetworkError()
  }
}

/** Texto de `{ "detail": "…" }`, leído de una copia para no consumir la respuesta. */
const readDetail = async (response: Response) => {
  try {
    const data: unknown = await response.clone().json()
    const detail = (data as { detail?: unknown } | null)?.detail

    return typeof detail === 'string' ? detail : undefined
  } catch {
    return undefined
  }
}

/** Si no hay token válido, se redirige a Keycloak y la petición no se envía. */
const obtainToken = async (provider: TokenProvider, get: () => Promise<string>) => {
  try {
    return await get()
  } catch {
    provider.login()
    throw new AuthRequiredError()
  }
}

/**
 * Único punto de salida hacia el backend.
 *
 * Con el `TokenProvider` de la sesión de Keycloak: renueva el token si hace
 * falta y lo adjunta; ante un 401 renueva y reintenta UNA vez (si vuelve a
 * fallar, `login()`); ante un 403 no reintenta y avisa al usuario con el
 * `detail`.
 */
const execute = async (endpoint: string, options: HttpRequestOptions): Promise<Attempt> => {
  const url = buildUrl(endpoint)
  const { timeoutMs, handleAuthErrors = true, ...init } = options
  const timeout =
    timeoutMs ?? (init.body instanceof FormData ? TRANSFER_TIMEOUT_MS : DEFAULT_TIMEOUT_MS)
  const provider = getTokenProvider()

  const token = provider ? await obtainToken(provider, provider.getToken) : null
  let attempt = await send(url, init, token, timeout)

  if (provider && attempt.response.status === 401) {
    void attempt.response.body?.cancel()
    attempt.finish()

    // Renueva y reintenta una sola vez (los cuerpos FormData/texto/Blob se pueden reenviar).
    const refreshed = await obtainToken(provider, provider.refreshToken)

    attempt = await send(url, init, refreshed, timeout)

    // Si vuelve a fallar, se pide iniciar sesión, salvo en la carga inicial de
    // `/users/me` (`handleAuthErrors: false`), que muestra su propia pantalla.
    if (attempt.response.status === 401 && handleAuthErrors) {
      provider.login()
    }
  }

  if (handleAuthErrors && attempt.response.status === 403) {
    notifyForbidden(await readDetail(attempt.response))
  }

  return attempt
}

/**
 * Devuelve la `Response`. El temporizador cubre hasta recibir las cabeceras
 * (incluida la subida del cuerpo); la lectura del cuerpo corre por cuenta del
 * llamador.
 */
const request = async (endpoint: string, options: HttpRequestOptions) => {
  const attempt = await execute(endpoint, options)

  attempt.finish()

  return attempt.response
}

/** GET que devuelve el JSON tipado y lanza `HttpError` si la respuesta no es 2xx. */
const getJson = async <T>(
  endpoint: string,
  signal?: AbortSignal,
  extras: RequestExtras = {},
): Promise<T> => {
  const attempt = await execute(endpoint, { method: 'GET', signal, ...extras })

  try {
    if (!attempt.response.ok) {
      throw new HttpError(attempt.response.status, undefined, await readDetail(attempt.response))
    }

    return (await attempt.response.json()) as T
  } catch (error) {
    if (!(error instanceof HttpError) && attempt.hasTimedOut()) {
      throw new TimeoutError()
    }

    throw error
  } finally {
    attempt.finish()
  }
}

/**
 * GET que devuelve el cuerpo como `Blob` (archivos). Lanza `HttpError` si la
 * respuesta no es 2xx y `NetworkError` si la conexión se corta al leer el
 * cuerpo. Usa el tiempo máximo de transferencias (120 s) y lo mantiene activo
 * mientras se lee el archivo.
 */
const getBlob = async (
  endpoint: string,
  signal?: AbortSignal,
  extras: RequestExtras = {},
): Promise<Blob> => {
  const attempt = await execute(endpoint, {
    method: 'GET',
    signal,
    timeoutMs: TRANSFER_TIMEOUT_MS,
    ...extras,
  })

  try {
    if (!attempt.response.ok) {
      throw new HttpError(attempt.response.status, undefined, await readDetail(attempt.response))
    }

    return await attempt.response.blob()
  } catch (error) {
    if (error instanceof HttpError) {
      throw error
    }
    if (attempt.hasTimedOut()) {
      throw new TimeoutError()
    }
    if (isAbortError(error)) {
      throw error
    }

    throw new NetworkError()
  } finally {
    attempt.finish()
  }
}

export const httpClient = {
  request,
  getJson,
  getBlob,
  get: (endpoint: string, signal?: AbortSignal, extras: RequestExtras = {}) =>
    request(endpoint, {
      method: 'GET',
      signal,
      ...extras,
    }),
  post: (endpoint: string, body?: BodyInit, signal?: AbortSignal) =>
    request(endpoint, {
      method: 'POST',
      body,
      signal,
    }),
  postJson: (endpoint: string, body: unknown, signal?: AbortSignal) =>
    request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
      signal,
    }),
  patch: (endpoint: string, body?: BodyInit, signal?: AbortSignal) =>
    request(endpoint, {
      method: 'PATCH',
      body,
      headers: { 'Content-Type': 'application/json' },
      signal,
    }),
}
