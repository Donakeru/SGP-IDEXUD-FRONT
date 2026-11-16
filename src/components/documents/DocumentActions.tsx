import { ArrowDownTrayIcon, EyeIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import Spinner from '../Spinner'
import DocumentPreviewModal from './DocumentPreviewModal'
import { useDocumentDownload } from './useDocumentDownload'
import { isRetryableDocumentError } from '../../services/documentService'
import { isPreviewable } from '../../utils/file'
import type { ProposalDocument } from '../../types/proposal/ProposalDocument'

type DocumentActionsProps = {
  doc: ProposalDocument
  className?: string
}

const iconButtonClass =
  'grid size-8 place-items-center rounded-md border border-line bg-white text-body transition-colors hover:bg-primary-soft hover:text-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white disabled:hover:text-body'

/**
 * Acciones de un documento: **Descargar** (siempre) y **Previsualizar** (solo
 * PDF e imágenes). Es autosuficiente: incluye el modal y el estado de la
 * descarga, así que basta con pasarle el documento. No depende de `Review`,
 * por lo que puede usarse tal cual en `ProposalDetail`.
 */
export default function DocumentActions({ doc, className = '' }: DocumentActionsProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const { download, isDownloading, error } = useDocumentDownload(doc)
  const canPreview = isPreviewable(doc.tipo_mime)

  return (
    <div className={`flex shrink-0 flex-col items-end gap-1 ${className}`}>
      <div className="flex items-center gap-1.5">
        {canPreview && (
          <button
            className={iconButtonClass}
            type="button"
            title="Previsualizar"
            aria-label={`Previsualizar ${doc.nombre_original}`}
            aria-haspopup="dialog"
            onClick={() => setIsPreviewOpen(true)}
          >
            <EyeIcon className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
          </button>
        )}
        <button
          className={iconButtonClass}
          type="button"
          title="Descargar"
          aria-label={`Descargar ${doc.nombre_original}`}
          disabled={isDownloading}
          aria-busy={isDownloading || undefined}
          onClick={() => void download()}
        >
          {isDownloading ? (
            <Spinner />
          ) : (
            <ArrowDownTrayIcon className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
          )}
        </button>
      </div>

      {error && (
        <p className="max-w-[240px] text-right text-[9px] leading-3 text-danger" role="alert">
          {error.message}
          {isRetryableDocumentError(error) && (
            <>
              {' '}
              <button
                className="font-semibold underline"
                type="button"
                onClick={() => void download()}
              >
                Reintentar
              </button>
            </>
          )}
        </p>
      )}

      {canPreview && (
        <DocumentPreviewModal
          doc={doc}
          open={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  )
}
