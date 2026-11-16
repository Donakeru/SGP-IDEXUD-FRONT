import { ConfigError, HttpError, NetworkError, isAbortError } from './http/errors'
import { httpClient } from './http/httpClient'
import { isPreviewable, normalizeMime } from '../utils/file'
import type { ProposalDocument } from '../types/proposal/ProposalDocument'

/**
 * Acceso a los archivos adjuntos: `GET /proposal/documents/{uuid_archivo}`.
 * - `download=false` (por defecto): el backend responde inline (vista previa).
 * - `download=true`: responde como adjunto.
 * Siempre se usa `uuid_archivo`, nunca el id numérico.
 */

export type DocumentErrorKind =
  | 'not_found'
  | 'invalid'
  | 'network'
  | 'server'
  | 'config'

const DOCUMENT_ERROR_MESSAGES: Record<DocumentErrorKind, string> = {
  not_found:
    'No encontramos este archivo. Puede haber sido eliminado o no estar disponible.',
  invalid: 'El identificador del archivo no es válido.',
  network:
    'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
  server:
    'El servidor no pudo entregar el archivo. Inténtalo de nuevo en unos minutos.',
  config: 'Falta configurar la URL del servidor.',
}

export class DocumentError extends Error {
  readonly kind: DocumentErrorKind

  constructor(kind: DocumentErrorKind) {
    super(DOCUMENT_ERROR_MESSAGES[kind])
    this.name = 'DocumentError'
    this.kind = kind
  }
}

/** Reintentar no tiene sentido si el identificador es inválido o falta configuración. */
export function isRetryableDocumentError(error: DocumentError) {
  return error.kind !== 'invalid' && error.kind !== 'config'
}

/** Convierte cualquier excepción en un `DocumentError` con mensaje para el usuario. */
export function toDocumentError(error: unknown): DocumentError {
  if (error instanceof DocumentError) {
    return error
  }
  if (error instanceof HttpError) {
    if (error.status === 404) {
      return new DocumentError('not_found')
    }

    return new DocumentError(error.status === 422 ? 'invalid' : 'server')
  }
  if (error instanceof NetworkError) {
    return new DocumentError('network')
  }
  if (error instanceof ConfigError) {
    return new DocumentError('config')
  }

  return new DocumentError('server')
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type GetDocumentBlobOptions = {
  /** `true` pide el archivo como adjunto (`?download=true`). */
  download?: boolean
  /**
   * Tipo MIME declarado en la lista. Si es previsualizable y no es una
   * descarga, el blob se re-etiqueta con él (ver abajo).
   */
  mimeType?: string
  signal?: AbortSignal
}

/**
 * Pide el archivo como `Blob` por el cliente HTTP único.
 *
 * Seguridad: para una vista previa, el blob se recrea con el tipo MIME de la
 * lista (solo PDF e imágenes permitidas), no con el `Content-Type` de la
 * respuesta. Así, aunque el servidor enviara otro tipo (por ejemplo HTML o
 * SVG), el navegador nunca lo interpretaría como tal.
 *
 * Lanza `DocumentError`; las cancelaciones (`AbortError`) se propagan sin cambio.
 */
export async function getDocumentBlob(
  uuidArchivo: string,
  { download = false, mimeType, signal }: GetDocumentBlobOptions = {},
): Promise<Blob> {
  if (!UUID_PATTERN.test(uuidArchivo)) {
    throw new DocumentError('invalid')
  }

  try {
    const blob = await httpClient.getBlob(
      `/proposal/documents/${uuidArchivo}?download=${download ? 'true' : 'false'}`,
      signal,
    )

    if (!download && mimeType && isPreviewable(mimeType)) {
      return new Blob([blob], { type: normalizeMime(mimeType) })
    }

    return blob
  } catch (error) {
    if (isAbortError(error)) {
      throw error
    }

    throw toDocumentError(error)
  }
}

/**
 * Guarda un blob con el nombre dado, sin abrir otra pestaña: enlace temporal
 * con `download`. La URL se revoca poco después para liberar memoria.
 */
export function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = window.document.createElement('a')

  link.href = url
  link.download = fileName.trim() || 'documento'
  link.rel = 'noopener'
  link.style.display = 'none'
  window.document.body.appendChild(link)
  link.click()
  link.remove()

  // Algunos navegadores necesitan un momento para iniciar la descarga.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Descarga el documento y lo guarda con su `nombre_original`. */
export async function downloadDocument(
  doc: Pick<ProposalDocument, 'uuid_archivo' | 'nombre_original'>,
  signal?: AbortSignal,
) {
  const blob = await getDocumentBlob(doc.uuid_archivo, { download: true, signal })

  saveBlob(blob, doc.nombre_original)
}
