import type { ReactNode } from 'react'

export type StatusTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral'

type StatusBadgeProps = {
  children: ReactNode
  tone?: StatusTone
  /** `sm` = 8 px (tablas), `md` = 9 px (paneles). */
  size?: 'sm' | 'md'
  className?: string
}

const toneStyles: Record<StatusTone, string> = {
  primary: 'bg-primary-soft text-primary-strong',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  neutral: 'bg-chip text-body',
}

export default function StatusBadge({
  children,
  tone = 'neutral',
  size = 'md',
  className = '',
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex w-max items-center gap-[5px] rounded-full px-2 py-1 font-semibold ${
        size === 'sm' ? 'text-[8px]' : 'text-[9px]'
      } ${toneStyles[tone]} ${className}`}
    >
      <span className="size-[5px] rounded-full bg-current" />
      {children}
    </span>
  )
}
