import { httpClient } from './http/httpClient'
import type { CreateProposalDto } from '../types/proposal/CreateProposalDto'
import type { ProposalDocument } from '../types/proposal/ProposalDocument'
import type { ProposalListResponse } from '../types/proposal/ProposalListResponse'
import type { ProposalDetailComment, ProposalDetailResponse } from '../types/proposal/ProposalDetail'
import type { ReviewProposal } from '../types/proposal/ReviewProposal'
import type { UpdateProposalStatusDto } from '../types/proposal/UpdateProposalStatusDto'
import type { UpdateProposalStatusResponse } from '../types/proposal/UpdateProposalStatusResponse'


export function buildCreateProposalFormData(dto: CreateProposalDto) {
  const formData = new FormData()

  formData.append('applicantType', dto.applicantType)
  formData.append('organizationName', dto.organizationName)
  formData.append('nit', dto.nit)
  formData.append('contactName', dto.contactName)
  formData.append('role', dto.role)
  formData.append('email', dto.email)
  formData.append('phone', dto.phone)
  formData.append('title', dto.title)
  formData.append('proposalType', dto.proposalType)
  formData.append('description', dto.description)
  formData.append('justification', dto.justification)
  formData.append('startDate', dto.startDate)
  formData.append('privacyAccepted', String(dto.privacyAccepted))

  dto.proposalFiles.forEach((file) => {
    formData.append('proposalFiles', file, file.name)
  })

  dto.facultyFiles.forEach((file) => {
    formData.append('facultyFiles', file, file.name)
  })

  return formData
}

export async function createProposal(
  dto: CreateProposalDto,
  signal?: AbortSignal,
): Promise<Response> {
  const response = await httpClient.post(
    '/proposal/',
    buildCreateProposalFormData(dto),
    signal,
  )

  if (!response.ok) {
    throw new Error(`No fue posible crear la propuesta (${response.status}).`)
  }

  return response
}

export type ProposalDocumentType = 'propuesta' | 'facultad'

export async function uploadProposalDocument(
  uuidExpediente: string,
  file: File,
  idUsuario: number,
  tipoDocumento: ProposalDocumentType = 'propuesta',
  signal?: AbortSignal,
): Promise<unknown> {
  const uuid = uuidExpediente.trim()

  if (!uuid || !file || typeof file.name !== 'string') {
    throw new Error('El UUID y el archivo son obligatorios.')
  }

  if (!Number.isFinite(idUsuario)) {
    throw new Error('El usuario es obligatorio para adjuntar documentos.')
  }

  const formData = new FormData()
  formData.append('file', file, file.name)
  formData.append('idUsuario', String(idUsuario))
  formData.append('tipoDocumento', tipoDocumento)

  const response = await httpClient.post(
    `/proposal/${encodeURIComponent(uuid)}/documents`,
    formData,
    signal,
  )

  return parseApiResponse<unknown>(
    response,
    'No fue posible adjuntar el documento',
  )
}

export async function getProposals(
  offset = 0,
  limit = 20,
  signal?: AbortSignal,
): Promise<ProposalListResponse> {
  const searchParams = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  })
  const response = await httpClient.get(
    `/proposal/?${searchParams.toString()}`,
    signal,
  )

  if (!response.ok) {
    throw new Error(`No fue posible consultar las propuestas (${response.status}).`)
  }

  return response.json() as Promise<ProposalListResponse>
}

export async function getReviewProposals(
  roleCode: string,
  signal?: AbortSignal,
): Promise<ReviewProposal[]> {
  const normalizedRoleCode = roleCode.trim()

  if (!normalizedRoleCode) {
    throw new Error('El código del rol es obligatorio para consultar la revisión.')
  }

  const searchParams = new URLSearchParams({ rol: normalizedRoleCode })
  const response = await httpClient.get(
    `/proposal/review?${searchParams.toString()}`,
    signal,
  )

  if (!response.ok) {
    throw new Error(`No fue posible consultar la bandeja de revisión (${response.status}).`)
  }

  const data: unknown = await response.json()

  if (!Array.isArray(data)) {
    throw new Error('La respuesta de revisión no tiene el formato esperado.')
  }

  return (data as ReviewProposal[]).map((proposal) => ({
    ...proposal,
    status: normalizeReviewStatus(proposal.status),
    documents: normalizeDocuments((proposal as { documents?: unknown }).documents),
  }))
}

function normalizeReviewStatus(status: unknown): ReviewProposal['status'] {
  if (status === 'En Revision por Direccion') {
    return 'En revisión de Dirección'
  }

  if (status === 'Aceptado') {
    return 'Aceptada'
  }

  if (status === 'Rechazado') {
    return 'Rechazada'
  }

  return status as ReviewProposal['status']
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

/**
 * Valida un documento del backend (`ProposalReviewDocument`). Devuelve `null`
 * si falta algún campo que la interfaz necesita, para que un documento mal
 * formado no rompa la lista. `name`, `size` y `tipo_documento` solo se muestran
 * como apoyo, así que se completan si faltan.
 */
export function normalizeDocument(value: unknown): ProposalDocument | null {
  if (!isRecord(value)) {
    return null
  }

  const {
    id_documento,
    nombre_original,
    tipo_mime,
    tamano_bytes,
    numero_version,
    es_vigente,
  } = value
  const uuid_archivo = value.uuid_archivo ?? value.uuidArchivo

  if (
    !isFiniteNumber(id_documento) ||
    typeof uuid_archivo !== 'string' ||
    !uuid_archivo ||
    typeof nombre_original !== 'string' ||
    typeof tipo_mime !== 'string' ||
    !isFiniteNumber(tamano_bytes) ||
    !isFiniteNumber(numero_version) ||
    typeof es_vigente !== 'boolean'
  ) {
    return null
  }

  return {
    id_documento,
    uuid_archivo,
    nombre_original,
    tipo_mime,
    tamano_bytes,
    numero_version,
    es_vigente,
    name: typeof value.name === 'string' ? value.name : nombre_original,
    size: typeof value.size === 'string' ? value.size : '',
    tipo_documento: typeof value.tipo_documento === 'string' ? value.tipo_documento : '',
  }
}



/** Convierte `documents` en una lista válida; si no es una lista, queda vacía. */
function normalizeDocuments(value: unknown): ProposalDocument[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map(normalizeDocument)
    .filter((document): document is ProposalDocument => document !== null)
}

export async function updateProposalStatus(
  uuidExpediente: string,
  dto: UpdateProposalStatusDto,
  signal?: AbortSignal,
): Promise<UpdateProposalStatusResponse> {
  const normalizedUuid = uuidExpediente.trim()

  if (!normalizedUuid) {
    throw new Error('El UUID del expediente es obligatorio.')
  }

  const response = await httpClient.patch(
    `/proposal/${encodeURIComponent(normalizedUuid)}/status`,
    JSON.stringify(dto),
    signal,
  )

  if (!response.ok) {
    throw new Error(`No fue posible actualizar el estado (${response.status}).`)
  }

  return response.json() as Promise<UpdateProposalStatusResponse>
}

async function parseApiResponse<T>(response: Response, fallback: string): Promise<T> {
  const raw = await response.text()
  let body: unknown

  try {
    body = raw ? JSON.parse(raw) : undefined
  } catch {
    body = undefined
  }

  if (!response.ok) {
    const detail = isRecord(body) && typeof body.detail === 'string' ? body.detail : undefined
    throw new Error(detail ?? `${fallback} (${response.status}).`)
  }

  return body as T
}

function normalizeDetailComment(value: unknown): ProposalDetailComment | null {
  if (!isRecord(value)) {
    return null
  }

  if (
    typeof value.id !== 'number' ||
    typeof value.content !== 'string' ||
    typeof value.author !== 'string' ||
    typeof value.createdAt !== 'string'
  ) {
    return null
  }

  return {
    id: value.id,
    content: value.content,
    author: value.author,
    createdAt: value.createdAt,
  }
}

function normalizeDetailComments(value: unknown) {
  if (!isRecord(value) || !Array.isArray(value.items)) {
    return { items: [], total: 0, next_cursor: null }
  }

  return {
    items: value.items
      .map(normalizeDetailComment)
      .filter((comment): comment is ProposalDetailComment => comment !== null),
    total: typeof value.total === 'number' ? value.total : 0,
    next_cursor: typeof value.next_cursor === 'string' ? value.next_cursor : null,
  }
}

export async function getProposalDetail(
  uuidExpediente: string,
  signal?: AbortSignal,
): Promise<ProposalDetailResponse> {
  const uuid = uuidExpediente.trim()

  if (!uuid) {
    throw new Error('El UUID del expediente es obligatorio.')
  }

  const response = await httpClient.get(
    `/proposal/${encodeURIComponent(uuid)}/detail`,
    signal,
  )
  const data = await parseApiResponse<Record<string, unknown>>(
    response,
    'No fue posible consultar el detalle de la propuesta',
  )

  return {
    ...data,
    documents: normalizeDocuments(data.documents),
    history: Array.isArray(data.history) ? data.history as ProposalDetailResponse['history'] : [],
    comments: normalizeDetailComments(data.comments),
  } as ProposalDetailResponse
}

export async function getProposalComments(
  uuidExpediente: string,
  cursor?: string | null,
  signal?: AbortSignal,
) {
  const uuid = uuidExpediente.trim()

  if (!uuid) {
    throw new Error('El UUID del expediente es obligatorio.')
  }

  const searchParams = cursor ? `?${new URLSearchParams({ cursor }).toString()}` : ''
  const response = await httpClient.get(
    `/proposal/${encodeURIComponent(uuid)}/comments${searchParams}`,
    signal,
  )
  const data = await parseApiResponse<unknown>(
    response,
    'No fue posible cargar más comentarios',
  )

  return normalizeDetailComments(data)
}

export async function createProposalComment(
  uuidExpediente: string,
  content: string,
  idUsuario: number,
  signal?: AbortSignal,
): Promise<ProposalDetailComment> {
  const uuid = uuidExpediente.trim()
  const text = content.trim()

  if (!uuid || !text) {
    throw new Error('El UUID del expediente y el comentario son obligatorios.')
  }

  const response = await httpClient.postJson(
    `/proposal/${encodeURIComponent(uuid)}/comments`,
    { content: text, idUsuario },
    signal,
  )
  const data = await parseApiResponse<unknown>(
    response,
    'No fue posible publicar el comentario',
  )
  const comment = normalizeDetailComment(data)

  if (!comment) {
    throw new Error('La respuesta del comentario no tiene el formato esperado.')
  }

  return comment
}
