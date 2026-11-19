import { ArrowDownTrayIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { downloadDocument } from '../services/documentService'
import type { ProposalDocument } from '../types/proposal/ProposalDocument'

type ProposalDocumentsProps = {
  documents: ProposalDocument[]
  showVersion?: boolean
  selectedDocumentName?: string
  onSelect?: (document: ProposalDocument) => void
  emptyMessage?: string
}

export default function ProposalDocuments({
  documents,
  showVersion = false,
  selectedDocumentName,
  onSelect,
  emptyMessage = 'Esta propuesta no tiene documentos adjuntos.',
}: ProposalDocumentsProps) {
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const handleDownload = async (document: ProposalDocument) => {
    if (!document.uuid_archivo || downloadingFile) {
      return
    }

    setDownloadingFile(document.uuid_archivo)
    setDownloadError(null)

    try {
      await downloadDocument(document)
    } catch (error) {
      setDownloadError(
        error instanceof Error
          ? error.message
          : 'No fue posible descargar el documento.',
      )
    } finally {
      setDownloadingFile(null)
    }
  }

  if (documents.length === 0) {
    return <p className="px-4 py-6 text-center text-[11px] text-muted">{emptyMessage}</p>
  }

  return (
    <div>
      {documents.map((document) => {
        const isSelected = selectedDocumentName === document.name
        const canDownload = Boolean(document.uuid_archivo)
        const isDownloading = downloadingFile === document.uuid_archivo
        const rowClassName = `flex w-full items-center gap-2.5 border-b border-line-soft px-4 py-2.5 text-left last:border-0 ${
          isSelected ? 'bg-primary-soft/60' : 'bg-white'
        }`

        const content = (
          <>
            <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary-soft text-primary-strong">
              <DocumentTextIcon className="size-[18px] shrink-0" strokeWidth={1.8} aria-hidden="true" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <strong className="truncate text-[11px] text-ink">{document.nombre_original}</strong>
              <small className="text-[9px] text-muted">
                {document.tipo_documento || document.size}
                {document.tipo_documento && document.size ? ` · ${document.size}` : ''}
              </small>
            </span>
            {showVersion && (
              <span className="rounded bg-chip px-1.5 py-1 text-[7px] font-semibold text-body">
                v{document.numero_version}
              </span>
            )}
            <button
              className="rounded p-1 text-muted hover:bg-primary-soft hover:text-primary-strong disabled:cursor-not-allowed disabled:opacity-40"
              type="button"
              disabled={!canDownload || Boolean(downloadingFile)}
              aria-label={canDownload ? `Descargar ${document.nombre_original}` : `UUID pendiente para ${document.nombre_original}`}
              title={canDownload ? 'Descargar documento' : 'UUID del archivo pendiente'}
              onClick={(event) => {
                event.stopPropagation()
                void handleDownload(document)
              }}
            >
              <ArrowDownTrayIcon className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
            </button>
            {isDownloading && <span className="text-[8px] text-muted">Descargando…</span>}
          </>
        )

        return (
          <div
            className={`${rowClassName} ${onSelect ? 'cursor-pointer hover:bg-canvas' : ''}`}
            key={document.name}
            role={onSelect ? 'button' : undefined}
            tabIndex={onSelect ? 0 : undefined}
            aria-pressed={onSelect ? isSelected : undefined}
            onClick={onSelect ? () => onSelect(document) : undefined}
            onKeyDown={
              onSelect
                ? (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onSelect(document)
                    }
                  }
                : undefined
            }
          >
            {content}
          </div>
        )
      })}
      {downloadError && (
        <p className="border-t border-danger-line bg-danger-subtle px-4 py-2 text-[9px] text-danger" role="alert">
          {downloadError}
        </p>
      )}
    </div>
  )
}
