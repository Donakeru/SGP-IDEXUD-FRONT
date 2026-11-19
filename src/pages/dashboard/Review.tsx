import {
  CheckIcon,
  ChevronRightIcon,
  PaperAirplaneIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRoleLabel } from '../../auth/userDisplay'
import { useAuth } from '../../auth/useAuth'
import DocumentActions from '../../components/documents/DocumentActions'
import Alert from '../../components/Alert'
import Modal from '../../components/Modal'
import TextArea from '../../components/forms/TextArea'
import {
  formatDocumentType,
  formatFileSize,
  getFileIcon,
  getFileTypeLabel,
} from '../../utils/file'
import type { ProposalDocument } from '../../types/proposal/ProposalDocument'
import type {
  ReviewProposal,
  ReviewStatus,
} from '../../types/proposal/ReviewProposal'
import { getReviewProposals, updateProposalStatus } from '../../services/proposalService'

/**
 * Bandeja de revisión: lista de propuestas, datos, documentos e historial, con
 * acceso al detalle de cada propuesta.
 *
 * Qué acciones se muestran depende del estado de la propuesta, no del usuario.
 * Se ve con la capacidad `ver_revision` (ver router/routeConfig.ts).
 */

const DECISION_ACTIONS_ENABLED = true

type ReviewAction = 'forward' | 'dismiss' | 'approve' | 'disapprove'
type QueueFilter = 'all' | 'entry' | 'direction' | 'resolved'

type ActionConfig = {
  label: string
  title: string
  description: string
  confirmLabel: string
  targetStatus?: 'En Revision por Direccion' | 'Aceptado' | 'Rechazado'
  nextStatus: ReviewStatus
  tone: 'primary' | 'danger'
  requiresReason: boolean
  historyText: string
  successMessage: string
}

const actionConfig: Record<ReviewAction, ActionConfig> = {
  forward: {
    label: 'Remitir a Dirección',
    title: '¿Remitir a Dirección?',
    description:
      'La propuesta pasará a “En revisión de Dirección” y Dirección será notificada.',
    confirmLabel: 'Sí, remitir',
    targetStatus: 'En Revision por Direccion',
    nextStatus: 'En revisión de Dirección',
    tone: 'primary',
    requiresReason: false,
    historyText: 'Propuesta validada y remitida a Dirección.',
    successMessage: 'Propuesta remitida a Dirección.',
  },
  dismiss: {
    label: 'Desestimar Propuesta',
    title: '¿Desestimar propuesta?',
    description:
      'La propuesta quedará “Rechazada” y se informará a Dirección y a la entidad por correo institucional.',
    confirmLabel: 'Desestimar propuesta',
    targetStatus: 'Rechazado',
    nextStatus: 'Rechazada',
    tone: 'danger',
    requiresReason: true,
    historyText: 'Propuesta desestimada en la revisión de entrada.',
    successMessage: 'Propuesta desestimada. Se notificará a la entidad.',
  },
  approve: {
    label: 'Aceptar Propuesta Inicial',
    title: '¿Aprobar la propuesta inicial?',
    description:
      'La propuesta pasará a “Aceptada”, se creará el expediente digital y se notificará a Licitaciones y al equipo.',
    confirmLabel: 'Sí, continuar',
    targetStatus: 'Aceptado',
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

const actionsByRoleAndStatus: Record<
  string,
  Partial<Record<ReviewStatus, ReviewAction[]>>
> = {
  asistente_direccion: {
    Registrado: ['forward'],
  },
  direccion: {
    Registrado: ['dismiss', 'approve'],
    'En revisión de Dirección': ['dismiss', 'approve'],
  },
}

const stageByStatus: Record<ReviewStatus, Exclude<QueueFilter, 'all'>> = {
  Registrado: 'entry',
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
  Registrado: 'bg-primary-soft text-primary-strong',
  'En revisión de Dirección': 'bg-warning-soft text-warning',
  Aceptada: 'bg-success-soft text-success',
  Rechazada: 'bg-danger-soft text-danger',
}

function normalizeReviewStatus(status: string): ReviewStatus {
  if (status === 'En Revision por Direccion') {
    return 'En revisión de Dirección'
  }

  if (status === 'Aceptado') {
    return 'Aceptada'
  }

  if (status === 'Rechazado') {
    return 'Rechazada'
  }

  return status as ReviewStatus
}

const filterOptions: { value: QueueFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'entry', label: 'Entrada' },
  { value: 'direction', label: 'Dirección' },
  { value: 'resolved', label: 'Resueltas' },
]

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

/**
 * Documentos adjuntos de una propuesta. Por defecto solo los vigentes; si hay
 * versiones anteriores aparece el control para mostrarlas. Cada documento
 * ofrece Descargar y, si es PDF o imagen, Previsualizar. Se monta con `key` por
 * propuesta, así el control de versiones anteriores se reinicia al cambiar.
 */
function DocumentsPanel({ documents }: { documents: ProposalDocument[] }) {
  const [showPrevious, setShowPrevious] = useState(false)
  const currentDocuments = documents.filter((doc) => doc.es_vigente)
  const previousCount = documents.length - currentDocuments.length
  const visibleDocuments = showPrevious ? documents : currentDocuments

  return (
    <Panel
      title="Documentos adjuntos"
      subtitle={`${visibleDocuments.length} archivo${visibleDocuments.length === 1 ? '' : 's'}`}
    >
      {visibleDocuments.length > 0 ? (
        <ul>
          {visibleDocuments.map((doc) => {
            const FileIcon = getFileIcon(doc.tipo_mime)
            const typeLabel = formatDocumentType(doc.tipo_documento)

            return (
              <li
                className="flex items-center gap-2.5 border-b border-line-soft px-4 py-2.5 last:border-0"
                key={doc.uuid_archivo}
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary-soft text-primary-strong">
                  <FileIcon className="size-[18px] shrink-0" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <strong className="truncate text-[11px] text-ink" title={doc.nombre_original}>
                    {doc.nombre_original}
                  </strong>
                  <small className="text-[9px] text-muted">
                    {getFileTypeLabel(doc.tipo_mime)} · {formatFileSize(doc.tamano_bytes)} · v
                    {doc.numero_version}
                    {typeLabel ? ` · ${typeLabel}` : ''}
                  </small>
                </span>
                {!doc.es_vigente && (
                  <span className="shrink-0 rounded bg-chip px-1.5 py-0.5 text-[9px] font-semibold text-body">
                    Anterior
                  </span>
                )}
                <DocumentActions doc={doc} />
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="px-4 py-6 text-center text-[11px] text-muted">
          {documents.length > 0
            ? 'Esta propuesta no tiene documentos vigentes.'
            : 'Esta propuesta no tiene documentos adjuntos.'}
        </p>
      )}

      {previousCount > 0 && (
        <div className="border-t border-line-soft px-4 py-2">
          <button
            className="border-0 bg-transparent p-0 text-[10px] font-semibold text-primary-strong hover:underline"
            type="button"
            aria-pressed={showPrevious}
            onClick={() => setShowPrevious((visible) => !visible)}
          >
            {showPrevious
              ? 'Ocultar versiones anteriores'
              : `Mostrar versiones anteriores (${previousCount})`}
          </button>
        </div>
      )}
    </Panel>
  )
}

function ActionDialog({
  config,
  proposal,
  statusError,
  isSubmitting,
  onCancel,
  onConfirm,
}: {
  config: ActionConfig
  proposal: ReviewProposal
  statusError: string | null
  isSubmitting: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  const isDanger = config.tone === 'danger'

  return (
    <Modal
      open
      title={config.title}
      description={`${proposal.id} · ${proposal.title}. ${config.description}`}
      icon={
        isDanger ? (
          <XMarkIcon className="size-4" strokeWidth={1.8} aria-hidden="true" />
        ) : (
          <CheckIcon className="size-5" strokeWidth={1.8} aria-hidden="true" />
        )
      }
      onClose={isSubmitting ? undefined : onCancel}
      footer={
        <>
          <button
            className="h-[38px] rounded-md border border-line bg-white px-3.5 text-[11px] font-semibold text-body hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            className={`h-[38px] rounded-md px-3.5 text-[11px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
              isDanger ? 'bg-danger hover:bg-danger/90' : 'bg-primary hover:bg-primary-hover'
            }`}
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
          >
            {isSubmitting ? 'Actualizando…' : config.confirmLabel}
          </button>
        </>
      }
    >
      {statusError && (
        <p className="mt-3 rounded-md border border-danger-line bg-danger-subtle px-3 py-2 text-left text-[9px] leading-4 text-danger" role="alert">
          {statusError}
        </p>
      )}
    </Modal>
  )
}

function ReviewActionsPanel({
  proposal,
  roleCode,
  observation,
  onObservationChange,
  onAction,
}: {
  proposal: ReviewProposal
  roleCode: string
  observation: string
  onObservationChange: (value: string) => void
  onAction: (action: ReviewAction) => void
}) {
  const stage = stageByStatus[proposal.status]
  const actions = actionsByRoleAndStatus[roleCode]?.[proposal.status]
  const requirements =
    proposal.status === 'Registrado' ? getForwardRequirements(proposal) : []
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
            Motivo del cambio de estado <strong className="text-danger">*</strong>
          </label>
          <TextArea
            id="review-observation"
            className="!min-h-[84px] !text-[11px]"
            value={observation}
            onChange={(event) => onObservationChange(event.target.value)}
              placeholder="Escribe el motivo que se enviará al backend para el cambio de estado."
          />
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
            const isBlocked =
              (action === 'forward' && !canForward) || !observation.trim()

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
          {proposal.status === 'Registrado' && !canForward && (
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
  const navigate = useNavigate()
  const { user } = useAuth()
  const profileLabel = user ? getRoleLabel(user) : ''
  const roleCode =
    user?.roles.find(
      (role) => role.codigo === 'direccion' || role.codigo === 'asistente_direccion',
    )?.codigo ?? user?.roles[0]?.codigo ?? ''
  const [proposals, setProposals] = useState<ReviewProposal[]>([])
  const [filter, setFilter] = useState<QueueFilter>('all')
  const [selectedId, setSelectedId] = useState('')
  const [observation, setObservation] = useState('')
  const [dialogAction, setDialogAction] = useState<ReviewAction | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    const loadReviewProposals = async () => {
      if (!roleCode) {
        setProposals([])
        setSelectedId('')
        setLoadError('El usuario no tiene un rol configurado para consultar la revisión.')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setLoadError(null)

      try {
        const reviewProposals = await getReviewProposals(roleCode, controller.signal)

        if (controller.signal.aborted) {
          return
        }

        if (reviewProposals.length > 0) {
          setProposals(reviewProposals)
          setSelectedId(reviewProposals[0].id)
        }
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setLoadError(
            requestError instanceof Error
              ? requestError.message
              : 'No fue posible cargar la bandeja de revisión.',
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadReviewProposals()

    return () => controller.abort()
  }, [roleCode])

  useEffect(() => {
    if (!statusMessage) {
      return
    }

    const timeoutId = window.setTimeout(() => setStatusMessage(null), 4000)

    return () => window.clearTimeout(timeoutId)
  }, [statusMessage])

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

  const selectProposal = (id: string) => {
    setSelectedId(id)
    setObservation('')
  }

  const openAction = (action: ReviewAction) => {
    if (!DECISION_ACTIONS_ENABLED) {
      return
    }

    setStatusError(null)
    setDialogAction(action)
  }

  const closeDialog = () => setDialogAction(null)

  const confirmAction = async () => {
    if (
      !DECISION_ACTIONS_ENABLED ||
      !selected ||
      !dialogAction ||
      !activeConfig ||
      !activeConfig.targetStatus
    ) {
      return
    }

    const motivo = observation.trim()

    if (!motivo) {
      return
    }

    if (!user?.id_usuario) {
      setStatusError('No se encontró el usuario responsable de la acción.')
      return
    }

    setIsUpdatingStatus(true)
    setStatusError(null)

    try {
      const response = await updateProposalStatus(selected.uuidExpediente, {
        estadoDestino: activeConfig.targetStatus,
        idUsuario: user.id_usuario,
        motivo,
      })
      const nextStatus = normalizeReviewStatus(response.estadoNuevo)

      setProposals((current) =>
        current.map((item) =>
          item.id === selected.id ? { ...item, status: nextStatus } : item,
        ),
      )
      setDialogAction(null)
      setObservation('')
      setStatusMessage(response.mensaje)
    } catch (error) {
      setStatusError(
        error instanceof Error
          ? error.message
          : 'No fue posible actualizar el estado de la propuesta.',
      )
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  if (!selected) {
    return (
      <div className="mx-auto w-full max-w-[1216px] px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
        <div className="rounded-lg border border-line bg-white px-4 py-10 text-center text-xs text-muted">
          {isLoading ? 'Cargando propuestas de revisión…' : 'No hay propuestas disponibles para revisar.'}
        </div>
      </div>
    )
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
          Perfil: {profileLabel || 'Sin rol asignado'}
        </span>
      </div>

      {isLoading && (
        <div className="mb-4 rounded-lg border border-line bg-white px-4 py-3 text-[10px] text-muted">
          Cargando propuestas de revisión…
        </div>
      )}
      {loadError && (
        <div className="mb-4 rounded-lg border border-danger-line bg-danger-subtle px-4 py-3 text-[10px] text-danger" role="alert">
          {loadError}
        </div>
      )}

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
            <Panel title={selected.title} subtitle={`${selected.id} · Registrado el ${selected.submittedAt}`}>
              <div className="flex flex-col gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <StatusBadge status={selected.status} />
                  <button
                    className="inline-flex h-[34px] items-center gap-1.5 rounded-md border border-line bg-white px-3 text-[10px] font-semibold text-body transition-colors hover:bg-primary-soft hover:text-primary-strong"
                    type="button"
                    onClick={() =>
                      navigate(
                        `/dashboard/proposals/detail?id=${encodeURIComponent(selected.id)}`,
                      )
                    }
                  >
                    Ver detalle
                    <ChevronRightIcon className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
                  </button>
                </div>
                <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  <DataRow label="Entidad o dependencia" value={selected.entity} />
                  <DataRow label="Tipo de postulante" value={selected.applicantType} />
                  <DataRow label="NIT o identificación" value={selected.nit ?? 'No aplica'} />
                  <DataRow label="Tipo de propuesta" value={selected.proposalType ?? 'No especificado'} />
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

            <DocumentsPanel key={selected.id} documents={selected.documents} />

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
              roleCode={roleCode}
              observation={observation}
              onObservationChange={setObservation}
              onAction={openAction}
            />
          </div>
        </div>
      </div>

      {activeConfig && (
        <ActionDialog
          config={activeConfig}
          proposal={selected}
          statusError={statusError}
          isSubmitting={isUpdatingStatus}
          onCancel={closeDialog}
          onConfirm={confirmAction}
        />
      )}

      <Alert
        open={Boolean(statusMessage)}
        variant="success"
        title="Estado actualizado"
        description={statusMessage ?? undefined}
        icon={<CheckIcon className="size-[19px]" strokeWidth={1.8} aria-hidden="true" />}
      />
    </div>
  )
}
