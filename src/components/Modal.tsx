import { useEffect, useId, type ReactNode } from 'react'

type ModalProps = {
  open: boolean
  title: string
  description?: string
  icon?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  onClose?: () => void
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  className?: string
}

export default function Modal({
  open,
  title,
  description,
  icon,
  children,
  footer,
  onClose,
  closeOnOverlayClick = false,
  closeOnEscape = true,
  className = '',
}: ModalProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open || !onClose || !closeOnEscape) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeOnEscape, onClose, open])

  if (!open) {
    return null
  }

  const handleOverlayMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose?.()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={handleOverlayMouseDown}
    >
      <div
        className={`w-full max-w-[420px] rounded-lg bg-white p-6 text-center shadow-[0_18px_48px_rgba(38,38,38,0.22)] ${className}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {icon && (
          <span className="mx-auto mb-3.5 grid size-[46px] place-items-center rounded-full bg-primary-soft text-primary-strong">
            {icon}
          </span>
        )}
        <h2 id={titleId} className="text-[17px] font-semibold leading-6 text-ink">
          {title}
        </h2>
        {description && (
          <p className="mx-auto mt-2 max-w-[340px] text-[10px] leading-4 text-muted">
            {description}
          </p>
        )}
        {children}
        {footer && <div className="mt-5 flex justify-center gap-2">{footer}</div>}
      </div>
    </div>
  )
}
