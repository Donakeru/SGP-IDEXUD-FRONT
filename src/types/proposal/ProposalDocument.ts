/**
 * Documento adjunto de una propuesta, tal como lo devuelve el backend dentro de
 * `GET /proposal/review` (`ProposalReviewDocument` en el OpenAPI).
 */
export type ProposalDocument = {
  /** Nombre mostrado por el backend (hoy igual a `nombre_original`). */
  name: string
  /** Tamaño ya formateado por el backend, por ejemplo "29,5 KB". */
  size: string
  id_documento: number
  /** Identificador para pedir el archivo. Nunca se usa `id_documento` para eso. */
  uuid_archivo: string
  /** Nombre con el que se guarda el archivo al descargarlo. */
  nombre_original: string
  tipo_mime: string
  tamano_bytes: number
  numero_version: number
  /** `true` si es la versión actual del documento. */
  es_vigente: boolean
  /** Clasificación del documento, por ejemplo "propuesta". */
  tipo_documento: string
}
