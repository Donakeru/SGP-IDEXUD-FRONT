import { httpClient } from './http/httpClient'
import type { CreateProposalDto } from '../types/proposal/CreateProposalDto'


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
