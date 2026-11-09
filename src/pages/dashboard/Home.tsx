import { CheckIcon, ClockIcon, FolderIcon, ChatBubbleLeftIcon, PlusIcon } from '@heroicons/react/24/outline'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import InformativeCard, {
  type InformativeCardData,
} from '../../components/InformativeCard'
import ProposalsTable from '../../components/ProposalsTable'
import Can from '../../components/auth/Can'
import { getFirstName } from '../../auth/userDisplay'
import { useAuth } from '../../auth/useAuth'

type MetricIconName = 'folder' | 'clock' | 'check' | 'message'

const metricIcons: Record<MetricIconName, ReactNode> = {
  folder: <FolderIcon className="size-[18px]" strokeWidth={1.8} aria-hidden="true" />,
  clock: <ClockIcon className="size-[18px]" strokeWidth={1.8} aria-hidden="true" />,
  check: <CheckIcon className="size-[18px]" strokeWidth={1.8} aria-hidden="true" />,
  message: <ChatBubbleLeftIcon className="size-[18px]" strokeWidth={1.8} aria-hidden="true" />,
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

export default function Home() {
  const { user } = useAuth()
  const firstName = user ? getFirstName(user.nombre) : ''

  return (
    <div className="mx-auto w-full max-w-[1216px] px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
      <div className="mb-[22px] flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            Resumen general
          </span>
          <h1 className="mt-1 text-[25px] font-semibold leading-[33px] tracking-[-0.025em] text-ink">
            {firstName ? `Buenos días, ${firstName}` : 'Buenos días'}
          </h1>
          <p className="mt-1 text-xs text-muted">
            Este es el estado de las propuestas institucionales hoy.
          </p>
        </div>

        <Can capability="cargar_propuesta">
          <Link
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-[11px] font-semibold text-white shadow-[0_2px_4px_rgba(255,78,0,0.18)] transition-colors hover:bg-primary-hover"
            to="/dashboard/proposals/new"
          >
            <PlusIcon className="size-[17px]" strokeWidth={1.8} aria-hidden="true" />
            Nueva propuesta
          </Link>
        </Can>
      </div>

      <InformativeCard cards={informativeCards} className="mb-[14px]" />
      <ProposalsTable title="Propuestas recientes" />
    </div>
  )
}
