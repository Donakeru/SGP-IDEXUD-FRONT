import ProposalsTable from '../../components/ProposalsTable'

export default function Proposal() {
  return (
    <div className="mx-auto w-full max-w-[1216px] px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
      <div className="mb-5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#667085]">
          Gestión de propuestas
        </span>
        <h1 className="mt-1 text-2xl font-semibold tracking-[-0.025em] text-[#172033]">
          Propuestas
        </h1>
      </div>
      <ProposalsTable />
    </div>
  )
}
