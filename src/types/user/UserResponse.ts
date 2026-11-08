import type { UserRole } from './UserRole'

export type UserResponse = {
  nombre: string
  correo: string
  roles: UserRole[]
}
