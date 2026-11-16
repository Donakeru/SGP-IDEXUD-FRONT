import { useCallback, useEffect, useRef, useState } from 'react'
import {
  downloadDocument,
  saveBlob,
  toDocumentError,
  type DocumentError,
} from '../../services/documentService'
import { isAbortError } from '../../services/http/errors'
import type { ProposalDocument } from '../../types/proposal/ProposalDocument'

type DownloadableDocument = Pick<ProposalDocument, 'uuid_archivo' | 'nombre_original'>

/**
 * Descarga un documento con su `nombre_original`, sin abrir otra pestaña.
 * Expone el estado (cargando y error) para mostrar spinner y "Reintentar".
 * Ignora clics repetidos mientras hay una descarga en curso.
 */
export function useDocumentDownload(doc: DownloadableDocument) {
  const { uuid_archivo, nombre_original } = doc
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<DocumentError | null>(null)
  const controllerRef = useRef<AbortController | null>(null)
  const inFlightRef = useRef(false)

  // Cancela una descarga en curso si el componente se desmonta.
  useEffect(() => () => controllerRef.current?.abort(), [])

  const download = useCallback(
    /** Si ya se tiene el blob (por ejemplo en el modal) se guarda sin volver a pedirlo. */
    async (loadedBlob?: Blob | null) => {
      if (inFlightRef.current) {
        return
      }

      const controller = new AbortController()

      controllerRef.current = controller
      inFlightRef.current = true
      setIsDownloading(true)
      setError(null)

      try {
        if (loadedBlob) {
          saveBlob(loadedBlob, nombre_original)
        } else {
          await downloadDocument({ uuid_archivo, nombre_original }, controller.signal)
        }
      } catch (downloadError) {
        if (!controller.signal.aborted && !isAbortError(downloadError)) {
          setError(toDocumentError(downloadError))
        }
      } finally {
        inFlightRef.current = false

        if (!controller.signal.aborted) {
          setIsDownloading(false)
        }
      }
    },
    [uuid_archivo, nombre_original],
  )

  const clearError = useCallback(() => setError(null), [])

  return { download, isDownloading, error, clearError }
}
