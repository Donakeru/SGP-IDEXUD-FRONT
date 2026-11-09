import {
  ClipboardDocumentCheckIcon,
  FolderIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline'
import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { usePermissions } from '../auth/usePermissions'
import {
  getNavRoutes,
  toAbsolutePath,
  type AppRouteConfig,
  type NavGroup,
  type NavIconName,
} from '../router/routeConfig'

type SidebarItem = {
  key: string
  label: string
  icon: NavIconName
  badge?: string
  path: string
  isActive: boolean
}

type SidebarProps = {
  isOpen: boolean
  onClose: () => void
}

const groupLabels: Record<NavGroup, string> = {
  principal: 'Principal',
  administracion: 'Administración',
}

const iconComponents = {
  dashboard: Squares2X2Icon,
  folder: FolderIcon,
  review: ClipboardDocumentCheckIcon,
}

function SidebarIcon({ name }: { name: NavIconName }) {
  const Icon = iconComponents[name]

  return (
    <Icon
      className="size-[18px] shrink-0"
      strokeWidth={1.8}
      aria-hidden="true"
    />
  )
}

function isRouteActive(route: AppRouteConfig, pathname: string) {
  const path = toAbsolutePath(route)

  return route.nav?.exact ? pathname === path : pathname.startsWith(path)
}

function SidebarGroup({
  items,
  label,
  onItemClick,
}: {
  items: SidebarItem[]
  label: string
  onItemClick: (path: string) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="px-2.5 pb-1.5 text-[9px] font-bold uppercase tracking-[0.09em] text-muted">
        {label}
      </span>
      {items.map((item) => (
        <button
          className={`relative flex h-[42px] w-full items-center gap-[11px] rounded-[7px] border-0 px-[11px] text-left text-xs font-medium transition-colors hover:bg-wash hover:text-primary-strong ${
            item.isActive
              ? 'font-semibold text-primary-strong before:absolute before:left-0 before:h-6 before:w-[3px] before:rounded-r-[3px] before:bg-primary'
              : 'text-body'
          }`}
          key={item.key}
          type="button"
          aria-current={item.isActive ? 'page' : undefined}
          onClick={() => onItemClick(item.path)}
        >
          <SidebarIcon name={item.icon} />
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <small
              className={`grid h-5 min-w-[22px] place-items-center rounded-[10px] px-1.5 text-[9px] font-bold ${
                item.isActive
                  ? 'bg-primary-tint text-primary-strong'
                  : 'bg-chip text-muted'
              }`}
            >
              {item.badge}
            </small>
          )}
        </button>
      ))}
    </div>
  )
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { can } = usePermissions()

  // Menú generado desde la configuración de rutas, filtrado por capacidades.
  const groups = useMemo(() => {
    const byGroup = new Map<NavGroup, SidebarItem[]>()

    for (const route of getNavRoutes(can)) {
      if (!route.nav) {
        continue
      }

      const items = byGroup.get(route.nav.group) ?? []

      items.push({
        key: route.id,
        label: route.nav.label,
        icon: route.nav.icon,
        badge: route.nav.badge,
        path: toAbsolutePath(route),
        isActive: isRouteActive(route, pathname),
      })
      byGroup.set(route.nav.group, items)
    }

    return (Object.keys(groupLabels) as NavGroup[])
      .filter((group) => byGroup.has(group))
      .map((group) => ({
        group,
        label: groupLabels[group],
        items: byGroup.get(group) ?? [],
      }))
  }, [can, pathname])

  const handleItemClick = (path: string) => {
    navigate(path)
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
        {groups.map(({ group, label, items }) => (
          <SidebarGroup
            items={items}
            key={group}
            label={label}
            onItemClick={handleItemClick}
          />
        ))}
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
