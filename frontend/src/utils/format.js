export function shortCity(loc) {
  return loc?.split(',')[0]?.trim() || loc || '—'
}

export function formatStopTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function segmentHours(start, end) {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const startH = sh + sm / 60
  const endH = end === '24:00' ? 24 : eh + em / 60
  return Math.max(0, endH - startH)
}

export function formatDuration(hours) {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h && m) return `${h}h ${m}m`
  if (h) return `${h}h`
  return `${m}m`
}
