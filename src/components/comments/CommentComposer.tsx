import { PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { useId, useState, type FormEvent } from 'react'
import Button from '../Button'
import Modal from '../Modal'
import Select from '../forms/Select'
import TextArea from '../forms/TextArea'
import {
  COMMENT_CATEGORIES,
  type CommentCategory,
  type CommentDocumentOption,
  type NewCommentInput,
} from '../../types/comment/Comment'

type CommentComposerProps = {
  /** Documentos para el selector "Documento relacionado" (`uuid` = `uuid_archivo`). */
  documents?: readonly CommentDocumentOption[]
  /**
   * Publica el comentario. Si la promesa se rechaza, el composer conserva lo
   * escrito y muestra el mensaje del error.
   */
  onSubmit: (input: NewCommentInput) => Promise<void> | void
  className?: string
}

/**
 * Caja para escribir un comentario. No conoce al usuario ni el servicio: solo
 * recoge texto, categoría y documento y llama a `onSubmit`. Quien lo use
 * decide si se muestra (por ejemplo con `<Can capability="comentar">`).
 */
export default function CommentComposer({
  documents = [],
  onSubmit,
  className = 'border-t border-line-soft p-3.5',
}: CommentComposerProps) {
  const textId = useId()
  const errorId = `${textId}-error`
  const [text, setText] = useState('')
  const [category, setCategory] = useState<CommentCategory>('Visto bueno')
  const [documentUuid, setDocumentUuid] = useState('')
  const [pendingInput, setPendingInput] = useState<NewCommentInput | null>(null)
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmitting || !text.trim()) {
      return
    }

    const selectedDocument = documents.find((document) => document.uuid === documentUuid)

    setError(null)
    setPendingInput({
      text: text.trim(),
      category,
      documentName: selectedDocument?.name,
      documentUuid: selectedDocument?.uuid,
    })
    setIsConfirmationOpen(true)
  }

  const cancelConfirmation = () => {
    if (isSubmitting) {
      return
    }

    setIsConfirmationOpen(false)
    setPendingInput(null)
    setError(null)
  }

  const confirmSubmission = async () => {
    if (!pendingInput || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onSubmit(pendingInput)
      setText('')
      setIsConfirmationOpen(false)
      setPendingInput(null)
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'No fue posible publicar el comentario.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <form className={className} onSubmit={handleSubmit} noValidate>
        <label className="text-[10px] font-semibold text-ink" htmlFor={textId}>
          Nuevo comentario
        </label>
        <TextArea
          id={textId}
          className="mt-2 !min-h-[72px] !text-[9px]"
          value={text}
          disabled={isSubmitting}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => setText(event.target.value)}
          placeholder="Escribe una observación clara para el equipo…"
        />
        <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto] sm:items-end">
          <label className="flex flex-col gap-1">
            <span className="text-[7px] font-semibold text-muted">Categoría</span>
            <Select
              className="!min-h-[30px] h-[30px] px-2 text-[8px]"
              value={category}
              disabled={isSubmitting}
              onChange={(event) => setCategory(event.target.value as CommentCategory)}
            >
              {COMMENT_CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[7px] font-semibold text-muted">
              Documento relacionado (opcional)
            </span>
            <Select
              className="!min-h-[30px] h-[30px] px-2 text-[8px]"
              value={documentUuid}
              disabled={isSubmitting}
              onChange={(event) => setDocumentUuid(event.target.value)}
            >
              <option value="">Ninguno</option>
              {documents.map((document) => (
                <option key={document.uuid} value={document.uuid}>
                  {document.name}
                </option>
              ))}
            </Select>
          </label>
          <Button
            className="!h-[30px] !px-3 !text-[8px]"
            type="submit"
            icon={<PaperAirplaneIcon className="size-3.5" strokeWidth={1.8} aria-hidden="true" />}
            disabled={!text.trim()}
            isLoading={isSubmitting}
            loadingText="Publicando…"
          >
            Publicar comentario
          </Button>
        </div>
        {error && (
          <p id={errorId} className="mt-2 text-[9px] text-danger" role="alert">
            {error}
          </p>
        )}
      </form>

      <Modal
        open={isConfirmationOpen}
        title="¿Publicar comentario?"
        description="El comentario se agregará al historial de la propuesta."
        icon={<PaperAirplaneIcon className="size-4" strokeWidth={1.8} aria-hidden="true" />}
        onClose={isSubmitting ? undefined : cancelConfirmation}
        footer={
          <>
            <button
              className="h-[38px] rounded-md border border-line bg-white px-3.5 text-[10px] font-semibold text-body hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              disabled={isSubmitting}
              onClick={cancelConfirmation}
            >
              Cancelar
            </button>
            <button
              className="h-[38px] rounded-md bg-primary px-3.5 text-[10px] font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              disabled={isSubmitting}
              onClick={() => void confirmSubmission()}
            >
              {isSubmitting ? 'Publicando…' : 'Sí, publicar comentario'}
            </button>
          </>
        }
      >
        {pendingInput && (
          <div className="mt-4 rounded-md border border-line-soft bg-canvas p-3 text-left">
            <p className="whitespace-pre-line text-[10px] leading-4 text-body">
              {pendingInput.text}
            </p>
            <p className="mt-2 text-[8px] text-muted">
              Categoría: {pendingInput.category}
              {pendingInput.documentName ? ` · Documento: ${pendingInput.documentName}` : ''}
            </p>
          </div>
        )}
        {error && (
          <p className="mt-3 rounded-md border border-danger-line bg-danger-subtle px-3 py-2 text-left text-[9px] leading-4 text-danger" role="alert">
            {error}
          </p>
        )}
      </Modal>
    </>
  )
}
