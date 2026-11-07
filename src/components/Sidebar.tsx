import {
  BuildingOffice2Icon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  Cog6ToothIcon,
  FolderIcon,
  Squares2X2Icon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { useLocation, useNavigate } from 'react-router-dom'

type SidebarIconName =
  | 'dashboard'
  | 'folder'
  | 'review'
  | 'users'
  | 'report'
  | 'building'
  | 'settings'

type SidebarItem = {
  label: string
  icon: SidebarIconName
  badge?: string
  path?: string
}

type SidebarProps = {
  isOpen: boolean
  onClose: () => void
}

const principalItems: SidebarItem[] = [
  { label: 'Inicio', icon: 'dashboard', path: '/dashboard' },
  {
    label: 'Propuestas',
    icon: 'folder',
    badge: '24',
    path: '/dashboard/proposals',
  },
  { label: 'Revisión', icon: 'review', path: '/dashboard/review' },
  // Labels temporales del mockup (depronto se usan despues)
  //{ label: 'Comités', icon: 'users', badge: '4' },
  //{ label: 'Reportes', icon: 'report' },
]

const administrationItems: SidebarItem[] = [
  //Label temporal quizas posible uso
  //{ label: 'Entidades', icon: 'building' },
  { label: 'Usuarios y roles', icon: 'users' },
  { label: 'Configuración', icon: 'settings' },
]

const iconComponents = {
  dashboard: Squares2X2Icon,
  folder: FolderIcon,
  review: ClipboardDocumentCheckIcon,
  users: UserGroupIcon,
  report: ChartBarIcon,
  building: BuildingOffice2Icon,
  settings: Cog6ToothIcon,
}

function SidebarIcon({ name }: { name: SidebarIconName }) {
  const Icon = iconComponents[name]

  return (
    <Icon
      className="size-[18px] shrink-0"
      strokeWidth={1.8}
      aria-hidden="true"
    />
  )
}

function SidebarGroup({
  items,
  label,
  activeLabel,
  onItemClick,
}: {
  items: SidebarItem[]
  label: string
  activeLabel: string
  onItemClick: (path?: string) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="px-2.5 pb-1.5 text-[9px] font-bold uppercase tracking-[0.09em] text-muted">
        {label}
      </span>
      {items.map((item) => {
        const isActive = item.label === activeLabel

        return (
          <button
            className={`relative flex h-[42px] w-full items-center gap-[11px] rounded-[7px] border-0 px-[11px] text-left text-xs font-medium transition-colors hover:bg-wash hover:text-primary-strong ${
              isActive
                ? 'font-semibold text-primary-strong before:absolute before:left-0 before:h-6 before:w-[3px] before:rounded-r-[3px] before:bg-primary'
                : 'text-body'
            }`}
            key={item.label}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onItemClick(item.path)}
          >
            <SidebarIcon name={item.icon} />
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <small
                className={`grid h-5 min-w-[22px] place-items-center rounded-[10px] px-1.5 text-[9px] font-bold ${
                  isActive
                    ? 'bg-primary-tint text-primary-strong'
                    : 'bg-chip text-muted'
                }`}
              >
                {item.badge}
              </small>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const activeLabel =
    pathname === '/dashboard'
      ? 'Inicio'
      : pathname.startsWith('/dashboard/proposals')
        ? 'Propuestas'
        : pathname.startsWith('/dashboard/review')
          ? 'Revisión'
          : ''

  const handleItemClick = (path?: string) => {
    if (path) {
      navigate(path)
    }

    onClose()
  }

  return (
    <aside
      id="dashboard-sidebar"
      className={`fixed left-0 top-[72px] z-50 flex h-[calc(100vh-72px)] w-56 shrink-0 flex-col border-r border-line bg-white px-3.5 pb-[110px] pt-[22px] transition-transform duration-200 ease-out md:relative md:top-auto md:z-auto md:h-auto md:min-h-[calc(100vh-72px)] md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      aria-label="Navegación del dashboard"
    >
      <div className="flex flex-col gap-[30px]">
        <SidebarGroup
          activeLabel={activeLabel}
          items={principalItems}
          label="Principal"
          onItemClick={handleItemClick}
        />
        <SidebarGroup
          activeLabel={activeLabel}
          items={administrationItems}
          label="Administración"
          onItemClick={handleItemClick}
        />
      </div>

      <div className="absolute bottom-[42px] left-3.5 right-3.5 flex items-center gap-2 rounded-lg border border-line bg-canvas p-3">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-white">
          ?
        </span>
        <div className="flex min-w-0 flex-col">
          <strong className="text-[9px] leading-[14px] text-ink">
            ¿Necesitas ayuda?
          </strong>
          <span className="whitespace-nowrap text-[8px] leading-[13px] text-muted">
            Consulta la guía del sistema
          </span>
        </div>
      </div>

      <span className="absolute bottom-[15px] left-0 right-0 text-center text-[8px] text-muted">
        IDEXUD Admin · DEVELOP PHASE
      </span>
    </aside>
  )
}
