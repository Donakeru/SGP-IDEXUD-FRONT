import type { HistoryEvent } from '../types/proposal/ReviewProposal'

function removeReasonReference(text: string) {
  return text.replace(/\s*Motivo:\s*.*$/i, '').trim()
}

type ProposalHistoryProps = {
  history: HistoryEvent[]
  emptyMessage?: string
}

export default function ProposalHistory({
  history,
  emptyMessage = 'Esta propuesta no tiene historial de cambios.',
}: ProposalHistoryProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-line bg-white shadow-[0_4px_14px_rgba(38,38,38,0.05)]">
      <header className="border-b border-line-soft px-4 py-3">
        <h2 className="text-[13px] font-semibold leading-[19px] text-ink">
          Historial de cambio de estado
        </h2>
        <p className="mt-px text-[10px] leading-[14px] text-muted">
          Cambios registrados en la propuesta
        </p>
      </header>
´
      {history.length === 0 ? (
        <p className="px-4 py-6 text-center text-[11px] text-muted">{emptyMessage}</p>
      ) : (
        <div className="px-4 py-4">
          <ol className="relative ml-2 border-l border-line-soft">
            {[...history].reverse().map((event) => (
              <li
                className="relative pb-5 pl-5 last:pb-0"
                key={`${event.subject}-${event.date}-${event.author}-${event.text}`}
              >
                <span
                  className="absolute -left-[7px] top-1 size-3 rounded-full border-2 border-white bg-primary shadow-[0_0_0_1px_#ffd7c7]"
                  aria-hidden="true"
                />
                <div>
                  <strong className="block text-[9px] font-semibold text-primary-strong">
                    {removeReasonReference(event.text)}
                  </strong>
                  <p className="mt-1 text-[11px] leading-4 text-ink">
                    {event.subject}
                  </p>
                  <small className="mt-1 block text-[9px] text-muted">
                    {event.author} · {event.date}
                  </small>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  )
}
