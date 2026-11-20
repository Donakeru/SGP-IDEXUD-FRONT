import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isSidebarOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSidebarOpen])

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header
        isSidebarOpen={isSidebarOpen}
        onMenuClick={() => setIsSidebarOpen((isOpen) => !isOpen)}
      />
      <div className="relative flex min-h-0 flex-1 overflow-hidden pt-[72px]">
        {isSidebarOpen && (
          <button
            className="fixed inset-x-0 bottom-0 top-[72px] z-40 bg-ink/40 md:hidden"
            type="button"
            aria-label="Cerrar menú de navegación"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto md:ml-56">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
