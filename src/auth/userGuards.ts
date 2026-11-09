import type { Role } from '../types/user/Role'
import type { User } from '../types/user/User'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isRole(value: unknown): value is Role {
  return (
    isRecord(value) &&
    typeof value.codigo === 'string' &&
    typeof value.nombre === 'string'
  )
}

/**
 * Valida que un valor desconocido (respuesta del backend o contenido del
 * almacenamiento) tenga la forma de `User`. Devuelve `null` si no la tiene.
 * Si `roles` no viene, se asume una lista vacía.
 */
export function normalizeUser(value: unknown): User | null {
  if (!isRecord(value)) {
    return null
  }

  const { id_usuario, nombre, correo, es_activo, roles = [] } = value

  if (
    typeof id_usuario !== 'number' ||
    !Number.isInteger(id_usuario) ||
    typeof nombre !== 'string' ||
    typeof correo !== 'string' ||
    typeof es_activo !== 'boolean' ||
    !Array.isArray(roles) ||
    !roles.every(isRole)
  ) {
    return null
  }

  return {
    id_usuario,
    nombre,
    correo,
    es_activo,
    roles: roles.map((role) => ({ codigo: role.codigo, nombre: role.nombre })),
  }
}
