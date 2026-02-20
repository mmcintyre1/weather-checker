const BASE = 'https://geocoding-api.open-meteo.com/v1/search'

/**
 * Search for locations by name.
 * Returns an array of LocationEntry objects (without id).
 */
export async function searchLocations(query) {
  if (!query || query.trim().length < 2) return []

  const url = `${BASE}?name=${encodeURIComponent(query.trim())}&count=5&language=en&format=json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Geocoding error: ${res.status}`)

  const data = await res.json()
  if (!data.results) return []

  return data.results.map(r => ({
    name: r.name,
    country: r.country ?? '',
    admin1: r.admin1 ?? '',
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone ?? 'auto',
  }))
}
