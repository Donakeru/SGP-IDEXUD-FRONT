import { NoSymbolIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import Alert from './Alert'
import { subscribeForbidden } from '../services/http/forbiddenNotifier'

const AUTO_DISMISS_MS = 8000

/**
 * Aviso global cuando el backend responde 403: muestra el `detail` del backend
 * con el componente `Alert` existente. Se descarta solo o con la X.
 */
export default function ForbiddenAlertHost() {
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => subscribeForbidden(setMessage), [])

  useEffect(() => {
    if (!message) {
      return
    }

    const timeoutId = window.setTimeout(() => setMessage(null), AUTO_DISMISS_MS)

    return () => window.clearTimeout(timeoutId)
  }, [message])

  return (
    <Alert
      open={message !== null}
      variant="danger"
      role="alert"
      title="Acción no permitida"
      description={message ?? undefined}
      icon={<NoSymbolIcon className="size-[18px]" strokeWidth={1.8} aria-hidden="true" />}
      action={
        <button
          className="grid size-7 place-items-center rounded-md text-muted hover:bg-primary-soft hover:text-primary-strong"
          type="button"
          aria-label="Cerrar aviso"
          onClick={() => setMessage(null)}
        >
          <XMarkIcon className="size-4" strokeWidth={1.8} aria-hidden="true" />
        </button>
      }
    />
  )
}
