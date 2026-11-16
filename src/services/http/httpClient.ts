import { ConfigError, HttpError, NetworkError, isAbortError } from './errors'

type HttpRequestOptions = Omit<RequestInit, 'method'> & {
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

/**
 * Único punto de salida hacia el backend. Convierte los fallos de red en
 * `NetworkError` y deja pasar las cancelaciones (`AbortError`) sin cambios.
 * No fija `Content-Type`: con `FormData` el navegador agrega el boundary.
 */
const request = async (endpoint: string, options: HttpRequestOptions) => {
  const url = buildUrl(endpoint)

  try {
    return await fetch(url, options)
  } catch (error) {
    if (isAbortError(error)) {
      throw error
    }

    throw new NetworkError()
  }
}

/** GET que devuelve el JSON tipado y lanza `HttpError` si la respuesta no es 2xx. */
const getJson = async <T>(endpoint: string, signal?: AbortSignal): Promise<T> => {
  const response = await request(endpoint, { method: 'GET', signal })

  if (!response.ok) {
    throw new HttpError(response.status)
  }

  return (await response.json()) as T
}

/**
 * GET que devuelve el cuerpo como `Blob` (archivos). Lanza `HttpError` si la
 * respuesta no es 2xx y `NetworkError` si la conexión se corta al leer el cuerpo.
 *
 * TODO: cuando exista autenticación por token, agregar aquí el encabezado
 * `Authorization` (en `request`). Por eso los archivos se piden con `fetch` y
 * no con un enlace directo.
 */
const getBlob = async (endpoint: string, signal?: AbortSignal): Promise<Blob> => {
  const response = await request(endpoint, { method: 'GET', signal })

  if (!response.ok) {
    throw new HttpError(response.status)
  }

  try {
    return await response.blob()
  } catch (error) {
    if (isAbortError(error)) {
      throw error
    }

    throw new NetworkError()
  }
}

export const httpClient = {
  request,
  getJson,
  getBlob,
  get: (endpoint: string, signal?: AbortSignal) =>
    request(endpoint, {
      method: 'GET',
      signal,
    }),
  post: (endpoint: string, body?: BodyInit, signal?: AbortSignal) =>
    request(endpoint, {
      method: 'POST',
      body,
      signal,
    }),
}
