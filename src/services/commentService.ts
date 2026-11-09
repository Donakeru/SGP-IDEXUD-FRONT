import type {
  Comment,
  CommentAuthor,
  NewCommentInput,
} from '../types/comment/Comment'

/**
 * ⚠️ TEMPORAL: el backend todavía NO tiene endpoint de comentarios.
 *
 * El OpenAPI actual solo expone usuarios, propuestas (lista, revisión,
 * creación) y listas; no hay nada para listar ni crear comentarios. Mientras
 * tanto este servicio guarda los comentarios EN MEMORIA: se pierden al
 * recargar la página y no se comparten entre usuarios.
 *
 * TODO: cuando el backend publique el endpoint (ruta por definir):
 *   - `getComments` → listar los comentarios de una propuesta.
 *   - `createComment` → crear un comentario. Se espera que el backend tome el
 *     autor del usuario autenticado; entonces el parámetro `author` se elimina.
 *   - Reemplazar el almacén en memoria por `httpClient` y poner
 *     `COMMENTS_ENDPOINT_AVAILABLE = true` (o borrar la constante).
 * Las firmas y el tipo `Comment` deben mantenerse para no tocar las vistas.
 */
export const COMMENTS_ENDPOINT_AVAILABLE = false

const store = new Map<string, Comment[]>()

/** Comentarios de ejemplo (los mismos que mostraba la pantalla de detalle). */
function createSeedComments(proposalId: string): Comment[] {
  return [
    {
      id: `${proposalId}-seed-1`,
      proposalId,
      text: 'Falta el certificado de existencia y representación legal de la entidad.',
      category: 'Aprobado con observaciones',
      createdAt: '2026-10-07T10:42:00-05:00',
      author: { id: -1, name: 'Laura Gómez', role: 'Jurídica' },
    },
    {
      id: `${proposalId}-seed-2`,
      proposalId,
      text: 'Al proyecto le hace falta detallar el presupuesto por rubros.',
      category: 'Rechazado',
      createdAt: '2026-10-08T15:18:00-05:00',
      author: { id: -2, name: 'Carlos Ruiz', role: 'Licitaciones' },
    },
    {
      id: `${proposalId}-seed-3`,
      proposalId,
      text: 'Se cargó la versión 2 con el presupuesto ajustado.',
      category: 'Visto bueno',
      createdAt: '2026-10-12T09:06:00-05:00',
      author: { id: -3, name: 'Equipo técnico', role: 'Formulación de proyectos' },
    },
  ]
}

function getOrCreate(proposalId: string) {
  let comments = store.get(proposalId)

  if (!comments) {
    comments = createSeedComments(proposalId)
    store.set(proposalId, comments)
  }

  return comments
}

export async function getComments(
  proposalId: string,
  signal?: AbortSignal,
): Promise<Comment[]> {
  signal?.throwIfAborted()

  return [...getOrCreate(proposalId)]
}

export async function createComment(
  proposalId: string,
  input: NewCommentInput,
  author: CommentAuthor,
): Promise<Comment> {
  const text = input.text.trim()

  if (!text) {
    throw new Error('El comentario no puede estar vacío.')
  }

  const comment: Comment = {
    id: `${proposalId}-${Date.now()}`,
    proposalId,
    text,
    category: input.category,
    documentName: input.documentName || undefined,
    createdAt: new Date().toISOString(),
    author,
  }

  getOrCreate(proposalId).push(comment)

  return comment
}
