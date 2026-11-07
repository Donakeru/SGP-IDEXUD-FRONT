import type { ApplicantType } from './ApplicantType'

export type FormValues = {
  applicantType: ApplicantType
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
}
