import {
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'
import { useEffect, useId, useRef, useState } from 'react'
import { getInitials, getRoleLabel } from '../auth/userDisplay'
import { useAuth } from '../auth/useAuth'

/** Avatar, nombre y rol del usuario de la sesión, con menú para cerrar sesión. */
export default function UserMenu() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  if (!user) {
    return null
  }

  const roleLabel = getRoleLabel(user)

  return (
    <div className="relative ml-auto" ref={containerRef}>
      <button
        className="flex items-center gap-2.5 border-0 border-l border-line-soft bg-transparent py-1.5 pl-4 text-muted"
        type="button"
        aria-label={`Abrir menú de ${user.nombre}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-white">
          {getInitials(user.nombre)}
        </span>
        <span className="hidden min-w-[142px] flex-col text-left sm:flex">
          <strong className="text-[13px] leading-[18px] text-ink">{user.nombre}</strong>
          <span className="text-[11px] leading-4 text-muted">
            {roleLabel || 'Sin rol asignado'}
          </span>
        </span>
        <ChevronDownIcon className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          id={menuId}
          className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-lg border border-line bg-white shadow-[0_12px_32px_rgba(38,38,38,0.16)]"
          role="menu"
        >
          <div className="border-b border-line-soft px-3.5 py-2.5">
            <strong className="block truncate text-[11px] text-ink">{user.nombre}</strong>
            <small className="block truncate text-[9px] text-muted">{user.correo}</small>
          </div>
          <button
            className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-[11px] font-semibold text-body hover:bg-primary-soft hover:text-primary-strong"
            type="button"
            role="menuitem"
            autoFocus
            onClick={logout}
          >
            <ArrowRightOnRectangleIcon className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}
