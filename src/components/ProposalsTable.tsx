import {
  AdjustmentsHorizontalIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Select from './forms/Select'
import { getProposals } from '../services/proposalService'
import type { ProposalListItem } from '../types/proposal/ProposalListItem'

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20] as const
const DEFAULT_PAGE_SIZE = 5

const statusStyles: Record<string, string> = {
  Registrado: 'bg-primary-soft text-primary-strong',
  'En comité': 'bg-primary-soft text-primary-strong',
  'En revisión': 'bg-warning-soft text-warning',
  Aprobada: 'bg-success-soft text-success',
  Borrador: 'bg-chip text-body',
  Rechazada: 'bg-danger-soft text-danger',
}

function ProposalStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex w-max items-center gap-[5px] rounded-full px-2 py-1 text-[8px] font-semibold ${statusStyles[status] ?? 'bg-chip text-body'}`}
    >
      <span className="size-[5px] rounded-full bg-current" />
      {status}
    </span>
  )
}

function formatProposalDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function matchesQuery(proposal: ProposalListItem, query: string) {
  return `${proposal.id_propuesta} ${proposal.nombre} ${proposal.estado} ${proposal.nombre_postulante}`
    .toLowerCase()
    .includes(query)
}

type ProposalsTableProps = {
  title?: string
}

export default function ProposalsTable({
  title = 'Todas las propuestas',
}: ProposalsTableProps) {
  const navigate = useNavigate()
  const [proposals, setProposals] = useState<ProposalListItem[]>([])
  const [total, setTotal] = useState(0)
  const [nextOffset, setNextOffset] = useState(0)
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE)
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    const loadInitialProposals = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await getProposals(0, limit, controller.signal)

        if (controller.signal.aborted) {
          return
        }

        setProposals(response.items)
        setTotal(response.total)
        setNextOffset(response.offset + response.items.length)
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'No fue posible cargar las propuestas.',
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadInitialProposals()

    setProposals([])
    setTotal(0)
    setNextOffset(0)
    setQuery('')

    return () => controller.abort()
  }, [limit])

  const visibleProposals = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return proposals
    }

    return proposals.filter((proposal) => matchesQuery(proposal, normalizedQuery))
  }, [proposals, query])

  const hasMore = nextOffset < total

  const loadMore = async () => {
    if (isLoading || isLoadingMore || !hasMore) {
      return
    }

    setIsLoadingMore(true)
    setError(null)

    try {
      const response = await getProposals(nextOffset, limit)

      setProposals((current) => [...current, ...response.items])
      setTotal(response.total)
      setNextOffset(response.offset + response.items.length)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No fue posible cargar más propuestas.',
      )
    } finally {
      setIsLoadingMore(false)
    }
  }

  return (
    <section className="overflow-hidden rounded-lg border border-line bg-white shadow-[0_4px_14px_rgba(38,38,38,0.05)]">
      <header className="flex min-h-[62px] flex-wrap items-center justify-between gap-3 border-b border-line-soft px-4 py-3">
        <div>
          <h2 className="text-[13px] font-semibold leading-[19px] text-ink">
            {title}
          </h2>
          <p className="mt-px text-[9px] leading-[14px] text-muted">
            {visibleProposals.length} resultados visibles de {total}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex h-[34px] w-[210px] items-center gap-[7px] rounded-md border border-line bg-white px-[9px] text-muted focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
            <span className="sr-only">Buscar propuesta</span>
            <MagnifyingGlassIcon className="size-[17px] shrink-0" strokeWidth={1.8} aria-hidden="true" />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent text-[10px] text-ink outline-none placeholder:text-muted"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar propuesta…"
            />
          </label>
          <button
            className="inline-flex h-[34px] items-center gap-1.5 rounded-md border border-line bg-white px-2.5 text-[10px] font-semibold text-body transition-colors hover:bg-primary-soft hover:text-primary-strong"
            type="button"
          >
            <AdjustmentsHorizontalIcon className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
            Filtrar
          </button>
        </div>
      </header>

      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid min-h-[34px] grid-cols-[minmax(330px,2.2fr)_126px_minmax(180px,1fr)_142px_20px] items-center gap-x-3 border-b border-line-soft bg-canvas px-4 text-[8px] font-bold uppercase tracking-[0.06em] text-muted">
            <span>Propuesta</span>
            <span>Estado</span>
            <span>Postulante</span>
            <span>Fecha de registro</span>
            <span />
          </div>

          {isLoading && (
            <div className="px-4 py-10 text-center text-xs text-muted">
              Cargando propuestas…
            </div>
          )}

          {!isLoading && error && (
            <div className="border-b border-danger-line bg-danger-subtle px-4 py-4 text-center text-[10px] text-danger" role="alert">
              {error}
            </div>
          )}

          {!isLoading && !error && visibleProposals.map((proposal) => (
            <div
              className="grid min-h-[68px] cursor-pointer grid-cols-[minmax(330px,2.2fr)_126px_minmax(180px,1fr)_142px_20px] items-center gap-x-3 border-b border-line-soft bg-white px-4 text-left transition-colors last:border-0 hover:bg-canvas focus:bg-canvas focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/30"
              key={proposal.id_propuesta}
              role="button"
              tabIndex={0}
              aria-label={`Abrir detalle de ${proposal.nombre}`}
              onClick={() => navigate(`/dashboard/proposals/detail?id=${proposal.id_propuesta}`)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  navigate(`/dashboard/proposals/detail?id=${proposal.id_propuesta}`)
                }
              }}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid size-[30px] shrink-0 place-items-center rounded-md bg-primary-soft text-primary-strong">
                  <DocumentTextIcon className="size-[18px]" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                  <strong className="overflow-hidden text-ellipsis whitespace-nowrap text-[10px] leading-[15px] text-ink">
                    {proposal.nombre}
                  </strong>
                  <small className="overflow-hidden text-ellipsis whitespace-nowrap text-[8px] leading-[13px] text-muted">
                    ID {proposal.id_propuesta}
                  </small>
                </span>
              </div>

              <ProposalStatusBadge status={proposal.estado} />

              <span className="truncate text-[9px] text-body">
                {proposal.nombre_postulante}
              </span>

              <span className="text-[9px] text-muted">
                {formatProposalDate(proposal.created_at)}
              </span>

              <span className="text-muted">
                <ChevronRightIcon className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
              </span>
            </div>
          ))}

          {!isLoading && !error && visibleProposals.length === 0 && (
            <div className="px-4 py-10 text-center text-xs text-muted">
              No se encontraron propuestas.
            </div>
          )}
        </div>
      </div>

      <footer className="flex min-h-[42px] flex-wrap items-center justify-between gap-3 border-t border-line-soft bg-canvas px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="text-[8px] text-muted">
            Mostrando {visibleProposals.length} de {total} propuestas
          </span>
          <label className="flex items-center gap-1.5 text-[8px] text-muted">
            <span>Por página</span>
            <Select
              aria-label="Cantidad de propuestas por página"
              className="h-7 !min-h-[28px] w-[54px] px-2 text-[9px]"
              value={limit}
              onChange={(event) => setLimit(Number(event.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </label>
        </div>
        {hasMore && (
          <button
            className="inline-flex items-center gap-[3px] border-0 bg-transparent text-[8px] font-semibold text-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            disabled={isLoading || isLoadingMore}
            onClick={loadMore}
          >
            {isLoadingMore ? 'Cargando…' : 'Cargar más'}
            <ChevronRightIcon className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
          </button>
        )}
      </footer>
    </section>
  )
}
