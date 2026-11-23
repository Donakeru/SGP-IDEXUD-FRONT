import type { Capability } from '../types/auth/Capability'

/**
 * Configuración única de las ventanas del dashboard. De aquí salen tanto las
 * rutas (router/index.tsx) como el menú lateral (Sidebar) y la ruta de inicio
 * por defecto. Cada entrada declara la capacidad que exige; nunca se
 * comprueban roles.
 *
 * Para agregar una ventana: una entrada aquí y su elemento en router/index.tsx.
 */

export const DASHBOARD_BASE = '/dashboard'

export type RouteId =
  | 'home'
  | 'proposals'
  | 'proposal-detail'
  | 'proposal-new'
  | 'review'

export type NavIconName = 'dashboard' | 'folder' | 'review'

export type NavGroup = 'principal' | 'administracion'

export type AppRouteConfig = {
  id: RouteId
  /** Ruta relativa a `/dashboard`. Vacía para la ruta índice. */
  path: string
  capability: Capability
  /** Si existe, la ruta aparece en el menú lateral. */
  nav?: {
    label: string
    icon: NavIconName
    group: NavGroup
    badge?: string
    /** `true`: activa solo con la ruta exacta (por defecto, también con subrutas). */
    exact?: boolean
  }
}

export const appRoutes: readonly AppRouteConfig[] = [
  {
    id: 'home',
    path: '',
    capability: 'ver_propuestas',
    nav: { label: 'Inicio', icon: 'dashboard', group: 'principal', exact: true },
  },
  {
    id: 'proposals',
    path: 'proposals',
    capability: 'ver_propuestas',
    nav: { label: 'Propuestas', icon: 'folder', group: 'principal', badge: '24' },
  },
  { id: 'proposal-detail', path: 'proposals/detail', capability: 'ver_propuestas' },
  { id: 'proposal-new', path: 'proposals/new', capability: 'cargar_propuesta' },
  {
    id: 'review',
    path: 'review',
    capability: 'ver_revision',
    nav: { label: 'Revisión', icon: 'review', group: 'principal' },
  },
  // TODO: "Usuarios y roles" y "Configuración" estaban en el menú sin ruta ni
  // capacidad. Se retiraron; volver a agregarlos aquí cuando existan sus
  // pantallas y su capacidad.
]

export function toAbsolutePath(route: AppRouteConfig) {
  return route.path ? `${DASHBOARD_BASE}/${route.path}` : DASHBOARD_BASE
}

/** Rutas con entrada de menú a las que el usuario tiene acceso. */
export function getNavRoutes(can: (capability: Capability) => boolean) {
  return appRoutes.filter((route) => route.nav && can(route.capability))
}

/** Primera ventana con menú a la que el usuario puede entrar. */
export function getDefaultPath(can: (capability: Capability) => boolean) {
  const first = getNavRoutes(can)[0]

  return first ? toAbsolutePath(first) : DASHBOARD_BASE
}
