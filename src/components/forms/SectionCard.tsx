import type { ReactNode } from 'react'

type SectionCardProps = {
  number: number
  title: string
  description: string
  children: ReactNode
}

export default function SectionCard({
  number,
  title,
  description,
  children,
}: SectionCardProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-line bg-white shadow-[0_4px_14px_rgba(38,38,38,0.05)]">
      <header className="flex min-h-[68px] items-center gap-3 border-b border-line-soft px-4 py-3.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary-strong">
          {number}
        </span>
        <div>
          <h2 className="text-[13px] font-semibold leading-[19px] text-ink">
            {title}
          </h2>
          <p className="mt-px text-[9px] leading-[14px] text-muted">
            {description}
          </p>
        </div>
      </header>
      <div className="grid gap-4 p-4 md:grid-cols-2">{children}</div>
    </section>
  )
}
