import { Bars3Icon } from '@heroicons/react/24/outline'
import logo from '../assets/logo_idexud.png'
import UserMenu from './UserMenu'

type HeaderProps = {
  isSidebarOpen: boolean
  onMenuClick: () => void
}

function Brand() {
  return (
    <div
      className="flex w-auto shrink-0 items-center lg:w-[276px]"
      aria-label="IDEXUD Universidad Distrital"
    >
      <img
        src={logo}
        alt="IDEXUD Universidad Distrital"
        className="h-10 w-auto max-w-[190px] object-contain"
        decoding="async"
      />
    </div>
  )
}

export default function Header({
  isSidebarOpen,
  onMenuClick,
}: HeaderProps) {
  return (
    <header className="relative z-30 h-[72px] shrink-0 border-b border-line bg-white">
      <div className="flex h-full items-center px-4 sm:px-6 lg:px-12">
        <button
          className="mr-3 grid size-9 shrink-0 place-items-center rounded-md border-0 bg-transparent text-primary-strong transition-colors hover:bg-wash md:hidden"
          type="button"
          aria-label={isSidebarOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
          aria-controls="dashboard-sidebar"
          aria-expanded={isSidebarOpen}
          onClick={onMenuClick}
        >
          <Bars3Icon className="size-5" strokeWidth={1.8} aria-hidden="true" />
        </button>

        <Brand />

        <div className="hidden flex-col border-l border-line-soft pl-6 md:flex">
          <span className="text-[10px] font-medium uppercase leading-[14px] tracking-[0.08em] text-muted">
            Gestión institucional
          </span>
          <h1 className="text-[13px] font-semibold leading-[18px] text-ink">
            Propuestas y convenios
          </h1>
        </div>

        <UserMenu />
      </div>
    </header>
  )
}
