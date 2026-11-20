import { DocumentTextIcon } from '@heroicons/react/24/outline'
import Modal from '../Modal'

export type DocumentUploadDialogProps = {
  open: boolean
  files: readonly File[]
  isUploading: boolean
  error?: string | null
  onClose: () => void
  onConfirm: () => void
}

export default function DocumentUploadDialog({
  open,
  files,
  isUploading,
  error,
  onClose,
  onConfirm,
}: DocumentUploadDialogProps) {
  return (
    <Modal
      open={open}
      title="¿Adjuntar documentos?"
      description="Los archivos seleccionados se asociarán a esta propuesta."
      icon={<DocumentTextIcon className="size-5" strokeWidth={1.8} aria-hidden="true" />}
      onClose={isUploading ? undefined : onClose}
      footer={
        <>
          <button
            className="h-[38px] rounded-md border border-line bg-white px-3.5 text-[10px] font-semibold text-body hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            disabled={isUploading}
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="h-[38px] rounded-md bg-primary px-3.5 text-[10px] font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            disabled={isUploading || files.length === 0}
            onClick={onConfirm}
          >
            {isUploading ? 'Adjuntando…' : 'Sí, adjuntar documentos'}
          </button>
        </>
      }
    >
      <div className="mt-4 rounded-md border border-line-soft bg-canvas p-3 text-left">
        <p className="text-[10px] font-semibold text-ink">
          {files.length} archivo{files.length === 1 ? '' : 's'} seleccionado{files.length === 1 ? '' : 's'}
        </p>
        <ul className="mt-2 flex max-h-36 flex-col gap-1 overflow-y-auto">
          {files.map((file) => (
            <li className="flex min-w-0 items-center gap-1.5 text-[9px] text-body" key={`${file.name}-${file.size}-${file.lastModified}`}>
              <DocumentTextIcon className="size-3.5 shrink-0 text-primary-strong" strokeWidth={1.8} aria-hidden="true" />
              <span className="truncate" title={file.name}>{file.name}</span>
            </li>
          ))}
        </ul>
      </div>
      {error && (
        <p className="mt-3 rounded-md border border-danger-line bg-danger-subtle px-3 py-2 text-left text-[9px] leading-4 text-danger" role="alert">
          {error}
        </p>
      )}
    </Modal>
  )
}
