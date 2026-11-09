import type { ReactNode } from 'react'

type EmptyStateProps = {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export default function EmptyState({
  title,
  description,
  icon,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center px-6 py-10 text-center ${className}`}
    >
      {icon && (
        <span className="mb-3 grid size-12 place-items-center rounded-full bg-primary-soft text-primary-strong">
          {icon}
        </span>
      )}
      <strong className="text-xs font-semibold text-ink">{title}</strong>
      {description && (
        <p className="mt-1.5 max-w-[340px] text-[10px] leading-4 text-muted">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
