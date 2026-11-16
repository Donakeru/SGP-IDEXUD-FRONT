import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import Button from '../Button'
import Spinner from '../Spinner'
import { isRetryableDocumentError, type DocumentError } from '../../services/documentService'
import { getPreviewKind } from '../../utils/file'
import type { ProposalDocument } from '../../types/proposal/ProposalDocument'

type DocumentViewerProps = {
  doc: Pick<ProposalDocument, 'nombre_original' | 'tipo_mime'>
  status: 'idle' | 'loading' | 'ready' | 'error'
  /** URL de objeto (`blob:`) del archivo ya cargado. */
  url: string | null
  error: DocumentError | null
  onRetry: () => void
}

/**
 * Muestra el archivo según su tipo MIME: PDF en un `iframe` e imágenes en un
 * `img`. Solo se usa con documentos previsualizables; nunca renderiza HTML ni
 * SVG ni inyecta contenido.
 */
export default function DocumentViewer({
  doc,
  status,
  url,
  error,
  onRetry,
}: DocumentViewerProps) {
  const kind = getPreviewKind(doc.tipo_mime)

  if (status === 'error' && error) {
    return (
      <div
        className="flex h-full flex-col items-center justify-center gap-3 px-6 py-10 text-center"
        role="alert"
      >
        <span className="grid size-12 place-items-center rounded-full bg-danger-soft text-danger">
          <ExclamationTriangleIcon className="size-6" strokeWidth={1.8} aria-hidden="true" />
        </span>
        <p className="max-w-[360px] text-xs leading-5 text-body">{error.message}</p>
        {isRetryableDocumentError(error) && (
          <Button variant="secondary" onClick={onRetry}>
            Reintentar
          </Button>
        )}
      </div>
    )
  }

  if (status !== 'ready' || !url || !kind) {
    return (
      <div className="flex h-full items-center justify-center gap-2 px-6 py-10 text-xs text-muted">
        <Spinner label="Cargando archivo" />
        Cargando archivo…
      </div>
    )
  }

  if (kind === 'pdf') {
    return (
      <iframe
        className="h-full w-full border-0 bg-white"
        src={url}
        title={`Vista previa de ${doc.nombre_original}`}
        referrerPolicy="no-referrer"
      />
    )
  }

  return (
    <div className="flex h-full items-center justify-center overflow-auto p-4">
      <img
        className="max-h-full max-w-full object-contain"
        src={url}
        alt={doc.nombre_original}
      />
    </div>
  )
}
