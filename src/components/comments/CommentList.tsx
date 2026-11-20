import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import { useLayoutEffect, useMemo, useRef } from 'react'
import { getInitials } from '../../auth/userDisplay'
import { formatDateTime, formatElapsed } from '../../utils/date'
import EmptyState from '../EmptyState'
import type { Comment, CommentCategory } from '../../types/comment/Comment'

type CommentListProps = {
  comments: readonly Comment[]
  emptyTitle?: string
  emptyDescription?: string
  /** Si se define, el botón "Responder" lo invoca con el comentario. */
  onReply?: (comment: Comment) => void
  hasMore?: boolean
  isLoadingMore?: boolean
  onLoadMore?: () => void
  loadMoreError?: string | null
  className?: string
}

const categoryStyles: Record<CommentCategory, string> = {
  'Aprobado con observaciones': 'bg-warning-soft text-warning',
  Rechazado: 'bg-danger-soft text-danger',
  'Visto bueno': 'bg-success-soft text-success',
}

const avatarTones = ['bg-primary', 'bg-warning', 'bg-body'] as const

function CommentItem({
  comment,
  onReply,
}: {
  comment: Comment
  onReply?: (comment: Comment) => void
}) {
  const tone = avatarTones[Math.abs(comment.author.id) % avatarTones.length]

  return (
    <article className="grid gap-3 border-b border-line-soft px-3.5 py-3 last:border-0 md:grid-cols-[minmax(0,1fr)_160px]">
      <div className="min-w-0">
        <span
          className={`inline-flex rounded px-1.5 py-1 text-[7px] font-semibold ${categoryStyles[comment.category]}`}
        >
          {comment.category}
        </span>
        <p className="mt-2 whitespace-pre-line text-[9px] leading-4 text-body">
          {comment.text}
        </p>
        {comment.documentName && (
          <small className="mt-1 block text-[8px] text-muted">
            Documento: {comment.documentName}
          </small>
        )}
        <button
          className="mt-2 border-0 bg-transparent p-0 text-[8px] font-semibold text-primary-strong hover:underline"
          type="button"
          onClick={() => onReply?.(comment)}
        >
          Responder
        </button>
      </div>
      <div className="flex items-start gap-2 md:justify-end">
        <span
          className={`grid size-7 shrink-0 place-items-center rounded-full text-[8px] font-bold text-white ${tone}`}
          aria-hidden="true"
        >
          {getInitials(comment.author.name)}
        </span>
        <span className="min-w-0">
          <strong className="block truncate text-[8px] font-semibold text-ink">
            {comment.author.name}
          </strong>
          <small className="block truncate text-[7px] text-muted">
            {comment.author.role}
          </small>
          <small className="mt-1 block text-[7px] text-muted">
            <time dateTime={comment.createdAt}>
              {formatDateTime(comment.createdAt)}
            </time>{' '}
            · {formatElapsed(comment.createdAt)}
          </small>
        </span>
      </div>
    </article>
  )
}

/**
 * Lista de comentarios en orden cronológico (el más antiguo arriba), con
 * usuario y fecha. Sin lógica de negocio: solo muestra lo que recibe.
 */
export default function CommentList({
  comments,
  emptyTitle = 'Aún no hay comentarios',
  emptyDescription = 'Cuando alguien publique una observación, aparecerá aquí en orden cronológico.',
  onReply,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  loadMoreError = null,
  className = '',
}: CommentListProps) {
  const sorted = useMemo(
    () =>
      [...comments].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    [comments],
  )
  const listRef = useRef<HTMLDivElement>(null)
  const latestCommentIdRef = useRef<string | null>(null)
  const previousScrollHeightRef = useRef<number | null>(null)

  useLayoutEffect(() => {
    const latestCommentId = sorted.at(-1)?.id ?? null
    const listElement = listRef.current

    if (listElement) {
      const previousScrollHeight = previousScrollHeightRef.current
      const latestCommentChanged = latestCommentId !== latestCommentIdRef.current

      if (previousScrollHeight === null || latestCommentChanged) {
        listElement.scrollTop = listElement.scrollHeight
      } else if (listElement.scrollHeight > previousScrollHeight) {
        listElement.scrollTop += listElement.scrollHeight - previousScrollHeight
      }

      previousScrollHeightRef.current = listElement.scrollHeight
    }

    latestCommentIdRef.current = latestCommentId
  }, [sorted])

  if (sorted.length === 0) {
    return (
      <EmptyState
        className={className}
        icon={<ChatBubbleLeftRightIcon className="size-6" strokeWidth={1.8} aria-hidden="true" />}
        title={emptyTitle}
        description={emptyDescription}
      />
    )
  }

  return (
    <div ref={listRef} className={className}>
      {(loadMoreError || (hasMore && onLoadMore)) && (
        <div className="sticky top-0 z-20 border-b border-line-soft bg-white px-3.5 py-2.5 shadow-[0_4px_10px_rgba(38,38,38,0.10)]">
          {loadMoreError && (
            <p className="mb-2 text-[9px] text-danger" role="alert">
              {loadMoreError}
            </p>
          )}
          {hasMore && onLoadMore && (
            <div className="text-center">
              <button
                className="rounded-md border border-line bg-white px-3 py-1.5 text-[9px] font-semibold text-primary-strong shadow-[0_1px_3px_rgba(38,38,38,0.08)] hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                disabled={isLoadingMore}
                onClick={onLoadMore}
              >
                {isLoadingMore ? 'Cargando…' : 'Cargar más comentarios'}
              </button>
            </div>
          )}
        </div>
      )}
      {sorted.map((comment) => (
        <CommentItem comment={comment} key={comment.id} onReply={onReply} />
      ))}
    </div>
  )
}
