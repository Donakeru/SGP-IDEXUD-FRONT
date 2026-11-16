import { useCallback, useEffect, useState } from 'react'
import {
  getDocumentBlob,
  toDocumentError,
  type DocumentError,
} from '../../services/documentService'
import { isAbortError } from '../../services/http/errors'

type DocumentFileState = {
  status: 'idle' | 'loading' | 'ready' | 'error'
  /** URL de objeto (`blob:`) lista para un `iframe` o `img`. Solo con `status = 'ready'`. */
  url: string | null
  blob: Blob | null
  error: DocumentError | null
}

const IDLE: DocumentFileState = { status: 'idle', url: null, blob: null, error: null }
const LOADING: DocumentFileState = { status: 'loading', url: null, blob: null, error: null }

type UseDocumentFileOptions = {
  /** Tipo MIME de la lista; permite re-etiquetar el blob de una vista previa. */
  mimeType?: string
  /** `true` pide el archivo como adjunto. Por defecto, inline (vista previa). */
  download?: boolean
}

/**
 * Pide el archivo `uuidArchivo` como blob y expone una URL de objeto.
 *
 * - Con `uuidArchivo = null` no hace nada y no retiene ningún blob (útil para
 *   pedirlo solo mientras un modal está abierto).
 * - La petición se cancela y la URL se revoca al cambiar el documento, al
 *   reintentar y al desmontar, para no dejar fugas de memoria.
 */
export function useDocumentFile(
  uuidArchivo: string | null,
  { mimeType, download = false }: UseDocumentFileOptions = {},
) {
  const [state, setState] = useState<DocumentFileState>(IDLE)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!uuidArchivo) {
      setState(IDLE)
      return
    }

    const controller = new AbortController()
    let objectUrl: string | null = null

    setState(LOADING)

    getDocumentBlob(uuidArchivo, { download, mimeType, signal: controller.signal })
      .then((blob) => {
        if (controller.signal.aborted) {
          return
        }

        objectUrl = URL.createObjectURL(blob)
        setState({ status: 'ready', url: objectUrl, blob, error: null })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || isAbortError(error)) {
          return
        }

        setState({ status: 'error', url: null, blob: null, error: toDocumentError(error) })
      })

    return () => {
      controller.abort()

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
        objectUrl = null
      }
    }
  }, [uuidArchivo, mimeType, download, attempt])

  const retry = useCallback(() => setAttempt((current) => current + 1), [])

  return {
    ...state,
    isLoading: state.status === 'loading',
    retry,
  }
}
