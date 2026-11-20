import { useState } from 'react'
import DocumentActions from './documents/DocumentActions'
import type { ProposalDocument } from '../types/proposal/ProposalDocument'

type ProposalDocumentsPanelProps = {
  documents: ProposalDocument[]
}

export default function ProposalDocumentsPanel({ documents }: ProposalDocumentsPanelProps) {
  const [showPrevious, setShowPrevious] = useState(false)
  const currentDocuments = documents.filter((document) => document.es_vigente)
  const previousCount = documents.length - currentDocuments.length
  const visibleDocuments = showPrevious ? documents : currentDocuments

  return (
    <section className="overflow-hidden rounded-lg border border-line bg-white shadow-[0_4px_14px_rgba(38,38,38,0.05)]">
      <header className="border-b border-line-soft px-4 py-3">
        <h2 className="text-[13px] font-semibold leading-[19px] text-ink">Documentos adjuntos</h2>
        <p className="mt-px text-[10px] leading-[14px] text-muted">
          {visibleDocuments.length} archivo{visibleDocuments.length === 1 ? '' : 's'}
        </p>
      </header>
      {visibleDocuments.length > 0 ? (
        <ul>
          {visibleDocuments.map((document) => (
            <li className="flex items-center gap-2.5 border-b border-line-soft px-4 py-2.5 last:border-0" key={document.uuid_archivo}>
              <span className="flex min-w-0 flex-1 flex-col">
                <strong className="truncate text-[11px] text-ink" title={document.nombre_original}>
                  {document.nombre_original}
                </strong>
                <small className="text-[9px] text-muted">
                  {document.tipo_documento || document.tipo_mime} · {document.size} · v{document.numero_version}
                </small>
              </span>
              {!document.es_vigente && (
                <span className="shrink-0 rounded bg-chip px-1.5 py-0.5 text-[9px] font-semibold text-body">Anterior</span>
              )}
              <DocumentActions doc={document} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-4 py-6 text-center text-[11px] text-muted">
          {documents.length > 0 ? 'Esta propuesta no tiene documentos vigentes.' : 'Esta propuesta no tiene documentos adjuntos.'}
        </p>
      )}
      {previousCount > 0 && (
        <div className="border-t border-line-soft px-4 py-2">
          <button className="border-0 bg-transparent p-0 text-[10px] font-semibold text-primary-strong hover:underline" type="button" onClick={() => setShowPrevious((visible) => !visible)}>
            {showPrevious ? 'Ocultar versiones anteriores' : `Mostrar versiones anteriores (${previousCount})`}
          </button>
        </div>
      )}
    </section>
  )
}
