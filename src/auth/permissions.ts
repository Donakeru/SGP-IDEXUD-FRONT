import type { Capability } from '../types/auth/Capability'

/**
 * Único lugar donde se relacionan roles con capacidades.
 *
 * Reglas:
 * - Los componentes nunca comparan códigos de rol; consultan capacidades con
 *   `usePermissions().can('...')`, `<Can>`, `<RequireCapability>` o `<ProtectedRoute>`.
 * - Un usuario con varios roles tiene la unión de las capacidades de cada uno.
 * - Habilitar un rol nuevo es agregar una línea a este mapa.
 * - Los guards del front son solo experiencia de usuario: el backend valida de verdad.
 */
export const ROLE_CAPABILITIES = {
  administrador: ['ver_propuestas', 'ver_revision', 'comentar'],
  direccion: ['ver_propuestas', 'ver_revision', 'comentar'],
  asistente_direccion: ['ver_propuestas', 'ver_revision', 'comentar'],
  equipo_multidisciplinar: [
    'ver_propuestas',
    'ver_revision',
    'comentar',
    'cargar_propuesta',
  ],
  // TODO: habilitar cuando se definan sus permisos (agregar una línea por rol):
  // juridica: [...],
  // licitaciones: [...],
  // comite_central_extension: [...],
} as const satisfies Record<string, readonly Capability[]>

// TODO: la capacidad 'decidir_propuesta' (aprobar/rechazar) está declarada en
// `Capability` pero no se asigna a ningún rol todavía. Asignarla aquí cuando se
// implemente esa funcionalidad.

export type ConfiguredRoleCode = keyof typeof ROLE_CAPABILITIES

const capabilitiesByRole: Readonly<Record<string, readonly Capability[]>> =
  ROLE_CAPABILITIES

/** Indica si el rol del backend tiene permisos configurados en el front. */
export function isConfiguredRole(roleCode: string): roleCode is ConfiguredRoleCode {
  return Object.prototype.hasOwnProperty.call(capabilitiesByRole, roleCode)
}

/**
 * Unión de las capacidades de todos los roles recibidos.
 * Los códigos sin configurar se ignoran, así que un usuario que solo tenga
 * roles sin configurar obtiene un conjunto vacío.
 */
export function getCapabilities(roleCodes: readonly string[]): ReadonlySet<Capability> {
  const capabilities = new Set<Capability>()

  for (const roleCode of roleCodes) {
    if (!isConfiguredRole(roleCode)) {
      continue
    }

    for (const capability of capabilitiesByRole[roleCode]) {
      capabilities.add(capability)
    }
  }

  return capabilities
}
