import {
  ArrowDownTrayIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  EyeIcon,
  PaperClipIcon,
} from '@heroicons/react/24/outline'
import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getRoleLabel } from '../../auth/userDisplay'
import { useAuth } from '../../auth/useAuth'
import Alert from '../../components/Alert'
import Can from '../../components/auth/Can'
import CommentComposer from '../../components/comments/CommentComposer'
import CommentList from '../../components/comments/CommentList'
import FileInput from '../../components/forms/FileInput'
import Spinner from '../../components/Spinner'
import { createComment, getComments } from '../../services/commentService'
import { isAbortError } from '../../services/http/errors'
import type { Comment, NewCommentInput } from '../../types/comment/Comment'

type DetailDocument = {
  name: string
  version: string
  uploader: string
  date: string
  size: string
}

const documents: DetailDocument[] = [
  {
    name: 'Propuesta técnica y económica.pdf',
    version: 'v2',
    uploader: 'Equipo técnico',
    date: '12 oct 2026',
    size: '3,2 MB',
  },
  {
    name: 'Certificado de experiencia.pdf',
    version: 'v1',
    uploader: 'Ana Torres',
    date: '08 oct 2026',
    size: '1,8 MB',
  },
  {
    name: 'Presupuesto detallado.xlsx',
    version: 'v2',
    uploader: 'Carlos Ruiz',
    date: '12 oct 2026',
    size: '640 KB',
  },
]

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

export default function ProposalDetail() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  // TODO: el detalle de la propuesta aún es de ejemplo (no hay endpoint). Los
  // comentarios sí se piden por `id` de la URL, como llega desde la tabla y Revisión.
  const proposalId = searchParams.get('id') ?? 'sin-id'
  const [selectedDocument, setSelectedDocument] = useState(documents[0].name)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoadingComments, setIsLoadingComments] = useState(true)
  const [commentsError, setCommentsError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    const loadComments = async () => {
      setIsLoadingComments(true)
      setCommentsError(null)

      try {
        const loaded = await getComments(proposalId, controller.signal)

        if (!controller.signal.aborted) {
          setComments(loaded)
        }
      } catch (error) {
        if (!isAbortError(error) && !controller.signal.aborted) {
          setCommentsError(
            error instanceof Error
              ? error.message
              : 'No fue posible cargar los comentarios.',
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingComments(false)
        }
      }
    }

    void loadComments()

    return () => controller.abort()
  }, [proposalId])

  const publishComment = async (input: NewCommentInput) => {
    if (!user) {
      throw new Error('Inicia sesión para publicar un comentario.')
    }

    const created = await createComment(proposalId, input, {
      id: user.id_usuario,
      name: user.nombre,
      role: getRoleLabel(user) || 'Sin rol asignado',
    })

    setComments((current) => [...current, created])
  }

  return (
    <div className="mx-auto w-full max-w-[1216px] px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-10">
      <div className="mb-4 flex items-center gap-1.5 text-[9px] text-muted">
        <button
          className="border-0 bg-transparent p-0 hover:text-primary-strong"
          type="button"
          onClick={() => navigate('/dashboard/proposals')}
        >
          Propuestas
        </button>
        <span aria-hidden="true">›</span>
        <strong className="font-semibold text-primary-strong">PROP-2026-014</strong>
      </div>

      <div className="flex flex-col gap-3 border-b border-line-soft pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[8px] text-muted">
            <span className="inline-flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-primary" />
              Fundación para el Desarrollo Social
            </span>
            <span>·</span>
            <span>Radicada el 02 oct 2026</span>
          </div>
          <h1 className="mt-1 text-[22px] font-semibold leading-7 tracking-[-0.025em] text-ink sm:text-[25px]">
            Convenio de capacitación para el trabajo
          </h1>
        </div>
        <span className="inline-flex w-max items-center gap-1.5 rounded-full bg-primary-soft px-2 py-1.5 text-[8px] font-semibold text-primary-strong">
          <span className="size-[5px] rounded-full bg-current" />
          En comité
        </span>
      </div>

      <div className="mt-3 grid items-start gap-3.5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.65fr)]">
        <DetailCard
          title="Documentación del proyecto"
          subtitle="3 archivos · 5 versiones"
          icon={<PaperClipIcon className="size-4" strokeWidth={1.8} aria-hidden="true" />}
        >
          <div className="p-3">
            <FileInput
              acceptedFormatsLabel="PDF, DOCX o XLSX"
              maxSizeMb={20}
              multiple
            />

          </div>

          <div className="border-t border-line-soft">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-[8px] font-semibold uppercase tracking-[0.05em] text-muted">Archivos cargados</span>
              <span className="grid size-5 place-items-center rounded-full bg-primary-soft text-[8px] font-bold text-primary-strong">3</span>
            </div>
            {documents.map((document) => (
              <button
                className={`flex w-full items-center gap-2 border-l-2 px-3 py-2 text-left transition-colors ${
                  selectedDocument === document.name
                    ? 'border-primary bg-primary-soft/60'
                    : 'border-transparent hover:bg-canvas'
                }`}
                key={document.name}
                type="button"
                onClick={() => setSelectedDocument(document.name)}
              >
                <DocumentTextIcon className="size-4 shrink-0 text-primary-strong" strokeWidth={1.8} aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-[8px] font-semibold text-ink">{document.name}</strong>
                  <small className="block truncate text-[7px] text-muted">{document.uploader} · {document.size}</small>
                </span>
                <span className="rounded bg-chip px-1 py-0.5 text-[7px] font-semibold text-body">{document.version}</span>
                <EyeIcon className="size-3.5 shrink-0 text-muted" strokeWidth={1.8} aria-hidden="true" />
                <ArrowDownTrayIcon className="size-3.5 shrink-0 text-muted" strokeWidth={1.8} aria-hidden="true" />
              </button>
            ))}
          </div>

          <div className="border-t border-line-soft p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[8px] font-semibold text-ink">Vista previa</span>
              <span className="rounded bg-danger-soft px-1.5 py-1 text-[7px] font-semibold text-danger">PDF</span>
            </div>
            <div className="relative flex min-h-[145px] items-center justify-center overflow-hidden rounded-md border border-line bg-canvas p-3">
              <div className="h-[118px] w-[90px] rounded-sm bg-white p-3 shadow-[0_2px_8px_rgba(38,38,38,0.12)]">
                <span className="block text-[6px] font-bold text-primary-strong">IDEXUD</span>
                <span className="mt-3 block h-1 w-12 rounded bg-line" />
                <span className="mt-1 block h-1 w-16 rounded bg-line-soft" />
                <span className="mt-4 block h-7 rounded bg-canvas" />
                <span className="mt-3 block h-1 w-14 rounded bg-line-soft" />
              </div>
              <span className="absolute bottom-2 right-2 rounded bg-ink px-1.5 py-1 text-[7px] font-semibold text-white">Página 1 de 5</span>
            </div>
          </div>
        </DetailCard>

        <DetailCard
          title="Comentarios"
          subtitle={`${comments.length} ${comments.length === 1 ? 'comentario' : 'comentarios'} · Orden cronológico`}
          icon={<ChatBubbleLeftRightIcon className="size-4" strokeWidth={1.8} aria-hidden="true" />}
        >
          {isLoadingComments ? (
            <div className="flex items-center justify-center gap-2 px-4 py-10 text-[10px] text-muted">
              <Spinner label="Cargando comentarios" />
              Cargando comentarios…
            </div>
          ) : commentsError ? (
            <div className="p-3.5">
              <Alert
                open
                variant="danger"
                role="alert"
                placement="inline"
                title="No fue posible cargar los comentarios"
                description={commentsError}
              />
            </div>
          ) : (
            <CommentList comments={comments} />
          )}

          <Can capability="comentar">
            <CommentComposer
              documents={documents.map((document) => document.name)}
              onSubmit={publishComment}
            />
          </Can>
        </DetailCard>
      </div>
    </div>
  )
}
