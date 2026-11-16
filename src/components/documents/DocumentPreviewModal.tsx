import {
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import Spinner from '../Spinner'
import DocumentViewer from './DocumentViewer'
import { useDocumentDownload } from './useDocumentDownload'
import { useDocumentFile } from './useDocumentFile'
import { isRetryableDocumentError } from '../../services/documentService'
import {
  formatFileSize,
  getFileIcon,
  getFileTypeLabel,
  isPreviewable,
} from '../../utils/file'
import type { ProposalDocument } from '../../types/proposal/ProposalDocument'

type DocumentPreviewModalProps = {
  doc: ProposalDocument
  open: boolean
  onClose: () => void
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])'

const actionButtonClass =
  'inline-flex h-[34px] items-center gap-1.5 rounded-md border border-line bg-white px-2.5 text-[10px] font-semibold text-body transition-colors hover:bg-primary-soft hover:text-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white'

function getFocusable(container: HTMLElement | null) {
  if (!container) {
    return []
  }

  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => element.getAttribute('aria-hidden') !== 'true',
  )
}

/**
 * Modal de vista previa de un documento (PDF o imagen). Se cierra con la X,
 * con Esc y haciendo clic fuera. Es un diálogo accesible: `role="dialog"`,
 * foco atrapado, foco devuelto al cerrar y scroll de la página bloqueado.
 * En pantallas pequeñas ocupa toda la pantalla.
 *
 * Solo pide el archivo mientras está abierto. Si se le pasa un documento no
 * previsualizable no renderiza nada (los botones de `DocumentActions` ya no
 * ofrecen la vista previa para esos tipos).
 */
export default function DocumentPreviewModal({
  doc,
  open,
  onClose,
}: DocumentPreviewModalProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)
  const previewable = isPreviewable(doc.tipo_mime)
  const isOpen = open && previewable

  const file = useDocumentFile(isOpen ? doc.uuid_archivo : null, {
    mimeType: doc.tipo_mime,
  })
  const { download, isDownloading, error: downloadError, clearError } =
    useDocumentDownload(doc)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  // Foco, Esc, Tab atrapado y bloqueo de scroll mientras está abierto.
  useEffect(() => {
    if (!isOpen) {
      return
    }

    const previouslyFocused = window.document.activeElement as HTMLElement | null
    const previousOverflow = window.document.body.style.overflow

    window.document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const focusable = getFocusable(dialogRef.current)

      if (focusable.length === 0) {
        event.preventDefault()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = window.document.activeElement
      const isInside = dialogRef.current?.contains(active) ?? false

      if (event.shiftKey && (active === first || !isInside)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || !isInside)) {
        event.preventDefault()
        first.focus()
      }
    }

    window.document.addEventListener('keydown', handleKeyDown)

    return () => {
      window.document.removeEventListener('keydown', handleKeyDown)
      window.document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  const Icon = getFileIcon(doc.tipo_mime)

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-ink/50 sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        ref={dialogRef}
        className="flex h-dvh w-screen flex-col overflow-hidden bg-white shadow-[0_18px_48px_rgba(38,38,38,0.22)] sm:h-[90vh] sm:w-full sm:max-w-5xl sm:rounded-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="flex flex-wrap items-center gap-3 border-b border-line-soft px-4 py-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary-soft text-primary-strong">
            <Icon className="size-5" strokeWidth={1.8} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="truncate text-[13px] font-semibold text-ink">
              {doc.nombre_original}
            </h2>
            <p className="text-[10px] text-muted">
              {getFileTypeLabel(doc.tipo_mime)} · {formatFileSize(doc.tamano_bytes)} · v
              {doc.numero_version}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              className={actionButtonClass}
              type="button"
              disabled={isDownloading}
              aria-busy={isDownloading || undefined}
              onClick={() => void download(file.blob)}
            >
              {isDownloading ? (
                <Spinner />
              ) : (
                <ArrowDownTrayIcon className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
              )}
              Descargar
            </button>

            {file.url ? (
              <a
                className={actionButtonClass}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ArrowTopRightOnSquareIcon className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
                <span className="hidden sm:inline">Abrir en pestaña nueva</span>
                <span className="sm:hidden">Abrir</span>
              </a>
            ) : (
              <button className={actionButtonClass} type="button" disabled>
                <ArrowTopRightOnSquareIcon className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
                <span className="hidden sm:inline">Abrir en pestaña nueva</span>
                <span className="sm:hidden">Abrir</span>
              </button>
            )}

            <button
              ref={closeButtonRef}
              className="grid size-[34px] place-items-center rounded-md border border-line bg-white text-body transition-colors hover:bg-primary-soft hover:text-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              type="button"
              aria-label="Cerrar"
              title="Cerrar"
              onClick={onClose}
            >
              <XMarkIcon className="size-5" strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
        </header>

        {downloadError && (
          <div
            className="flex flex-wrap items-center gap-2 border-b border-danger-line bg-danger-subtle px-4 py-2 text-[10px] text-danger"
            role="alert"
          >
            <span className="flex-1">{downloadError.message}</span>
            {isRetryableDocumentError(downloadError) && (
              <button
                className="font-semibold underline"
                type="button"
                onClick={() => void download(file.blob)}
              >
                Reintentar
              </button>
            )}
            <button className="font-semibold underline" type="button" onClick={clearError}>
              Cerrar aviso
            </button>
          </div>
        )}

        <div className="min-h-0 flex-1 bg-canvas">
          <DocumentViewer
            doc={doc}
            status={file.status}
            url={file.url}
            error={file.error}
            onRetry={file.retry}
          />
        </div>
      </div>
    </div>,
    window.document.body,
  )
}
