import { httpClient } from './http/httpClient'
import type { CreateProposalDto } from '../types/proposal/CreateProposalDto'
import type { ProposalDocument } from '../types/proposal/ProposalDocument'
import type { ProposalListResponse } from '../types/proposal/ProposalListResponse'
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
