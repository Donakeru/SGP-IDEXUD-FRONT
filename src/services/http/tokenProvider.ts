/**
 * Contrato entre el cliente HTTP y el proveedor de autenticación. El cliente
 * HTTP no conoce Keycloak: solo pide el token a quien esté registrado.
 *
 * El proveedor de autenticación lo registra cuando la sesión de Keycloak está
 * lista y lo retira al cerrar sesión.
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
