export function formatDate(dateStr, opts = {}) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...opts,
  })
}

export function formatShortDate(dateStr) {
  return formatDate(dateStr, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatTime(timeStr) {
  if (!timeStr) return '-'
  return timeStr.slice(0, 5)
}

export function todayName() {
  return new Date().toLocaleDateString('id-ID', { weekday: 'long' })
}

export function formatRelative(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffDays === 0) return 'Hari ini'
  if (diffDays === 1) return 'Kemarin'
  if (diffDays < 7) return `${diffDays} hari lalu`
  return formatShortDate(dateStr)
}
