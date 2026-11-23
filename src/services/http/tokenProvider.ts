/**
 * Contrato entre el cliente HTTP y el proveedor de autenticación. El cliente
 * HTTP no conoce Keycloak: solo pide el token a quien esté registrado.
 *
 * En modo `dev` no hay ningún proveedor registrado, así que no se envía el
 * encabezado `Authorization`.
 */
export type TokenProvider = {
  /** Renueva el token si le quedan menos de 30 s y devuelve el token vigente. */
  getToken: () => Promise<string>
  /** Fuerza la renovación (se usa tras un 401). */
  refreshToken: () => Promise<string>
  /** Redirige al inicio de sesión. */
  login: () => void
}

let currentProvider: TokenProvider | null = null

export function setTokenProvider(provider: TokenProvider | null) {
  currentProvider = provider
}

export function getTokenProvider() {
  return currentProvider
}
