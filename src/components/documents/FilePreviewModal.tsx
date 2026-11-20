import { useEffect, useState } from 'react'
import Modal from '../Modal'

type FilePreviewModalProps = {
  file: File | null
  open: boolean
  onClose: () => void
}

export default function FilePreviewModal({ file, open, onClose }: FilePreviewModalProps) {
  const [url, setUrl] = useState<string | null>(null)
  const isPdf = file?.type === 'application/pdf'
  const isImage = file?.type.startsWith('image/') ?? false

  useEffect(() => {
    if (!file || !open) {
      setUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [file, open])

  if (!file || !url || (!isPdf && !isImage)) {
    return null
  }

  return (
    <Modal
      open={open}
      title={file.name}
      description={`${file.type} · ${(file.size / (1024 * 1024)).toFixed(1)} MB`}
      onClose={onClose}
      size="wide"
      className="text-left"
      footer={
        <button
          className="h-[34px] rounded-md border border-line bg-white px-3 text-[10px] font-semibold text-body hover:bg-primary-soft"
          type="button"
          onClick={onClose}
        >
          Cerrar
        </button>
      }
    >
      <div className="mt-4 flex min-h-[320px] items-center justify-center overflow-hidden rounded-md border border-line bg-canvas p-3">
        {isPdf ? (
          <iframe className="h-[60vh] w-full border-0 bg-white" src={url} title={`Vista previa de ${file.name}`} />
        ) : (
          <img className="max-h-[60vh] max-w-full object-contain" src={url} alt={file.name} />
        )}
      </div>
    </Modal>
  )
}
