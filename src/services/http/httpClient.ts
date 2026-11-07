type HttpRequestOptions = Omit<RequestInit, 'method'> & {
  method: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT'
}

const getApiBaseUrl = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

  if (!baseUrl) {
    throw new Error('Configura VITE_API_BASE_URL antes de realizar peticiones.')
  }

  return baseUrl.replace(/\/$/, '')
}

const buildUrl = (endpoint: string) => {
  const normalizedEndpoint = endpoint.trim().replace(/^\//, '')
  return `${getApiBaseUrl()}/${normalizedEndpoint}`
}

const request = (endpoint: string, options: HttpRequestOptions) =>
  fetch(buildUrl(endpoint), options)

export const httpClient = {
  request,
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
