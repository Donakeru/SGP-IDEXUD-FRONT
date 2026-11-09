/** Rol tal como lo devuelve el backend (`roles[]` en `GET /users/{id_usuario}`). */
export type Role = {
  codigo: string
  nombre: string
}
