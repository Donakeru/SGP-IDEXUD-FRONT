import { PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { useId, useState, type FormEvent } from 'react'
import Button from '../Button'
import Select from '../forms/Select'
import TextArea from '../forms/TextArea'
import {
  COMMENT_CATEGORIES,
  type CommentCategory,
  type NewCommentInput,
} from '../../types/comment/Comment'

type CommentComposerProps = {
  /** Nombres de documentos para el selector "Documento relacionado". */
  documents?: readonly string[]
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
  const [documentName, setDocumentName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmitting || !text.trim()) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onSubmit({
        text: text.trim(),
        category,
        documentName: documentName || undefined,
      })
      setText('')
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
            value={documentName}
            disabled={isSubmitting}
            onChange={(event) => setDocumentName(event.target.value)}
          >
            <option value="">Ninguno</option>
            {documents.map((name) => (
              <option key={name} value={name}>
                {name}
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
  )
}
