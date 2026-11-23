import { useEffect, useState } from 'react'
import { appConfig, type AuthMode } from '../config/env'
import { getBackendAuthMode } from '../services/healthService'

// Una sola consulta por carga de la página (React StrictMode ejecuta los efectos dos veces).
let healthCheck: Promise<AuthMode | null> | null = null

/**
 * Compara el modo de autenticación del front (`VITE_AUTH_MODE`) con el del
 * backend (`GET /health`, sin token, sin bloquear el arranque). Si no coinciden:
 * `console.error` siempre y, solo en desarrollo, una barra de aviso visible.
 * Si `/health` falla, no hace nada.
 */
export default function AuthModeBanner() {
  const [backendMode, setBackendMode] = useState<AuthMode | null>(null)
  const frontMode = appConfig.status === 'ok' ? appConfig.authMode : null

  useEffect(() => {
    if (!frontMode) {
      return
    }

    let active = true

    healthCheck ??= getBackendAuthMode()
    void healthCheck.then((mode) => {
      if (active) {
        setBackendMode(mode)
      }
    })

    return () => {
      active = false
    }
  }, [frontMode])

  const mismatch = frontMode !== null && backendMode !== null && backendMode !== frontMode

  useEffect(() => {
    if (mismatch) {
      console.error(
        `[auth] El modo del front (VITE_AUTH_MODE="${frontMode}") no coincide con el del backend (auth_mode="${backendMode}").`,
      )
    }
  }, [backendMode, frontMode, mismatch])

  if (!mismatch || !import.meta.env.DEV) {
    return null
  }

  return (
    <div
      className="border-b border-danger-line bg-danger-soft px-4 py-2 text-center text-[11px] font-semibold text-danger"
      role="alert"
    >
      Modo de autenticación distinto: el front usa «{frontMode}» y el backend usa «{backendMode}».
      Ajusta VITE_AUTH_MODE o AUTH_MODE.
    </div>
  )
}
