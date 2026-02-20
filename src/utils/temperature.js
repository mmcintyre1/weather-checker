export function formatTemp(value, unit) {
  if (value == null) return '—'
  const rounded = Math.round(value)
  const symbol = unit === 'fahrenheit' ? '°F' : '°C'
  return `${rounded}${symbol}`
}
