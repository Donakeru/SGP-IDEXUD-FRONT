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
    <div className="flex min-h-screen flex-col">
      <Header
        isSidebarOpen={isSidebarOpen}
        onMenuClick={() => setIsSidebarOpen((isOpen) => !isOpen)}
      />
      <div className="relative flex flex-1">
        {isSidebarOpen && (
          <button
            className="fixed inset-0 z-40 bg-slate-950/40 md:hidden"
            type="button"
            aria-label="Cerrar menú de navegación"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
