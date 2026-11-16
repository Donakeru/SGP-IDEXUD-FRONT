import {
  DocumentIcon,
  DocumentTextIcon,
  PhotoIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline'

/**
 * Utilidades de archivos basadas en el tipo MIME (nunca en la extensión).
 *
 * TODO: `components/forms/FileInput.tsx` tiene su propio `formatFileSize`
 * privado con otro redondeo (`30 KB` frente a `29,5 KB`). Unificarlas.
 */

/** Tipos que se pueden mostrar dentro de la aplicación. HTML y SVG nunca. */
const PDF_MIME = 'application/pdf'
const IMAGE_MIMES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'] as const

export type PreviewKind = 'pdf' | 'image'

/** Minúsculas y sin parámetros: "Application/PDF; charset=x" → "application/pdf". */
export function normalizeMime(mime: string) {
  return mime.split(';')[0].trim().toLowerCase()
}

export function getPreviewKind(mime: string): PreviewKind | null {
  const normalized = normalizeMime(mime)

  if (normalized === PDF_MIME) {
    return 'pdf'
  }

  return (IMAGE_MIMES as readonly string[]).includes(normalized) ? 'image' : null
}

export function isPreviewable(mime: string) {
  return getPreviewKind(mime) !== null
}

/** "30216" → "29,5 KB"; "1500000" → "1,4 MB". Una decimal y coma, como el backend. */
export function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return ''
  }

  if (bytes < 1024) {
    return `${bytes} B`
  }

  const format = (value: number) => value.toFixed(1).replace('.', ',')

  if (bytes < 1024 * 1024) {
    return `${format(bytes / 1024)} KB`
  }

  return `${format(bytes / (1024 * 1024))} MB`
}

/** Nombre corto del tipo de archivo para mostrar en la lista. */
export function getFileTypeLabel(mime: string) {
  const normalized = normalizeMime(mime)

  if (normalized === PDF_MIME) {
    return 'PDF'
  }
  if (normalized.startsWith('image/')) {
    return 'Imagen'
  }
  if (
    normalized === 'application/msword' ||
    normalized ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return 'Word'
  }
  if (
    normalized === 'application/vnd.ms-excel' ||
    normalized === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    return 'Excel'
  }
  if (normalized.startsWith('text/')) {
    return 'Texto'
  }

  return 'Archivo'
}

/** Ícono (heroicons) según el tipo de archivo. */
export function getFileIcon(mime: string) {
  const label = getFileTypeLabel(mime)

  if (label === 'Imagen') {
    return PhotoIcon
  }
  if (label === 'Excel') {
    return TableCellsIcon
  }
  if (label === 'PDF' || label === 'Word' || label === 'Texto') {
    return DocumentTextIcon
  }

  return DocumentIcon
}

/** "propuesta" → "Propuesta"; "aval_facultad" → "Aval facultad". */
export function formatDocumentType(value: string) {
  const text = value.replace(/_/g, ' ').trim()

  return text ? text.charAt(0).toUpperCase() + text.slice(1) : ''
}
