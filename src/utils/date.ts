/** "07 oct 2026, 10:42". Devuelve el valor original si la fecha no es válida. */
export function formatDateTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  const day = new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
    .format(date)
    .replace(/\./g, '')
    .replace(/ de /g, ' ')
  const time = new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)

  return `${day}, ${time}`
}

/** "ahora", "hace 5 min", "hace 2 h", "hace 5 d". */
export function formatElapsed(value: string, now: Date = new Date()) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const minutes = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 60_000))

  if (minutes < 1) {
    return 'ahora'
  }
  if (minutes < 60) {
    return `hace ${minutes} min`
  }

  const hours = Math.floor(minutes / 60)

  if (hours < 24) {
    return `hace ${hours} h`
  }

  return `hace ${Math.floor(hours / 24)} d`
}
