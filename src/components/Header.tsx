type HeaderProps = {
  isSidebarOpen: boolean
  onMenuClick: () => void
}

function Brand() {
  return (
    <div
      className="flex w-auto shrink-0 items-center gap-3 lg:w-[276px]"
      aria-label="IDEXUD Universidad Distrital"
    >
      <div className="grid size-10 place-items-center rounded-lg bg-[#1f3a5f] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16)]">
        <span className="text-[13px] font-bold tracking-[-0.4px]">ID</span>
      </div>
      <div className="flex flex-col gap-px">
        <strong className="text-[15px] leading-[18px] tracking-[0.04em] text-[#1f3a5f]">
          SGP - IDEXUD
        </strong>
        <span className="text-[10px] uppercase leading-[14px] tracking-[0.04em] text-[#667085]">
          Universidad Distrital
        </span>
      </div>
    </div>
  )
}

function MenuIcon() {
  return (
    <svg
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
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
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
    </svg>
  )
}

export default function Header({
  isSidebarOpen,
  onMenuClick,
}: HeaderProps) {
  return (
    <header className="relative z-30 h-[72px] shrink-0 border-b border-[#dde2ea] bg-white">
      <div className="flex h-full items-center px-4 sm:px-6 lg:px-12">
        <button
          className="mr-3 grid size-9 shrink-0 place-items-center rounded-md border-0 bg-transparent text-[#1f3a5f] transition-colors hover:bg-[#f5f7fa] md:hidden"
          type="button"
          aria-label={isSidebarOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
          aria-controls="dashboard-sidebar"
          aria-expanded={isSidebarOpen}
          onClick={onMenuClick}
        >
          <MenuIcon />
        </button>

        <Brand />

        <div className="hidden flex-col border-l border-[#e9edf2] pl-6 md:flex">
          <span className="text-[10px] font-medium uppercase leading-[14px] tracking-[0.08em] text-[#667085]">
            Gestión institucional
          </span>
          <h1 className="text-[13px] font-semibold leading-[18px] text-[#172033]">
            Propuestas y convenios
          </h1>
        </div>

        <button
          className="ml-auto flex items-center gap-2.5 border-0 border-l border-[#e9edf2] bg-transparent py-1.5 pl-4 text-[#667085]"
          type="button"
          aria-label="Abrir menú de Mariana López"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#1f3a5f] text-xs font-bold text-white">
            ML
          </span>
          <span className="hidden min-w-[142px] flex-col text-left sm:flex">
            <strong className="text-[13px] leading-[18px] text-[#172033]">
              Mariana López
            </strong>
            <span className="text-[11px] leading-4 text-[#667085]">
              Coordinación IDEXUD
            </span>
          </span>
          <ChevronIcon />
        </button>
      </div>
    </header>
  )
}
