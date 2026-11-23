/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base del backend (incluye `/api`). */
  readonly VITE_API_BASE_URL?: string
  /** `dev` (login provisional por ID) o `keycloak`. Si falta, vale `keycloak`. */
  readonly VITE_AUTH_MODE?: string
  readonly VITE_KEYCLOAK_URL?: string
  readonly VITE_KEYCLOAK_REALM?: string
  readonly VITE_KEYCLOAK_CLIENT_ID?: string
  /** Tamaño máximo por archivo (1 a 10 MB). */
  readonly VITE_MAX_FILE_SIZE_MB?: string
}
