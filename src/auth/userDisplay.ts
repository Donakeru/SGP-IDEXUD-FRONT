import type { User } from '../types/user/User'

/** Dos iniciales en mayúscula: "Ana Gómez" → "AG". */
export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) {
    return '?'
  }

  const first = parts[0][0]
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''

  return `${first}${last}`.toUpperCase()
}

export function getFirstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? ''
}

/** Nombres legibles de los roles, separados por coma. */
export function getRoleLabel(user: User) {
  return user.roles.map((role) => role.nombre).join(', ')
}
