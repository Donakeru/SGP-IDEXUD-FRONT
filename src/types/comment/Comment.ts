export type CommentCategory =
  | 'Visto bueno'
  | 'Aprobado con observaciones'
  | 'Rechazado'

export const COMMENT_CATEGORIES: readonly CommentCategory[] = [
  'Visto bueno',
  'Aprobado con observaciones',
  'Rechazado',
]

export type CommentAuthor = {
  id: number
  name: string
  /** Nombre legible del rol, por ejemplo "Dirección". */
  role: string
}

export type Comment = {
  id: string
  proposalId: string
  text: string
  category: CommentCategory
  /** Documento al que se refiere el comentario, si aplica. */
  documentName?: string
  /** Fecha de creación en formato ISO 8601. */
  createdAt: string
  author: CommentAuthor
}

export type NewCommentInput = {
  text: string
  category: CommentCategory
  documentName?: string
}
