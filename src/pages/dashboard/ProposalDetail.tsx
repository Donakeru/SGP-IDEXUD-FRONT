import {
  ArrowDownTrayIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  EyeIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
} from '@heroicons/react/24/outline'
import { useState, type ReactNode } from 'react'
import FileInput from '../../components/forms/FileInput'
import Select from '../../components/forms/Select'
import TextArea from '../../components/forms/TextArea'
import { useNavigate } from 'react-router-dom'

type DetailDocument = {
  name: string
  version: string
  uploader: string
  date: string
  size: string
}

type CommentCategory = 'Aprobado con observaciones' | 'Rechazado' | 'Visto bueno'

type ProposalComment = {
  text: string
  author: string
  role: string
  initials: string
  date: string
  elapsed: string
  category: CommentCategory
  tone: 'blue' | 'gold' | 'slate'
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

const comments: ProposalComment[] = [
  {
    text: 'Falta el certificado de existencia y representación legal de la entidad.',
    author: 'Laura Gómez',
    role: 'Jurídica',
    initials: 'LG',
    date: '07 oct 2026, 10:42',
    elapsed: 'hace 5 d',
    category: 'Aprobado con observaciones',
    tone: 'blue',
  },
  {
    text: 'Al proyecto le hace falta detallar el presupuesto por rubros.',
    author: 'Carlos Ruiz',
    role: 'Licitaciones',
    initials: 'CR',
    date: '08 oct 2026, 15:18',
    elapsed: 'hace 4 d',
    category: 'Rechazado',
    tone: 'gold',
  },
  {
    text: 'Se cargó la versión 2 con el presupuesto ajustado.',
    author: 'Equipo técnico',
    role: 'Formulación de proyectos',
    initials: 'ET',
    date: '12 oct 2026, 09:06',
    elapsed: 'hace 2 h',
    category: 'Visto bueno',
    tone: 'slate',
  },
]

const categoryStyles: Record<CommentCategory, string> = {
  'Aprobado con observaciones': 'bg-warning-soft text-warning',
  Rechazado: 'bg-danger-soft text-danger',
  'Visto bueno': 'bg-success-soft text-success',
}

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

function CommentItem({ comment }: { comment: ProposalComment }) {
  return (
    <article className="grid gap-3 border-b border-line-soft px-3.5 py-3 last:border-0 md:grid-cols-[minmax(0,1fr)_160px]">
      <div className="min-w-0">
        <span className={`inline-flex rounded px-1.5 py-1 text-[7px] font-semibold ${categoryStyles[comment.category]}`}>
          {comment.category}
        </span>
        <p className="mt-2 text-[9px] leading-4 text-body">{comment.text}</p>
        <button
          className="mt-2 border-0 bg-transparent p-0 text-[8px] font-semibold text-primary-strong hover:underline"
          type="button"
        >
          Responder
        </button>
      </div>
      <div className="flex items-start gap-2 md:justify-end">
        <span className={`grid size-7 shrink-0 place-items-center rounded-full text-[8px] font-bold text-white ${
          comment.tone === 'gold'
            ? 'bg-warning'
            : comment.tone === 'slate'
              ? 'bg-slate-600'
              : 'bg-primary'
        }`}>
          {comment.initials}
        </span>
        <span className="min-w-0">
          <strong className="block truncate text-[8px] font-semibold text-ink">{comment.author}</strong>
          <small className="block truncate text-[7px] text-muted">{comment.role}</small>
          <small className="mt-1 block text-[7px] text-muted">
            {comment.date} · {comment.elapsed}
          </small>
        </span>
      </div>
    </article>
  )
}

export default function ProposalDetail() {
  const navigate = useNavigate()
  const [selectedDocument, setSelectedDocument] = useState(documents[0].name)
  const [comment, setComment] = useState('')
  const [category, setCategory] = useState<CommentCategory>('Visto bueno')
  const [documentReference, setDocumentReference] = useState(documents[0].name)

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
          subtitle="3 comentarios · Orden cronológico"
          icon={<ChatBubbleLeftRightIcon className="size-4" strokeWidth={1.8} aria-hidden="true" />}
        >
          <div>
            {comments.map((item) => (
              <CommentItem comment={item} key={`${item.author}-${item.date}`} />
            ))}
          </div>

          <div className="border-t border-line-soft p-3.5">
            <strong className="text-[10px] font-semibold text-ink">Nuevo comentario</strong>
            <TextArea
              className="mt-2 !min-h-[72px] !text-[9px]"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Escribe una observación clara para el equipo…"
            />
            <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto] sm:items-end">
              <label className="flex flex-col gap-1">
                <span className="text-[7px] font-semibold text-muted">Categoría</span>
                <Select
                  className="!min-h-[30px] h-[30px] px-2 text-[8px]"
                  value={category}
                  onChange={(event) => setCategory(event.target.value as CommentCategory)}
                >
                  <option>Visto bueno</option>
                  <option>Aprobado con observaciones</option>
                  <option>Rechazado</option>
                </Select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[7px] font-semibold text-muted">Documento relacionado (opcional)</span>
                <Select
                  className="!min-h-[30px] h-[30px] px-2 text-[8px]"
                  value={documentReference}
                  onChange={(event) => setDocumentReference(event.target.value)}
                >
                  {documents.map((document) => (
                    <option key={document.name} value={document.name}>{document.name}</option>
                  ))}
                </Select>
              </label>
              <button
                className="inline-flex h-[30px] items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-[8px] font-semibold text-white shadow-[0_2px_4px_rgba(255,78,0,0.18)] transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                disabled={!comment.trim()}
              >
                <PaperAirplaneIcon className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
                Publicar comentario
              </button>
            </div>
          </div>
        </DetailCard>
      </div>
    </div>
  )
}
