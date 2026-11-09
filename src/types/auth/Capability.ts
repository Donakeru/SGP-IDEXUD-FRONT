/** Permisos funcionales de la aplicación. Se consultan con `usePermissions().can(...)`. */
export type Capability =
  | 'ver_propuestas'
  | 'ver_revision'
  | 'comentar'
  | 'cargar_propuesta'
  | 'decidir_propuesta'
