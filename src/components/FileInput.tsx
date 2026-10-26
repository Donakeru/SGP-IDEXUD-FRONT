import { useRef, useState } from 'react'

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

const DEFAULT_ACCEPT = '.pdf,.docx,.xlsx'
const DEFAULT_FORMATS_LABEL = 'PDF, DOCX o XLSX'

function UploadIcon() {
  return (
    <svg
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path strokeLinecap="round" d="M12 17V3M7 8l5-5 5 5" />
      <path strokeLinecap="round" d="M5 21h14" />
    </svg>
  )
}

function FileIcon() {
  return (
    <svg
      className="size-[19px]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 2h8l4 4v16H6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v5h5M9 13h6m-6 4h6" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg
      className="size-[17px]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 2 21h20z" />
      <path strokeLinecap="round" d="M12 9v5m0 3h.01" />
    </svg>
  )
}

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
  maxSizeMb = 20,
  multiple = true,
  onFilesChange,
  onUploadError,
  uploadProgress = 0,
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [items, setItems] = useState<FileItem[]>([])

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
        className={`flex min-h-[100px] cursor-pointer items-center justify-center gap-[11px] rounded-lg border-[1.5px] border-dashed px-3.5 text-left text-[#1f3a5f] transition-colors ${
          isDragging
            ? 'border-[#1f3a5f] bg-[#edf3f9]'
            : 'border-[#9eabc0] bg-[#f8fafc] hover:border-[#1f3a5f] hover:bg-[#edf3f9]'
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
        <span className="grid size-9 shrink-0 place-items-center rounded-full border border-[#dde2ea] bg-white text-[#1f3a5f]">
          <UploadIcon />
        </span>
        <span className="flex flex-col gap-1">
          <strong className="text-[10px] font-semibold text-[#1f3a5f]">
            {isUploading ? `Cargando archivos… ${normalizedProgress}%` : 'Arrastra archivos o haz clic para cargar'}
          </strong>
          <small className="text-[8px] text-[#667085]">
            {acceptedFormatsLabel} · Máximo {maxSizeMb} MB por archivo
          </small>
          {isUploading && (
            <span className="mt-1 h-1 w-full max-w-[220px] overflow-hidden rounded-full bg-[#dbe3ec]">
              <span
                className="block h-full rounded-full bg-[#1f3a5f] transition-[width] duration-200"
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
                    ? 'border-[#efcaca] bg-[#fffafa]'
                    : 'border-[#dde2ea] bg-white'
                }`}
                key={item.id}
              >
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-md ${
                    hasError
                      ? 'bg-[#fdecec] text-[#a33a3a]'
                      : 'bg-[#edf3f9] text-[#1f3a5f]'
                  }`}
                >
                  {hasError ? <WarningIcon /> : <FileIcon />}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <strong className="overflow-hidden text-ellipsis whitespace-nowrap text-[9px] text-[#172033]">
                    {item.file.name}
                  </strong>
                  <small
                    className={`text-[8px] ${
                      hasError ? 'text-[#a33a3a]' : 'text-[#667085]'
                    }`}
                  >
                    {hasError
                      ? item.error
                      : `${formatFileType(item.file)} · ${formatFileSize(item.file.size)}${isUploading ? ` · Cargando ${normalizedProgress}%` : ''}`}
                  </small>
                  {!hasError && isUploading && (
                    <span className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[#e7ebf0]">
                      <span
                        className="block h-full rounded-full bg-[#1f3a5f] transition-[width] duration-200"
                        style={{ width: `${normalizedProgress}%` }}
                      />
                    </span>
                  )}
                </span>
                <button
                  className={`shrink-0 border-0 bg-transparent p-1 text-[8px] font-semibold hover:underline ${
                    hasError ? 'text-[#a33a3a]' : 'text-[#1f3a5f]'
                  }`}
                  type="button"
                  onClick={() => removeFile(item.id)}
                >
                  {hasError ? 'Quitar' : 'Eliminar'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
