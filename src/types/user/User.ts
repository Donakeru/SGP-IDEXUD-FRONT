import type { Role } from './Role'

/** Usuario tal como lo devuelve `GET /users/me`. Todos los campos son obligatorios. */
export type User = {
  id_usuario: number
  nombre: string
  correo: string
  es_activo: boolean
  roles: Role[]
}
