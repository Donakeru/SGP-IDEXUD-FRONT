import {
  CheckIcon,
  DocumentTextIcon,
  PaperAirplaneIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import TextArea from '../../components/forms/TextArea'

/**
 * Bandeja de revisión para el perfil administrativo/revisor.
 *
 * Mientras no estén definidos los cargos, un único perfil "Revisor" cubre las
 * acciones de la Asistente de Dirección (CU-06, CU-07, CU-08) y de Dirección
 * IDEXUD (CU-09, CU-10, CU-11). Qué acciones se muestran depende del estado de
 * la propuesta, no del usuario.
 */

type ReviewStatus =
  | 'Registrada'
  | 'En revisión de Dirección'
  | 'Aceptada'
  | 'Rechazada'

type ReviewAction = 'forward' | 'dismiss' | 'approve' | 'disapprove'
type QueueFilter = 'all' | 'entry' | 'direction' | 'resolved'

type HistoryEvent = {
  id: string
  kind: 'observation' | 'decision'
  text: string
  author: string
  date: string
}

type ReviewProposal = {
  id: string
  title: string
  entity: string
  applicantType: 'Entidad externa' | 'Facultad' | 'Instituto' | 'Rectoría'
  nit?: string
  contactName: string
  contactEmail: string
  proposalType: string
  description: string
  submittedAt: string
  status: ReviewStatus
  dataComplete: boolean
  hasFacultyApproval: boolean
  documents: { name: string; size: string }[]
  history: HistoryEvent[]
}

type ActionConfig = {
  label: string
  title: string
  description: string
  confirmLabel: string
  nextStatus: ReviewStatus
  tone: 'primary' | 'danger'
  requiresReason: boolean
  historyText: string
  successMessage: string
}

const REVIEWER_NAME = 'Revisor administrativo'

const actionConfig: Record<ReviewAction, ActionConfig> = {
  forward: {
    label: 'Remitir a Dirección',
    title: '¿Remitir a Dirección?',
    description:
      'La propuesta pasará a “En revisión de Dirección” y Dirección será notificada.',
    confirmLabel: 'Sí, remitir',
    nextStatus: 'En revisión de Dirección',
    tone: 'primary',
    requiresReason: false,
    historyText: 'Propuesta validada y remitida a Dirección.',
    successMessage: 'Propuesta remitida a Dirección.',
  },
  dismiss: {
    label: 'Desestimar',
    title: '¿Desestimar propuesta?',
    description:
      'La propuesta quedará “Rechazada” y se informará a Dirección y a la entidad por correo institucional.',
    confirmLabel: 'Desestimar propuesta',
    nextStatus: 'Rechazada',
    tone: 'danger',
    requiresReason: true,
    historyText: 'Propuesta desestimada en la revisión de entrada.',
    successMessage: 'Propuesta desestimada. Se notificará a la entidad.',
  },
  approve: {
    label: 'Continuar con el proceso',
    title: '¿Aprobar la propuesta inicial?',
    description:
      'La propuesta pasará a “Aceptada”, se creará el expediente digital y se notificará a Licitaciones y al equipo.',
    confirmLabel: 'Sí, continuar',
    nextStatus: 'Aceptada',
    tone: 'primary',
    requiresReason: false,
    historyText: 'Propuesta inicial aprobada. Expediente digital creado.',
    successMessage: 'Propuesta aprobada. Se creó el expediente digital.',
  },
  disapprove: {
    label: 'No continuar',
    title: '¿Desaprobar la propuesta inicial?',
    description:
      'La propuesta quedará “Rechazada” y se enviará a la entidad el mensaje de no viabilidad.',
    confirmLabel: 'Desaprobar propuesta',
    nextStatus: 'Rechazada',
    tone: 'danger',
    requiresReason: true,
    historyText: 'Propuesta desaprobada en la revisión de Dirección.',
    successMessage: 'Propuesta desaprobada. Se notificará la no viabilidad.',
  },
}

const actionsByStatus: Partial<Record<ReviewStatus, ReviewAction[]>> = {
  Registrada: ['forward', 'dismiss'],
  'En revisión de Dirección': ['approve', 'disapprove'],
}

const stageByStatus: Record<ReviewStatus, Exclude<QueueFilter, 'all'>> = {
  Registrada: 'entry',
  'En revisión de Dirección': 'direction',
  Aceptada: 'resolved',
  Rechazada: 'resolved',
}

const stageLabel: Record<Exclude<QueueFilter, 'all'>, string> = {
  entry: 'Revisión de entrada',
  direction: 'Revisión de Dirección',
  resolved: 'Revisión finalizada',
}

const statusStyles: Record<ReviewStatus, string> = {
  Registrada: 'bg-primary-soft text-primary-strong',
  'En revisión de Dirección': 'bg-warning-soft text-warning',
  Aceptada: 'bg-success-soft text-success',
  Rechazada: 'bg-danger-soft text-danger',
}

const initialProposals: ReviewProposal[] = [
  {
    id: 'PROP-2026-018',
    title: 'Diplomado en seguridad digital para docentes',
    entity: 'Facultad de Ingeniería',
    applicantType: 'Facultad',
    contactName: 'Sandra Patiño',
    contactEmail: 'spatino@udistrital.edu.co',
    proposalType: 'Educación continuada',
    description:
      'Programa de formación para docentes en prácticas seguras de manejo de información y plataformas digitales institucionales.',
    submittedAt: '12 oct 2026',
    status: 'Registrada',
    dataComplete: true,
    hasFacultyApproval: false,
    documents: [{ name: 'Propuesta_tecnica.pdf', size: '2,4 MB' }],
    history: [
      {
        id: 'h-018-1',
        kind: 'decision',
        text: 'Propuesta registrada por el postulante.',
        author: 'Sistema',
        date: '12 oct 2026, 09:15',
      },
    ],
  },
  {
    id: 'PROP-2026-017',
    title: 'Convenio de formación en energías renovables',
    entity: 'Fundación Energía Viva',
    applicantType: 'Entidad externa',
    nit: '900.123.456-1',
    contactName: 'Camilo Restrepo',
    contactEmail: 'crestrepo@energiaviva.org',
    proposalType: 'Consultoría',
    description:
      'Convenio para capacitar técnicos en instalación y mantenimiento de sistemas solares fotovoltaicos en la región.',
    submittedAt: '11 oct 2026',
    status: 'Registrada',
    dataComplete: true,
    hasFacultyApproval: false,
    documents: [
      { name: 'Propuesta_economica.xlsx', size: '640 KB' },
      { name: 'Certificado_existencia.pdf', size: '1,1 MB' },
    ],
    history: [
      {
        id: 'h-017-1',
        kind: 'decision',
        text: 'Propuesta registrada por el postulante.',
        author: 'Sistema',
        date: '11 oct 2026, 16:40',
      },
    ],
  },
  {
    id: 'PROP-2026-016',
    title: 'Fortalecimiento de capacidades digitales',
    entity: 'Caja de Compensación Familiar',
    applicantType: 'Entidad externa',
    nit: '860.007.336-1',
    contactName: 'Paola Ortiz',
    contactEmail: 'portiz@cajafamiliar.co',
    proposalType: 'Servicios académicos',
    description: 'Ruta de formación digital para afiliados.',
    submittedAt: '10 oct 2026',
    status: 'Registrada',
    dataComplete: false,
    hasFacultyApproval: false,
    documents: [],
    history: [
      {
        id: 'h-016-1',
        kind: 'decision',
        text: 'Propuesta registrada por el postulante.',
        author: 'Sistema',
        date: '10 oct 2026, 11:02',
      },
    ],
  },
  {
    id: 'PROP-2026-013',
    title: 'Diplomado en gestión pública territorial',
    entity: 'Alcaldía Local de Suba',
    applicantType: 'Entidad externa',
    nit: '899.999.061-9',
    contactName: 'Julián Mora',
    contactEmail: 'jmora@suba.gov.co',
    proposalType: 'Educación continuada',
    description:
      'Formación de 120 horas para funcionarios locales en planeación y contratación territorial.',
    submittedAt: '29 sep 2026',
    status: 'En revisión de Dirección',
    dataComplete: true,
    hasFacultyApproval: false,
    documents: [
      { name: 'Propuesta_diplomado.pdf', size: '3,2 MB' },
      { name: 'Presupuesto.xlsx', size: '512 KB' },
    ],
    history: [
      {
        id: 'h-013-1',
        kind: 'decision',
        text: 'Propuesta registrada por el postulante.',
        author: 'Sistema',
        date: '29 sep 2026, 10:20',
      },
      {
        id: 'h-013-2',
        kind: 'observation',
        text: 'Documentación completa. Se sugiere revisar el cronograma de ejecución.',
        author: REVIEWER_NAME,
        date: '30 sep 2026, 14:05',
      },
      {
        id: 'h-013-3',
        kind: 'decision',
        text: 'Propuesta validada y remitida a Dirección.',
        author: REVIEWER_NAME,
        date: '30 sep 2026, 14:07',
      },
    ],
  },
  {
    id: 'PROP-2026-010',
    title: 'Escuela de liderazgo comunitario',
    entity: 'Instituto Distrital de Participación',
    applicantType: 'Instituto',
    contactName: 'Marcela Duarte',
    contactEmail: 'mduarte@idpac.gov.co',
    proposalType: 'Proyecto especial',
    description:
      'Escuela de formación para líderes de juntas de acción comunal con enfoque de participación ciudadana.',
    submittedAt: '12 sep 2026',
    status: 'En revisión de Dirección',
    dataComplete: true,
    hasFacultyApproval: false,
    documents: [{ name: 'Propuesta_escuela.pdf', size: '2,0 MB' }],
    history: [
      {
        id: 'h-010-1',
        kind: 'decision',
        text: 'Propuesta registrada por el postulante.',
        author: 'Sistema',
        date: '12 sep 2026, 08:45',
      },
      {
        id: 'h-010-2',
        kind: 'decision',
        text: 'Propuesta validada y remitida a Dirección.',
        author: REVIEWER_NAME,
        date: '13 sep 2026, 09:30',
      },
    ],
  },
  {
    id: 'PROP-2026-012',
    title: 'Laboratorio de innovación educativa',
    entity: 'Secretaría de Educación',
    applicantType: 'Entidad externa',
    nit: '899.999.061-9',
    contactName: 'Ana Torres',
    contactEmail: 'atorres@educacionbogota.edu.co',
    proposalType: 'Proyecto especial',
    description: 'Laboratorio de prototipado de estrategias pedagógicas.',
    submittedAt: '24 sep 2026',
    status: 'Aceptada',
    dataComplete: true,
    hasFacultyApproval: false,
    documents: [{ name: 'Propuesta_laboratorio.pdf', size: '2,8 MB' }],
    history: [
      {
        id: 'h-012-1',
        kind: 'decision',
        text: 'Propuesta inicial aprobada. Expediente digital creado.',
        author: REVIEWER_NAME,
        date: '27 sep 2026, 11:00',
      },
    ],
  },
  {
    id: 'PROP-2026-009',
    title: 'Formación en analítica de datos',
    entity: 'Empresa de Acueducto de Bogotá',
    applicantType: 'Entidad externa',
    nit: '899.999.094-1',
    contactName: 'Luis Herrera',
    contactEmail: 'lherrera@acueducto.com.co',
    proposalType: 'Educación continuada',
    description: 'Curso de analítica de datos para personal técnico.',
    submittedAt: '05 sep 2026',
    status: 'Rechazada',
    dataComplete: true,
    hasFacultyApproval: false,
    documents: [{ name: 'Propuesta_analitica.pdf', size: '1,9 MB' }],
    history: [
      {
        id: 'h-009-1',
        kind: 'decision',
        text: 'Propuesta desaprobada en la revisión de Dirección. Motivo: el alcance excede la capacidad actual del equipo.',
        author: REVIEWER_NAME,
        date: '08 sep 2026, 15:10',
      },
    ],
  },
]

const filterOptions: { value: QueueFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'entry', label: 'Entrada' },
  { value: 'direction', label: 'Dirección' },
  { value: 'resolved', label: 'Resueltas' },
]

function formatNow() {
  return new Date().toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getForwardRequirements(proposal: ReviewProposal) {
  const requirements = [
    {
      label: 'Datos de la entidad y del contacto diligenciados',
      met: proposal.dataComplete,
    },
    {
      label: 'Al menos un documento adjunto',
      met: proposal.documents.length > 0,
    },
  ]

  if (proposal.applicantType === 'Facultad') {
    requirements.push({
      label: 'Aval de la facultad adjunto',
      met: proposal.hasFacultyApproval,
    })
  }

  return requirements
}

function StatusBadge({ status }: { status: ReviewStatus }) {
  return (
    <span
      className={`inline-flex w-max items-center gap-[5px] rounded-full px-2 py-1 text-[9px] font-semibold ${statusStyles[status]}`}
    >
      <span className="size-[5px] rounded-full bg-current" />
      {status}
    </span>
  )
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-line bg-white shadow-[0_4px_14px_rgba(38,38,38,0.05)]">
      <header className="border-b border-line-soft px-4 py-3">
        <h2 className="text-[13px] font-semibold leading-[19px] text-ink">{title}</h2>
        {subtitle && (
          <p className="mt-px text-[10px] leading-[14px] text-muted">{subtitle}</p>
        )}
      </header>
      {children}
    </section>
  )
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[9px] text-muted">{label}</dt>
      <dd className="mt-0.5 text-[11px] font-semibold text-ink">{value}</dd>
    </div>
  )
}

function ActionDialog({
  config,
  proposal,
  reason,
  showReasonError,
  onReasonChange,
  onCancel,
  onConfirm,
}: {
  config: ActionConfig
  proposal: ReviewProposal
  reason: string
  showReasonError: boolean
  onReasonChange: (value: string) => void
  onCancel: () => void
  onConfirm: () => void
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  const isDanger = config.tone === 'danger'

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-dialog-title"
    >
      <div className="w-full max-w-[440px] rounded-lg bg-white p-6 shadow-[0_18px_48px_rgba(38,38,38,0.22)]">
        <span
          className={`mb-3.5 grid size-[46px] place-items-center rounded-full ${
            isDanger ? 'bg-danger-soft text-danger' : 'bg-primary-soft text-primary-strong'
          }`}
        >
          {isDanger ? <XMarkIcon className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" /> : <CheckIcon className="size-5" strokeWidth={1.8} aria-hidden="true" />}
        </span>
        <h2
          id="review-dialog-title"
          className="text-[17px] font-semibold leading-6 text-ink"
        >
          {config.title}
        </h2>
        <p className="mt-1 text-[11px] font-semibold text-muted">
          {proposal.id} · {proposal.title}
        </p>
        <p className="mt-2 text-[11px] leading-4 text-body">{config.description}</p>

        {config.requiresReason && (
          <label className="mt-4 flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold text-ink">
              Motivo <strong className="text-danger">*</strong>
            </span>
            <TextArea
              autoFocus
              className="!text-[11px]"
              error={showReasonError ? 'El motivo es obligatorio.' : undefined}
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
              placeholder="Explica por qué se toma esta decisión. Se enviará a la entidad."
            />
            {showReasonError && (
              <small className="text-[10px] text-danger">
                El motivo es obligatorio para continuar.
              </small>
            )}
          </label>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            className="h-[38px] rounded-md border border-line bg-white px-3.5 text-[11px] font-semibold text-body hover:bg-primary-soft"
            type="button"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            className={`h-[38px] rounded-md px-3.5 text-[11px] font-semibold text-white ${
              isDanger ? 'bg-danger hover:bg-danger/90' : 'bg-primary hover:bg-primary-hover'
            }`}
            type="button"
            onClick={onConfirm}
          >
            {config.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function ReviewActionsPanel({
  proposal,
  observation,
  onObservationChange,
  onSaveObservation,
  onAction,
}: {
  proposal: ReviewProposal
  observation: string
  onObservationChange: (value: string) => void
  onSaveObservation: () => void
  onAction: (action: ReviewAction) => void
}) {
  const stage = stageByStatus[proposal.status]
  const actions = actionsByStatus[proposal.status]
  const requirements =
    proposal.status === 'Registrada' ? getForwardRequirements(proposal) : []
  const missingRequirements = requirements.filter((item) => !item.met)
  const canForward = missingRequirements.length === 0

  if (!actions) {
    return (
      <Panel title="Acciones de revisión" subtitle={stageLabel[stage]}>
        <div className="p-4 text-[11px] leading-4 text-body">
          <StatusBadge status={proposal.status} />
          <p className="mt-3">
            Esta propuesta ya fue resuelta, por lo que no tiene acciones de revisión
            pendientes.
          </p>
        </div>
      </Panel>
    )
  }

  return (
    <Panel title="Acciones de revisión" subtitle={stageLabel[stage]}>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold text-ink" htmlFor="review-observation">
            Observaciones <em className="font-normal not-italic text-muted">Opcional</em>
          </label>
          <TextArea
            id="review-observation"
            className="!min-h-[84px] !text-[11px]"
            value={observation}
            onChange={(event) => onObservationChange(event.target.value)}
            placeholder={
              proposal.status === 'Registrada'
                ? 'Anota lo revisado en los datos y documentos.'
                : 'Agrega observaciones sobre lo registrado en la revisión de entrada.'
            }
          />
          <button
            className="h-[34px] self-start rounded-md border border-line bg-white px-3 text-[10px] font-semibold text-body hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
            type="button"
            disabled={!observation.trim()}
            onClick={onSaveObservation}
          >
            Guardar observación
          </button>
        </div>

        {requirements.length > 0 && (
          <div className="rounded-md border border-line-soft bg-canvas p-3">
            <strong className="text-[10px] font-semibold text-ink">
              Requisitos para remitir
            </strong>
            <ul className="mt-2 flex flex-col gap-1.5">
              {requirements.map((item) => (
                <li
                  className={`flex items-start gap-1.5 text-[10px] leading-4 ${
                    item.met ? 'text-success' : 'text-danger'
                  }`}
                  key={item.label}
                >
                  {item.met ? <CheckIcon className="mt-px size-3.5" strokeWidth={1.8} aria-hidden="true" /> : <XMarkIcon className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />}
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-line-soft pt-4">
          {actions.map((action) => {
            const config = actionConfig[action]
            const isDanger = config.tone === 'danger'
            const isBlocked = action === 'forward' && !canForward

            return (
              <button
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-md px-3.5 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  isDanger
                    ? 'border border-danger-line bg-white text-danger hover:bg-danger-soft'
                    : 'bg-primary text-white shadow-[0_2px_4px_rgba(255,78,0,0.18)] hover:bg-primary-hover'
                }`}
                key={action}
                type="button"
                disabled={isBlocked}
                onClick={() => onAction(action)}
              >
                {isDanger ? <XMarkIcon className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" /> : action === 'forward' ? <PaperAirplaneIcon className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" /> : <CheckIcon className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />}
                {config.label}
              </button>
            )
          })}
          {proposal.status === 'Registrada' && !canForward && (
            <p className="text-[10px] leading-4 text-muted">
              Completa los requisitos pendientes para poder remitir. Si no se pueden
              cumplir, puedes desestimar la propuesta.
            </p>
          )}
        </div>
      </div>
    </Panel>
  )
}

export default function Review() {
  const [proposals, setProposals] = useState<ReviewProposal[]>(initialProposals)
  const [filter, setFilter] = useState<QueueFilter>('all')
  const [selectedId, setSelectedId] = useState(initialProposals[0].id)
  const [observation, setObservation] = useState('')
  const [dialogAction, setDialogAction] = useState<ReviewAction | null>(null)
  const [reason, setReason] = useState('')
  const [showReasonError, setShowReasonError] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) {
      return
    }

    const timeoutId = window.setTimeout(() => setToast(null), 4000)

    return () => window.clearTimeout(timeoutId)
  }, [toast])

  const counts = useMemo(
    () => ({
      all: proposals.length,
      entry: proposals.filter((item) => stageByStatus[item.status] === 'entry').length,
      direction: proposals.filter((item) => stageByStatus[item.status] === 'direction')
        .length,
      resolved: proposals.filter((item) => stageByStatus[item.status] === 'resolved')
        .length,
    }),
    [proposals],
  )

  const queue = useMemo(
    () =>
      filter === 'all'
        ? proposals
        : proposals.filter((item) => stageByStatus[item.status] === filter),
    [filter, proposals],
  )

  const selected = proposals.find((item) => item.id === selectedId) ?? proposals[0]
  const activeConfig = dialogAction ? actionConfig[dialogAction] : null

  const appendEvent = (
    proposalId: string,
    event: Omit<HistoryEvent, 'id' | 'author' | 'date'>,
    nextStatus?: ReviewStatus,
  ) => {
    const now = formatNow()

    setProposals((current) =>
      current.map((item) =>
        item.id === proposalId
          ? {
              ...item,
              status: nextStatus ?? item.status,
              history: [
                ...item.history,
                {
                  ...event,
                  id: `${proposalId}-${Date.now()}`,
                  author: REVIEWER_NAME,
                  date: now,
                },
              ],
            }
          : item,
      ),
    )
  }

  const selectProposal = (id: string) => {
    setSelectedId(id)
    setObservation('')
  }

  const saveObservation = () => {
    const text = observation.trim()

    if (!text) {
      return
    }

    appendEvent(selected.id, { kind: 'observation', text })
    setObservation('')
    setToast('Observación guardada en el historial.')
  }

  const openAction = (action: ReviewAction) => {
    setReason('')
    setShowReasonError(false)
    setDialogAction(action)
  }

  const closeDialog = () => setDialogAction(null)

  const confirmAction = () => {
    if (!dialogAction || !activeConfig) {
      return
    }

    const trimmedReason = reason.trim()

    if (activeConfig.requiresReason && !trimmedReason) {
      setShowReasonError(true)
      return
    }

    appendEvent(
      selected.id,
      {
        kind: 'decision',
        text: trimmedReason
          ? `${activeConfig.historyText} Motivo: ${trimmedReason}`
          : activeConfig.historyText,
      },
      activeConfig.nextStatus,
    )
    setDialogAction(null)
    setObservation('')
    setToast(activeConfig.successMessage)
  }

  return (
    <div className="mx-auto w-full max-w-[1216px] px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
      <div className="mb-[22px] flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            Revisión de propuestas
          </span>
          <h1 className="mt-1 text-[25px] font-semibold leading-[33px] tracking-[-0.025em] text-ink">
            Bandeja de revisión
          </h1>
          <p className="mt-1 text-xs text-muted">
            Valida las propuestas de entrada y decide sobre su continuidad.
          </p>
        </div>
        <span className="inline-flex w-max items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1.5 text-[10px] font-semibold text-primary-strong">
          <span className="size-[5px] rounded-full bg-current" />
          Perfil: {REVIEWER_NAME}
        </span>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <section
          className="overflow-hidden rounded-lg border border-line bg-white shadow-[0_4px_14px_rgba(38,38,38,0.05)]"
          aria-label="Propuestas por revisar"
        >
          <div
            className="flex gap-1 border-b border-line-soft p-2"
            role="tablist"
            aria-label="Filtrar por etapa"
          >
            {filterOptions.map((option) => {
              const isActive = filter === option.value

              return (
                <button
                  className={`flex-1 rounded-md px-1.5 py-1.5 text-[10px] font-semibold transition-colors ${
                    isActive
                      ? 'bg-primary-soft text-primary-strong'
                      : 'text-muted hover:bg-wash hover:text-primary-strong'
                  }`}
                  key={option.value}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setFilter(option.value)}
                >
                  {option.label}
                  <span className="ml-1 text-[9px] font-bold">{counts[option.value]}</span>
                </button>
              )
            })}
          </div>

          <ul className="max-h-[560px] overflow-y-auto">
            {queue.map((item) => {
              const isSelected = item.id === selected.id

              return (
                <li className="border-b border-line-soft last:border-0" key={item.id}>
                  <button
                    className={`flex w-full flex-col gap-1.5 px-4 py-3 text-left transition-colors ${
                      isSelected
                        ? 'bg-primary-soft shadow-[inset_3px_0_0_#FF4E00]'
                        : 'bg-white hover:bg-wash'
                    }`}
                    type="button"
                    aria-current={isSelected ? 'true' : undefined}
                    onClick={() => selectProposal(item.id)}
                  >
                    <span className="text-[9px] font-semibold text-muted">{item.id}</span>
                    <strong className="text-[11px] leading-4 text-ink">{item.title}</strong>
                    <span className="text-[10px] text-muted">{item.entity}</span>
                    <StatusBadge status={item.status} />
                  </button>
                </li>
              )
            })}
            {queue.length === 0 && (
              <li className="px-4 py-10 text-center text-xs text-muted">
                No hay propuestas en esta etapa.
              </li>
            )}
          </ul>
        </section>

        <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="flex min-w-0 flex-col gap-4">
            <Panel title={selected.title} subtitle={`${selected.id} · Registrada el ${selected.submittedAt}`}>
              <div className="flex flex-col gap-4 p-4">
                <StatusBadge status={selected.status} />
                <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  <DataRow label="Entidad o dependencia" value={selected.entity} />
                  <DataRow label="Tipo de postulante" value={selected.applicantType} />
                  <DataRow label="NIT o identificación" value={selected.nit ?? 'No aplica'} />
                  <DataRow label="Tipo de propuesta" value={selected.proposalType} />
                  <DataRow label="Contacto responsable" value={selected.contactName} />
                  <DataRow label="Correo electrónico" value={selected.contactEmail} />
                </dl>
                <div>
                  <h3 className="text-[9px] text-muted">Descripción u objeto</h3>
                  <p className="mt-0.5 text-[11px] leading-4 text-body">
                    {selected.description}
                  </p>
                </div>
              </div>
            </Panel>

            <Panel
              title="Documentos adjuntos"
              subtitle={`${selected.documents.length} archivo${selected.documents.length === 1 ? '' : 's'}`}
            >
              {selected.documents.length > 0 ? (
                <ul>
                  {selected.documents.map((document) => (
                    <li
                      className="flex items-center gap-2.5 border-b border-line-soft px-4 py-2.5 last:border-0"
                      key={document.name}
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary-soft text-primary-strong">
                        <DocumentTextIcon className="size-[18px] shrink-0" strokeWidth={1.8} aria-hidden="true" />
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <strong className="truncate text-[11px] text-ink">{document.name}</strong>
                        <small className="text-[9px] text-muted">{document.size}</small>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-4 py-6 text-center text-[11px] text-muted">
                  Esta propuesta no tiene documentos adjuntos.
                </p>
              )}
            </Panel>

            <Panel title="Historial" subtitle="Observaciones y decisiones, de la más reciente a la más antigua">
              <ol className="flex flex-col">
                {[...selected.history].reverse().map((event) => (
                  <li
                    className="flex gap-3 border-b border-line-soft px-4 py-3 last:border-0"
                    key={event.id}
                  >
                    <span
                      className={`mt-1 size-2 shrink-0 rounded-full ${
                        event.kind === 'observation' ? 'bg-muted' : 'bg-primary'
                      }`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-[11px] leading-4 text-ink">
                        <span className="mr-1.5 rounded bg-chip px-1.5 py-0.5 text-[9px] font-semibold text-body">
                          {event.kind === 'observation' ? 'Observación' : 'Decisión'}
                        </span>
                        {event.text}
                      </p>
                      <small className="mt-0.5 block text-[9px] text-muted">
                        {event.author} · {event.date}
                      </small>
                    </div>
                  </li>
                ))}
              </ol>
            </Panel>
          </div>

          <div className="xl:sticky xl:top-4">
            <ReviewActionsPanel
              proposal={selected}
              observation={observation}
              onObservationChange={setObservation}
              onSaveObservation={saveObservation}
              onAction={openAction}
            />
          </div>
        </div>
      </div>

      {activeConfig && (
        <ActionDialog
          config={activeConfig}
          proposal={selected}
          reason={reason}
          showReasonError={showReasonError}
          onReasonChange={(value) => {
            setReason(value)
            setShowReasonError(false)
          }}
          onCancel={closeDialog}
          onConfirm={confirmAction}
        />
      )}

      {toast && (
        <div
          className="fixed bottom-5 right-5 z-40 flex w-[min(390px,calc(100vw-40px))] items-center gap-2.5 rounded-lg border border-success-line bg-white p-3 shadow-[0_12px_32px_rgba(38,38,38,0.16)]"
          role="status"
        >
          <span className="grid size-[34px] shrink-0 place-items-center rounded-full bg-success-soft text-success">
            <CheckIcon className="size-[19px]" strokeWidth={1.8} aria-hidden="true" />
          </span>
          <strong className="text-[11px] font-semibold text-success">{toast}</strong>
        </div>
      )}
    </div>
  )
}
