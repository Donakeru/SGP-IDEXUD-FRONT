import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import InformativeCard, {
  type InformativeCardData,
} from '../../components/InformativeCard'
import ProposalsTable from '../../components/ProposalsTable'

type MetricIconName = 'folder' | 'clock' | 'check' | 'message'

const metricIcons: Record<MetricIconName, ReactNode> = {
  folder: (
    <svg
      className="size-[18px]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z"
      />
    </svg>
  ),
  clock: (
    <svg
      className="size-[18px]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path strokeLinecap="round" d="M12 7v5l3 2" />
    </svg>
  ),
  check: (
    <svg
      className="size-[18px]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" />
    </svg>
  ),
  message: (
    <svg
      className="size-[18px]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18 3 21v-9a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8v1a8 8 0 0 1-8 8H6Z"
      />
    </svg>
  ),
}

const informativeCards: InformativeCardData[] = [
  {
    id: 'active-proposals',
    value: 24,
    label: 'Propuestas activas',
    icon: metricIcons.folder,
    variant: 'primary',
    trend: { label: '+3 este mes', tone: 'success' },
  },
  {
    id: 'in-review',
    value: 9,
    label: 'En revisión',
    icon: metricIcons.clock,
    variant: 'amber',
    trend: { label: '6 por atender', tone: 'warning' },
  },
  {
    id: 'approved',
    value: 18,
    label: 'Aprobadas en 2026',
    icon: metricIcons.check,
    variant: 'green',
    trend: { label: '78% del total', tone: 'success' },
  },
  {
    id: 'pending-comments',
    value: 7,
    label: 'Comentarios pendientes',
    icon: metricIcons.message,
    variant: 'slate',
    trend: { label: '2 urgentes', tone: 'danger' },
  },
]

function PlusIcon() {
  return (
    <svg
      className="size-[17px]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
  )
}

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-[1216px] px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
      <div className="mb-[22px] flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#667085]">
            Resumen general
          </span>
          <h1 className="mt-1 text-[25px] font-semibold leading-[33px] tracking-[-0.025em] text-[#172033]">
            Buenos días, Mariana
          </h1>
          <p className="mt-1 text-xs text-[#667085]">
            Este es el estado de las propuestas institucionales hoy.
          </p>
        </div>

        <Link
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#1f3a5f] px-4 text-[11px] font-semibold text-white shadow-[0_2px_4px_rgba(31,58,95,0.18)] transition-colors hover:bg-[#172e4d]"
          to="/dashboard/proposals/new"
        >
          <PlusIcon />
          Nueva propuesta
        </Link>
      </div>

      <InformativeCard cards={informativeCards} className="mb-[14px]" />
      <ProposalsTable title="Propuestas recientes" />
    </div>
  )
}
