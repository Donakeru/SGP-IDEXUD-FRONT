import { useCallback, useMemo } from 'react'
import type { Capability } from '../types/auth/Capability'
import { getCapabilities } from './permissions'
import { useAuth } from './useAuth'

/** Consulta de capacidades del usuario de la sesión. */
export function usePermissions() {
  const { roles } = useAuth()
  const capabilities = useMemo(() => getCapabilities(roles), [roles])

  const can = useCallback(
    (capability: Capability) => capabilities.has(capability),
    [capabilities],
  )

  return {
    can,
    capabilities,
    /** `true` si al menos uno de sus roles tiene permisos configurados. */
    hasAccess: capabilities.size > 0,
  }
}
