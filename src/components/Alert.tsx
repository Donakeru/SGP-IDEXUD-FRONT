import type { ReactNode } from 'react'

type AlertVariant = 'danger' | 'info' | 'success' | 'warning'

type AlertProps = {
  open: boolean
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  variant?: AlertVariant
  role?: 'alert' | 'status'
  className?: string
}

const variantStyles: Record<
  AlertVariant,
  { container: string; icon: string; title: string }
> = {
  success: {
    container: 'border-success-line',
    icon: 'bg-success-soft text-success',
    title: 'text-success',
  },
  danger: {
    container: 'border-danger-line',
    icon: 'bg-danger-soft text-danger',
    title: 'text-danger',
  },
  warning: {
    container: 'border-line',
    icon: 'bg-warning-soft text-warning',
    title: 'text-warning',
  },
  info: {
    container: 'border-line',
    icon: 'bg-primary-soft text-primary-strong',
    title: 'text-primary-strong',
  },
}

export default function Alert({
  open,
  title,
  description,
  icon,
  action,
  variant = 'info',
  role = 'status',
  className = '',
}: AlertProps) {
  if (!open) {
    return null
  }

  const styles = variantStyles[variant]

  return (
    <div
      className={`fixed bottom-5 right-5 z-40 flex w-[min(390px,calc(100vw-40px))] items-center gap-2.5 rounded-lg border bg-white p-3 shadow-[0_12px_32px_rgba(38,38,38,0.16)] ${styles.container} ${className}`}
      role={role}
      aria-live={role === 'alert' ? 'assertive' : 'polite'}
    >
      {icon && (
        <span className={`grid size-[34px] shrink-0 place-items-center rounded-full ${styles.icon}`}>
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <strong className={`text-[10px] font-semibold ${styles.title}`}>
          {title}
        </strong>
        {description && <p className="mt-0.5 text-[8px] text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
