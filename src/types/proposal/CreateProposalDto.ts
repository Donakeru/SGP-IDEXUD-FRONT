import type { ApplicantType } from './ApplicantType'

export type CreateProposalDto = {
  applicantType: Exclude<ApplicantType, ''>
  organizationName: string
  nit: string
  contactName: string
  role: string
  email: string
  phone: string
  title: string
  proposalType: string
  description: string
  justification: string
  startDate: string
  privacyAccepted: boolean
  proposalFiles: File[]
  facultyFiles: File[]
}