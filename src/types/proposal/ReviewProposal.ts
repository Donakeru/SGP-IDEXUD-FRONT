import type { ProposalDocument } from './ProposalDocument'

// TODO: alinear este tipo con `ProposalReviewItem` del OpenAPI. El backend puede
// enviar `null` en los datos de la propuesta; algunos campos ampliados son
// opcionales porque no todas las respuestas los incluyen.
export type ReviewStatus =
  | 'Registrado'
  | 'En revisión de Dirección'
  | 'Aceptada'
  | 'Rechazada'

export type HistoryEvent = {
  text: string
  subject: string
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
  role?: string | null
  phone?: string | null
  proposalType: string | null
  description: string
  justification?: string | null
  startDate?: string | null
  submittedAt: string
  status: ReviewStatus
  dataComplete: boolean
  hasFacultyApproval: boolean
  documents: ProposalDocument[]
  history: HistoryEvent[]
}
