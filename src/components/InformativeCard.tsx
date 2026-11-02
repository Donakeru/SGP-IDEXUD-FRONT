import type { ReactNode } from 'react'

export type InformativeCardVariant = 'primary' | 'amber' | 'green' | 'slate'
export type InformativeTrendTone = 'success' | 'warning' | 'danger' | 'neutral'

export type InformativeCardData = {
  id: string
  value: string | number
  label: string
  icon: ReactNode
  variant?: InformativeCardVariant
  trend?: {
    label: string
    tone: InformativeTrendTone
  }
}

type InformativeCardProps = {
  cards: InformativeCardData[]
  className?: string
}

const iconStyles: Record<InformativeCardVariant, string> = {
  primary: 'bg-primary-soft text-primary-strong',
  amber: 'bg-warning-soft text-warning',
  green: 'bg-success-soft text-success',
  slate: 'bg-chip text-body',
}

const trendStyles: Record<InformativeTrendTone, string> = {
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  neutral: 'bg-chip text-body',
}

export default function InformativeCard({
  cards,
  className = '',
}: InformativeCardProps) {
  return (
    <section
      className={`grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4 ${className}`}
      aria-label="Resumen de indicadores"
    >
      {cards.map((card) => {
        const variant = card.variant ?? 'primary'

        return (
          <article
            className="flex min-h-[132px] flex-col rounded-lg border border-line bg-white p-4 shadow-[0_4px_14px_rgba(38,38,38,0.05)]"
            key={card.id}
            aria-label={`${card.value} ${card.label}`}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <span
                className={`grid size-[34px] place-items-center rounded-[7px] ${iconStyles[variant]}`}
                aria-hidden="true"
              >
                {card.icon}
              </span>
              {card.trend && (
                <span
                  className={`rounded px-1.5 py-1 text-[8px] font-semibold ${trendStyles[card.trend.tone]}`}
                >
                  {card.trend.label}
                </span>
              )}
            </div>
            <strong className="text-[25px] leading-[29px] tracking-[-0.03em] text-ink">
              {card.value}
            </strong>
            <span className="mt-0.5 text-[10px] text-muted">{card.label}</span>
          </article>
        )
      })}
    </section>
  )
}
