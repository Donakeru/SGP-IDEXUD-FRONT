import type { ReactNode } from 'react'
import { usePermissions } from '../../auth/usePermissions'
import AccessDenied from '../../pages/AccessDenied'
import type { Capability } from '../../types/auth/Capability'

type RequireCapabilityProps = {
  capability: Capability
  children: ReactNode
}

/** Protege una página: sin la capacidad, muestra acceso denegado (también por URL). */
export default function RequireCapability({
  capability,
  children,
}: RequireCapabilityProps) {
  const { can } = usePermissions()

  return can(capability) ? <>{children}</> : <AccessDenied />
}
