import type { ReactNode } from 'react'
import { usePermissions } from '../../auth/usePermissions'
import type { Capability } from '../../types/auth/Capability'

type CanProps = {
  capability: Capability
  children: ReactNode
  /** Qué mostrar si no tiene la capacidad. Por defecto, nada. */
  fallback?: ReactNode
}

/** Muestra `children` solo si el usuario tiene la capacidad. */
export default function Can({ capability, children, fallback = null }: CanProps) {
  const { can } = usePermissions()

  return <>{can(capability) ? children : fallback}</>
}
