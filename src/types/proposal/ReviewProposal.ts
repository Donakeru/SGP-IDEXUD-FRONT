import type { ProposalDocument } from './ProposalDocument'

// TODO: alinear este tipo con `ProposalReviewItem` del OpenAPI. El backend puede
// enviar `null` en entity, applicantType, contactName, contactEmail y
// description; `status` e `history[].kind` llegan como string; y `nit` no existe
// en el backend. Se dejó igual a propósito (cambiarlo afecta a otras pantallas).
export type ReviewStatus =
  | 'Registrado'
  | 'En revisión de Dirección'
  | 'Aceptada'
  | 'Rechazada'

export type HistoryEvent = {
  id: string
  kind: 'observation' | 'decision'
  text: string
  author: string
  date: string
}

export type ReviewProposal = {
  id: string
  uuidExpediente: string
  title: string
  entity: string
  applicantType: 'Entidad externa' | 'Facultad' | 'Instituto' | 'Rectoría'
  nit?: string
  contactName: string
  contactEmail: string
  proposalType: string | null
  description: string
  submittedAt: string
  status: ReviewStatus
  dataComplete: boolean
  hasFacultyApproval: boolean
  documents: ProposalDocument[]
  history: HistoryEvent[]
}
