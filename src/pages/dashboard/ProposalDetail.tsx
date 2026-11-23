import { ChatBubbleLeftRightIcon, PaperClipIcon } from '@heroicons/react/24/outline'
import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import Alert from '../../components/Alert'
import Can from '../../components/auth/Can'
import CommentComposer from '../../components/comments/CommentComposer'
import CommentList from '../../components/comments/CommentList'
import DocumentUploadDialog from '../../components/documents/DocumentUploadDialog'
import FileInput from '../../components/forms/FileInput'
import ProposalDocumentsPanel from '../../components/ProposalDocumentsPanel'
import ProposalHistory from '../../components/ProposalHistory'
import Spinner from '../../components/Spinner'
import {
  createProposalComment,
  getProposalComments,
  getProposalDetail,
  uploadProposalDocument,
} from '../../services/proposalService'
import { isAbortError } from '../../services/http/errors'
import type { Comment, NewCommentInput } from '../../types/comment/Comment'
import type { ProposalDetailComment, ProposalDetailResponse } from '../../types/proposal/ProposalDetail'

function DetailCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string
  subtitle: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-line bg-white shadow-[0_4px_14px_rgba(38,38,38,0.05)]">
      <header className="flex min-h-[62px] items-center gap-2.5 border-b border-line-soft px-3.5 py-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary-soft text-primary-strong">
          {icon}
        </span>
        <div>
          <h2 className="text-[11px] font-semibold leading-4 text-ink">{title}</h2>
          <p className="mt-px text-[8px] leading-3 text-muted">{subtitle}</p>
        </div>
      </header>
      {children}
    </section>
  )
}

function toComment(proposalUuid: string, comment: ProposalDetailComment): Comment {
  return {
    id: String(comment.id),
    proposalId: proposalUuid,
    text: comment.content,
    category: comment.category,
    documentName: comment.documentName ?? undefined,
    createdAt: comment.createdAt,
    author: { id: 0, name: comment.author, role: 'Usuario' },
  }
}

export default function ProposalDetail() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const proposalUuid = searchParams.get('uuid') ?? ''
  const [detail, setDetail] = useState<ProposalDetailResponse | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [pendingDocumentFiles, setPendingDocumentFiles] = useState<File[]>([])
  const [isDocumentUploadOpen, setIsDocumentUploadOpen] = useState(false)
  const [isUploadingDocuments, setIsUploadingDocuments] = useState(false)
  const [documentUploadError, setDocumentUploadError] = useState<string | null>(null)
  const [documentInputKey, setDocumentInputKey] = useState(0)
  const [isInfoExpanded, setIsInfoExpanded] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(true)
  const [isLoadingMoreComments, setIsLoadingMoreComments] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [commentsError, setCommentsError] = useState<string | null>(null)
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    const loadDetail = async () => {
      if (!proposalUuid) {
        setDetailError('No se recibió el UUID de la propuesta.')
        setIsLoadingDetail(false)
        return
      }

      setIsLoadingDetail(true)
      setDetailError(null)
      setCommentsError(null)
      setIsInfoExpanded(false)
      setPendingDocumentFiles([])
      setIsDocumentUploadOpen(false)
      setDocumentUploadError(null)
      setDocumentInputKey((key) => key + 1)

      try {
        const response = await getProposalDetail(proposalUuid, controller.signal)

        if (controller.signal.aborted) {
          return
        }

        setDetail(response)
        setComments(response.comments.items.map((comment) => toComment(proposalUuid, comment)))
        setNextCursor(response.comments.next_cursor)
      } catch (error) {
        if (!controller.signal.aborted && !isAbortError(error)) {
          setDetailError(
            error instanceof Error
              ? error.message
              : 'No fue posible cargar el detalle de la propuesta.',
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingDetail(false)
        }
      }
    }

    void loadDetail()
    return () => controller.abort()
  }, [proposalUuid])

  const loadMoreComments = async () => {
    if (!proposalUuid || !nextCursor || isLoadingMoreComments) {
      return
    }

    setIsLoadingMoreComments(true)
    setLoadMoreError(null)

    try {
      const response = await getProposalComments(proposalUuid, nextCursor)
      const nextComments = response.items.map((comment) => toComment(proposalUuid, comment))

      setComments((current) => {
        const existingIds = new Set(current.map((comment) => comment.id))
        return [...current, ...nextComments.filter((comment) => !existingIds.has(comment.id))]
      })
      setNextCursor(response.next_cursor)
    } catch (error) {
      setLoadMoreError(
        error instanceof Error
          ? error.message
          : 'No fue posible cargar más comentarios.',
      )
    } finally {
      setIsLoadingMoreComments(false)
    }
  }

  const openDocumentUpload = () => {
    if (pendingDocumentFiles.length === 0) {
      return
    }

    setDocumentUploadError(null)
    setIsDocumentUploadOpen(true)
  }

  const confirmDocumentUpload = async () => {
    if (pendingDocumentFiles.length === 0) {
      return
    }

    if (!user || !Number.isFinite(user.id_usuario)) {
      setDocumentUploadError('No se encontró el usuario responsable de la carga.')
      return
    }

    setIsUploadingDocuments(true)
    setDocumentUploadError(null)

    try {
      for (const file of pendingDocumentFiles) {
        await uploadProposalDocument(
          proposalUuid,
          file,
          user.id_usuario,
          'propuesta',
        )
      }

      const refreshedDetail = await getProposalDetail(proposalUuid)
      setDetail((current) =>
        current ? { ...current, documents: refreshedDetail.documents } : current,
      )
      setPendingDocumentFiles([])
      setDocumentInputKey((key) => key + 1)
      setIsDocumentUploadOpen(false)
    } catch (error) {
      setDocumentUploadError(
        error instanceof Error
          ? error.message
          : 'No fue posible adjuntar los documentos.',
      )
    } finally {
      setIsUploadingDocuments(false)
    }
  }

  const publishComment = async (input: NewCommentInput) => {
    if (!user) {
      throw new Error('Inicia sesión para publicar un comentario.')
    }

    const created = await createProposalComment(
      proposalUuid,
      input.text,
      user.id_usuario,
      { category: input.category, documentUuid: input.documentUuid },
    )

    setComments((current) => [
      ...current,
      toComment(proposalUuid, created),
    ])
  }

  if (isLoadingDetail) {
    return (
      <div className="mx-auto flex w-full max-w-[1216px] justify-center px-4 py-16 text-[10px] text-muted">
        <Spinner label="Cargando detalle de propuesta" />
        <span className="ml-2">Cargando propuesta…</span>
      </div>
    )
  }

  if (detailError || !detail) {
    return (
      <div className="mx-auto w-full max-w-[1216px] px-4 py-8 sm:px-6 lg:px-8">
        <Alert
          open
          variant="danger"
          role="alert"
          placement="inline"
          title="No fue posible cargar la propuesta"
          description={detailError ?? 'La propuesta no está disponible.'}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1216px] px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-10">
      <div className="mb-4 flex items-center gap-1.5 text-[9px] text-muted">
        <button className="border-0 bg-transparent p-0 hover:text-primary-strong" type="button" onClick={() => navigate('/dashboard/proposals')}>
          Propuestas
        </button>
        <span aria-hidden="true">›</span>
        <strong className="font-semibold text-primary-strong">{detail.uuidExpediente}</strong>
      </div>

      <div className="flex flex-col gap-3 border-b border-line-soft pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[8px] text-muted">
            <span>{detail.entity}</span>
            <span>·</span>
            <span>Radicada el {detail.submittedAt}</span>
          </div>
          <h1 className="mt-1 text-[22px] font-semibold leading-7 tracking-[-0.025em] text-ink sm:text-[25px]">
            {detail.title}
          </h1>
        </div>
        <span className="inline-flex w-max items-center gap-1.5 rounded-full bg-primary-soft px-2 py-1.5 text-[8px] font-semibold text-primary-strong">
          <span className="size-[5px] rounded-full bg-current" />
          {detail.status}
        </span>
      </div>

      <DetailCard
        title="Información de la propuesta"
        subtitle={`${detail.applicantType} · ${detail.contactName}`}
        icon={<PaperClipIcon className="size-4" strokeWidth={1.8} aria-hidden="true" />}
      >
        <div className="flex flex-col gap-4 p-4">
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
            <div><dt className="text-[9px] text-muted">Entidad</dt><dd className="text-[11px] font-semibold text-ink">{detail.entity}</dd></div>
            <div><dt className="text-[9px] text-muted">Contacto</dt><dd className="text-[11px] font-semibold text-ink">{detail.contactName}</dd></div>
            <div><dt className="text-[9px] text-muted">Correo</dt><dd className="text-[11px] font-semibold text-ink">{detail.contactEmail}</dd></div>
            <div><dt className="text-[9px] text-muted">Tipo de propuesta</dt><dd className="text-[11px] font-semibold text-ink">{detail.proposalType ?? 'No especificado'}</dd></div>
          </dl>
          {isInfoExpanded && (
            <dl className="grid gap-x-6 gap-y-3 border-t border-line-soft pt-3 sm:grid-cols-2 lg:grid-cols-4">
              <div><dt className="text-[9px] text-muted">NIT o identificación</dt><dd className="text-[11px] font-semibold text-ink">{detail.nit ?? 'No aplica'}</dd></div>
              <div><dt className="text-[9px] text-muted">Cargo del contacto</dt><dd className="text-[11px] font-semibold text-ink">{detail.role ?? 'No especificado'}</dd></div>
              <div><dt className="text-[9px] text-muted">Teléfono</dt><dd className="text-[11px] font-semibold text-ink">{detail.phone ?? 'No especificado'}</dd></div>
              <div><dt className="text-[9px] text-muted">Fecha estimada de inicio</dt><dd className="text-[11px] font-semibold text-ink">{detail.startDate ?? 'No especificada'}</dd></div>
              <div className="sm:col-span-2 lg:col-span-4">
                <dt className="text-[9px] text-muted">Justificación o necesidad</dt>
                <dd className="text-[11px] leading-4 text-body">{detail.justification ?? 'No especificada'}</dd>
              </div>
            </dl>
          )}
          <div>
            <h3 className="text-[9px] text-muted">Descripción u objeto</h3>
            <p className="mt-1 text-[11px] leading-4 text-body">{detail.description}</p>
          </div>
          <button
            className="self-start border-0 bg-transparent p-0 text-[10px] font-semibold text-primary-strong hover:underline"
            type="button"
            aria-expanded={isInfoExpanded}
            onClick={() => setIsInfoExpanded((expanded) => !expanded)}
          >
            {isInfoExpanded ? 'Ver menos' : 'Ver más'}
          </button>
        </div>
      </DetailCard>

      <div className="mt-3 grid items-start gap-3.5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.65fr)]">
        <div className="flex flex-col gap-3.5">
          <DetailCard
            title="Cargar documentos"
            subtitle="Añade archivos a la propuesta"
            icon={<PaperClipIcon className="size-4" strokeWidth={1.8} aria-hidden="true" />}
          >
            <div className="p-3.5">
              <FileInput
                key={documentInputKey}
                accept=".pdf,.png,.jpg,.jpeg,.webp,.gif"
                acceptedFormatsLabel="PDF o imágenes"
                isUploading={isUploadingDocuments}
                maxSizeMb={20}
                multiple
                onFilesChange={setPendingDocumentFiles}
              />
              <button
                className="mt-3 h-[34px] rounded-md bg-primary px-3 text-[10px] font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                disabled={pendingDocumentFiles.length === 0 || isUploadingDocuments}
                onClick={openDocumentUpload}
              >
                Adjuntar documentos
              </button>
            </div>
          </DetailCard>
          <ProposalDocumentsPanel documents={detail.documents} />
          <ProposalHistory history={detail.history} />
        </div>

        <DetailCard
          title="Comentarios"
          subtitle={`${comments.length} comentario${comments.length === 1 ? '' : 's'} cargado${comments.length === 1 ? '' : 's'}`}
          icon={<ChatBubbleLeftRightIcon className="size-4" strokeWidth={1.8} aria-hidden="true" />}
        >
          {commentsError ? (
            <div className="p-3.5"><Alert open variant="danger" role="alert" placement="inline" title="No fue posible cargar los comentarios" description={commentsError} /></div>
          ) : (
            <CommentList
              className={comments.length > 3 ? 'max-h-[360px] overflow-y-auto' : undefined}
              comments={comments}
              hasMore={Boolean(nextCursor)}
              isLoadingMore={isLoadingMoreComments}
              onLoadMore={() => void loadMoreComments()}
              loadMoreError={loadMoreError}
            />
          )}
          <Can capability="comentar">
            <CommentComposer
              documents={detail.documents.map((document) => ({
                uuid: document.uuid_archivo,
                name: document.name,
              }))}
              onSubmit={publishComment}
            />
          </Can>
        </DetailCard>
      </div>

      <DocumentUploadDialog
        open={isDocumentUploadOpen}
        files={pendingDocumentFiles}
        isUploading={isUploadingDocuments}
        error={documentUploadError}
        onClose={() => {
          if (!isUploadingDocuments) {
            setIsDocumentUploadOpen(false)
            setDocumentUploadError(null)
          }
        }}
        onConfirm={() => void confirmDocumentUpload()}
      />
    </div>
  )
}
