import { ArrowUpTrayIcon, DocumentTextIcon, EyeIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useRef, useState } from 'react'
import { isPreviewable } from '../../utils/file'
import FilePreviewModal from '../documents/FilePreviewModal'

type FileItemStatus = 'ready' | 'error'

type FileItem = {
  id: string
  file: File
  status: FileItemStatus
  error?: string
}

export type FileInputProps = {
  accept?: string
  acceptedFormatsLabel?: string
  isUploading?: boolean
  maxSizeMb?: number
  multiple?: boolean
  onFilesChange?: (files: File[]) => void
  onUploadError?: (file: File, message: string) => void
  uploadProgress?: number
}

const DEFAULT_ACCEPT = '.pdf,.png,.jpg,.jpeg,.webp,.gif'
const DEFAULT_FORMATS_LABEL = 'PDF o imágenes'
const configuredMaxSizeMb = Number.parseFloat(import.meta.env.VITE_MAX_FILE_SIZE_MB ?? '')
const DEFAULT_MAX_SIZE_MB = Number.isFinite(configuredMaxSizeMb)
  ? Math.min(10, Math.max(1, configuredMaxSizeMb))
  : 10

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
}

function formatFileType(file: File) {
  const extension = file.name.split('.').pop()
  return extension ? extension.toUpperCase() : file.type || 'Archivo'
}

function createFileId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`
}

function getInvalidFileMessage(
  file: File,
  acceptedFormatsLabel: string,
  maxSizeMb: number,
  accept: string,
) {
  const extensions = accept
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item.startsWith('.'))
  const hasValidExtension =
    extensions.length === 0 ||
    extensions.some((extension) => file.name.toLowerCase().endsWith(extension))

  if (!hasValidExtension) {
    return `Formato no permitido. Usa ${acceptedFormatsLabel}.`
  }

  if (file.size > maxSizeMb * 1024 * 1024) {
    return `El archivo supera el límite de ${maxSizeMb} MB.`
  }

  return undefined
}

export default function FileInput({
  accept = DEFAULT_ACCEPT,
  acceptedFormatsLabel = DEFAULT_FORMATS_LABEL,
  isUploading = false,
  maxSizeMb = DEFAULT_MAX_SIZE_MB,
  multiple = true,
  onFilesChange,
  onUploadError,
  uploadProgress = 0,
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [items, setItems] = useState<FileItem[]>([])
  const [previewFile, setPreviewFile] = useState<File | null>(null)

  const notifyFilesChange = (nextItems: FileItem[]) => {
    onFilesChange?.(
      nextItems
        .filter((item) => item.status === 'ready')
        .map((item) => item.file),
    )
  }

  const addFiles = (incomingFiles: File[]) => {
    const filesToAdd = multiple ? incomingFiles : incomingFiles.slice(0, 1)
    const newItems = filesToAdd.map<FileItem>((file) => {
      const error = getInvalidFileMessage(
        file,
        acceptedFormatsLabel,
        maxSizeMb,
        accept,
      )

      if (error) {
        onUploadError?.(file, error)
      }

      return {
        id: createFileId(file),
        file,
        status: error ? 'error' : 'ready',
        error,
      }
    })

    const currentItems = multiple ? items : []
    const existingIds = new Set(currentItems.map((item) => item.id))
    const nextItems = [
      ...currentItems,
      ...newItems.filter((item) => !existingIds.has(item.id)),
    ]

    setItems(nextItems)
    notifyFilesChange(nextItems)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(event.target.files ?? []))
    event.target.value = ''
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    addFiles(Array.from(event.dataTransfer.files))
  }

  const removeFile = (id: string) => {
    const nextItems = items.filter((item) => item.id !== id)
    const removedItem = items.find((item) => item.id === id)

    if (removedItem?.file === previewFile) {
      setPreviewFile(null)
    }

    setItems(nextItems)
    notifyFilesChange(nextItems)
  }

  const normalizedProgress = Math.min(100, Math.max(0, uploadProgress))

  return (
    <div className="w-full" aria-live="polite">
      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
      />

      <div
        className={`flex min-h-[100px] cursor-pointer items-center justify-center gap-[11px] rounded-lg border-[1.5px] border-dashed px-3.5 text-left text-primary-strong transition-colors ${
          isDragging
            ? 'border-primary bg-primary-soft'
            : 'border-line-strong bg-canvas hover:border-primary hover:bg-primary-soft'
        }`}
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            inputRef.current?.click()
          }
        }}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line bg-white text-primary-strong">
          <ArrowUpTrayIcon className="size-5" strokeWidth={1.8} aria-hidden="true" />
        </span>
        <span className="flex flex-col gap-1">
          <strong className="text-[10px] font-semibold text-primary-strong">
            {isUploading ? `Cargando archivos… ${normalizedProgress}%` : 'Arrastra archivos o haz clic para cargar'}
          </strong>
          <small className="text-[8px] text-muted">
            {acceptedFormatsLabel} · Máximo {maxSizeMb} MB por archivo
          </small>
          {isUploading && (
            <span className="mt-1 h-1 w-full max-w-[220px] overflow-hidden rounded-full bg-line">
              <span
                className="block h-full rounded-full bg-primary transition-[width] duration-200"
                style={{ width: `${normalizedProgress}%` }}
              />
            </span>
          )}
        </span>
      </div>

      {items.length > 0 && (
        <div className="mt-2.5 flex flex-col gap-[7px]">
          {items.map((item) => {
            const hasError = item.status === 'error'

            return (
              <div
                className={`flex min-h-[54px] items-center gap-[9px] rounded-[7px] border px-2.5 py-2 ${
                  hasError
                    ? 'border-danger-line bg-danger-subtle'
                    : 'border-line bg-white'
                }`}
                key={item.id}
              >
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-md ${
                    hasError
                      ? 'bg-danger-soft text-danger'
                      : 'bg-primary-soft text-primary-strong'
                  }`}
                >
                  {hasError ? <ExclamationTriangleIcon className="size-[17px]" strokeWidth={1.8} aria-hidden="true" /> : <DocumentTextIcon className="size-[19px]" strokeWidth={1.8} aria-hidden="true" />}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <strong className="overflow-hidden text-ellipsis whitespace-nowrap text-[9px] text-ink">
                    {item.file.name}
                  </strong>
                  <small
                    className={`text-[8px] ${
                      hasError ? 'text-danger' : 'text-muted'
                    }`}
                  >
                    {hasError
                      ? item.error
                      : `${formatFileType(item.file)} · ${formatFileSize(item.file.size)}${isUploading ? ` · Cargando ${normalizedProgress}%` : ''}`}
                  </small>
                  {!hasError && isUploading && (
                    <span className="mt-1 h-1 w-full overflow-hidden rounded-full bg-line">
                      <span
                        className="block h-full rounded-full bg-primary transition-[width] duration-200"
                        style={{ width: `${normalizedProgress}%` }}
                      />
                    </span>
                  )}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {!hasError && isPreviewable(item.file.type) && (
                    <button
                      className="grid size-8 place-items-center rounded-md border border-line bg-white text-primary-strong transition-colors hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      type="button"
                      aria-label={`Previsualizar ${item.file.name}`}
                      title="Previsualizar"
                      onClick={() => setPreviewFile(item.file)}
                    >
                      <EyeIcon className="size-4" strokeWidth={1.8} aria-hidden="true" />
                    </button>
                  )}
                  <button
                    className={`grid size-8 place-items-center rounded-md border bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                      hasError
                        ? 'border-danger-line text-danger hover:bg-danger-soft'
                        : 'border-line text-body hover:bg-primary-soft hover:text-primary-strong'
                    }`}
                    type="button"
                    aria-label={hasError ? `Quitar ${item.file.name}` : `Eliminar ${item.file.name}`}
                    title={hasError ? 'Quitar archivo' : 'Eliminar archivo'}
                    onClick={() => removeFile(item.id)}
                  >
                    <XMarkIcon className="size-4" strokeWidth={1.8} aria-hidden="true" />
                  </button>
                </span>
              </div>
            )
          })}
        </div>
      )}
      <FilePreviewModal
        file={previewFile}
        open={previewFile !== null}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  )
}
