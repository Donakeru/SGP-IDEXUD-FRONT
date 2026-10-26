import { useMemo, useState } from 'react'

type ProposalStatus = 'En comité' | 'En revisión' | 'Aprobada' | 'Borrador'

type Proposal = {
  id: string
  title: string
  entity: string
  date: string
  status: ProposalStatus
  progress: number
  owner: string
  initials: string
}

const proposals: Proposal[] = [
  {
    id: 'PROP-2026-014',
    title: 'Convenio de capacitación para el trabajo',
    entity: 'Fundación para el Desarrollo Social',
    date: '02 oct 2026',
    status: 'En comité',
    progress: 76,
    owner: 'Equipo técnico',
    initials: 'ET',
  },
  {
    id: 'PROP-2026-013',
    title: 'Diplomado en gestión pública territorial',
    entity: 'Alcaldía Local de Suba',
    date: '29 sep 2026',
    status: 'En revisión',
    progress: 52,
    owner: 'Laura Gómez',
    initials: 'LG',
  },
  {
    id: 'PROP-2026-012',
    title: 'Laboratorio de innovación educativa',
    entity: 'Secretaría de Educación',
    date: '24 sep 2026',
    status: 'Aprobada',
    progress: 100,
    owner: 'Ana Torres',
    initials: 'AT',
  },
  {
    id: 'PROP-2026-011',
    title: 'Fortalecimiento de capacidades digitales',
    entity: 'Caja de Compensación Familiar',
    date: '18 sep 2026',
    status: 'Borrador',
    progress: 28,
    owner: 'Carlos Ruiz',
    initials: 'CR',
  },
  {
    id: 'PROP-2026-010',
    title: 'Escuela de liderazgo comunitario',
    entity: 'Instituto Distrital de Participación',
    date: '12 sep 2026',
    status: 'En revisión',
    progress: 64,
    owner: 'Equipo social',
    initials: 'ES',
  },
  {
    id: 'PROP-2026-009',
    title: 'Formación en analítica de datos',
    entity: 'Empresa de Acueducto de Bogotá',
    date: '05 sep 2026',
    status: 'Aprobada',
    progress: 100,
    owner: 'Equipo técnico',
    initials: 'ET',
  },
]

const statusStyles: Record<ProposalStatus, string> = {
  'En comité': 'bg-[#edf3f9] text-[#1f3a5f]',
  'En revisión': 'bg-[#fff4dc] text-[#8a5800]',
  Aprobada: 'bg-[#eaf7f0] text-[#176b47]',
  Borrador: 'bg-[#edf0f4] text-[#647085]',
}

function FileIcon() {
  return (
    <svg
      className="size-[18px]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 2h8l4 4v16H6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v5h5M9 13h6m-6 4h6" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg
      className="size-[17px] shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="m20 20-4-4" />
    </svg>
  )
}

function FilterIcon() {
  return (
    <svg
      className="size-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path strokeLinecap="round" d="M4 6h16M7 12h10m-7 6h4" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg
      className="size-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
    </svg>
  )
}

function ProposalStatusBadge({ status }: { status: ProposalStatus }) {
  return (
    <span
      className={`inline-flex w-max items-center gap-[5px] rounded-full px-2 py-1 text-[8px] font-semibold ${statusStyles[status]}`}
    >
      <span className="size-[5px] rounded-full bg-current" />
      {status}
    </span>
  )
}

type ProposalsTableProps = {
  title?: string
}

export default function ProposalsTable({
  title = 'Todas las propuestas',
}: ProposalsTableProps) {
  const [query, setQuery] = useState('')
  const visibleProposals = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return proposals
    }

    return proposals.filter((proposal) =>
      `${proposal.id} ${proposal.title} ${proposal.entity}`
        .toLowerCase()
        .includes(normalizedQuery),
    )
  }, [query])

  return (
    <section className="overflow-hidden rounded-lg border border-[#dde2ea] bg-white shadow-[0_4px_14px_rgba(23,32,51,0.05)]">
      <header className="flex min-h-[62px] flex-wrap items-center justify-between gap-3 border-b border-[#e9edf2] px-4 py-3">
        <div>
          <h2 className="text-[13px] font-semibold leading-[19px] text-[#172033]">
            {title}
          </h2>
          <p className="mt-px text-[9px] leading-[14px] text-[#667085]">
            {visibleProposals.length} resultados disponibles
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex h-[34px] w-[210px] items-center gap-[7px] rounded-md border border-[#dde2ea] bg-white px-[9px] text-[#667085] focus-within:border-[#1f3a5f] focus-within:ring-4 focus-within:ring-[#1f3a5f]/10">
            <span className="sr-only">Buscar propuesta</span>
            <SearchIcon />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent text-[10px] text-[#172033] outline-none placeholder:text-[#9aa3b2]"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar propuesta…"
            />
          </label>
          <button
            className="inline-flex h-[34px] items-center gap-1.5 rounded-md border border-[#dde2ea] bg-white px-2.5 text-[10px] font-semibold text-[#4f5d72] transition-colors hover:bg-[#edf3f9] hover:text-[#1f3a5f]"
            type="button"
          >
            <FilterIcon />
            Filtrar
          </button>
        </div>
      </header>

      <div className="overflow-x-auto">
        <div className="min-w-[860px]">
          <div className="grid min-h-[34px] grid-cols-[minmax(330px,2.2fr)_126px_130px_142px_82px_20px] items-center gap-x-3 border-b border-[#e9edf2] bg-[#f8f9fb] px-4 text-[8px] font-bold uppercase tracking-[0.06em] text-[#8a94a6]">
            <span>Propuesta</span>
            <span>Estado</span>
            <span>Avance</span>
            <span>Responsable</span>
            <span>Radicación</span>
            <span />
          </div>

          {visibleProposals.map((proposal) => (
            <div
              className="grid min-h-[68px] grid-cols-[minmax(330px,2.2fr)_126px_130px_142px_82px_20px] items-center gap-x-3 border-b border-[#e9edf2] bg-white px-4 text-left transition-colors last:border-0 hover:bg-[#fafbfd]"
              key={proposal.id}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid size-[30px] shrink-0 place-items-center rounded-md bg-[#edf3f9] text-[#1f3a5f]">
                  <FileIcon />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                  <strong className="overflow-hidden text-ellipsis whitespace-nowrap text-[10px] leading-[15px] text-[#172033]">
                    {proposal.title}
                  </strong>
                  <small className="overflow-hidden text-ellipsis whitespace-nowrap text-[8px] leading-[13px] text-[#667085]">
                    {proposal.id} · {proposal.entity}
                  </small>
                </span>
              </div>

              <ProposalStatusBadge status={proposal.status} />

              <div className="flex items-center gap-[7px]">
                <span className="h-[5px] w-[78px] overflow-hidden rounded-[3px] bg-[#e7ebf0]">
                  <span
                    className="block h-full rounded-[3px] bg-[#1f3a5f]"
                    style={{ width: `${proposal.progress}%` }}
                  />
                </span>
                <small className="text-[8px] text-[#667085]">
                  {proposal.progress}%
                </small>
              </div>

              <div className="flex items-center gap-[7px] text-[9px] text-[#4e5a6d]">
                <span className="grid size-[26px] shrink-0 place-items-center rounded-full bg-[#1f3a5f] text-[8px] font-bold text-white">
                  {proposal.initials}
                </span>
                <span className="truncate">{proposal.owner}</span>
              </div>

              <span className="text-[9px] text-[#667085]">{proposal.date}</span>

              <span className="text-[#8e98a8]">
                <ChevronIcon />
              </span>
            </div>
          ))}

          {visibleProposals.length === 0 && (
            <div className="px-4 py-10 text-center text-xs text-[#667085]">
              No se encontraron propuestas.
            </div>
          )}
        </div>
      </div>

      <footer className="flex min-h-[42px] items-center justify-between border-t border-[#e9edf2] bg-[#fbfcfd] px-4">
        <span className="text-[8px] text-[#667085]">
          Mostrando {visibleProposals.length} de 24 propuestas
        </span>
        <button
          className="inline-flex items-center gap-[3px] border-0 bg-transparent text-[8px] font-semibold text-[#1f3a5f]"
          type="button"
        >
          Ver todas las propuestas
          <ChevronIcon />
        </button>
      </footer>
    </section>
  )
}
