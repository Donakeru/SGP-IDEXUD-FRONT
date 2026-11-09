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
  documents: { name: string; size: string }[]
  history: HistoryEvent[]
}
