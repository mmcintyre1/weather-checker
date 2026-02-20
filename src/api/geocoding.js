const BASE = 'https://geocoding-api.open-meteo.com/v1/search'

const US_STATES = {
  al: 'Alabama', ak: 'Alaska', az: 'Arizona', ar: 'Arkansas', ca: 'California',
  co: 'Colorado', ct: 'Connecticut', de: 'Delaware', fl: 'Florida', ga: 'Georgia',
  hi: 'Hawaii', id: 'Idaho', il: 'Illinois', in: 'Indiana', ia: 'Iowa',
  ks: 'Kansas', ky: 'Kentucky', la: 'Louisiana', me: 'Maine', md: 'Maryland',
  ma: 'Massachusetts', mi: 'Michigan', mn: 'Minnesota', ms: 'Mississippi', mo: 'Missouri',
  mt: 'Montana', ne: 'Nebraska', nv: 'Nevada', nh: 'New Hampshire', nj: 'New Jersey',
  nm: 'New Mexico', ny: 'New York', nc: 'North Carolina', nd: 'North Dakota', oh: 'Ohio',
  ok: 'Oklahoma', or: 'Oregon', pa: 'Pennsylvania', ri: 'Rhode Island', sc: 'South Carolina',
  sd: 'South Dakota', tn: 'Tennessee', tx: 'Texas', ut: 'Utah', vt: 'Vermont',
  va: 'Virginia', wa: 'Washington', wv: 'West Virginia', wi: 'Wisconsin', wy: 'Wyoming',
  dc: 'District of Columbia',
}

/**
 * Search for locations by name.
 * Supports "city, state" format (e.g. "kingston, nh").
 * Returns an array of LocationEntry objects (without id).
 */
export async function searchLocations(query) {
  if (!query || query.trim().length < 2) return []

  let searchTerm = query.trim()
  let stateFilter = null

  const commaIdx = searchTerm.indexOf(',')
  if (commaIdx !== -1) {
    const city = searchTerm.slice(0, commaIdx).trim()
    const qualifier = searchTerm.slice(commaIdx + 1).trim().toLowerCase()
    if (city.length >= 2) {
      searchTerm = city
      stateFilter = US_STATES[qualifier] ?? (qualifier.length > 0 ? qualifier : null)
    }
  }

  const count = stateFilter ? 20 : 5
  const url = `${BASE}?name=${encodeURIComponent(searchTerm)}&count=${count}&language=en&format=json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Geocoding error: ${res.status}`)

  const data = await res.json()
  if (!data.results) return []

  let results = data.results.map(r => ({
    name: r.name,
    country: r.country ?? '',
    admin1: r.admin1 ?? '',
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone ?? 'auto',
  }))

  if (stateFilter) {
    results = results.filter(r =>
      r.admin1.toLowerCase().includes(stateFilter.toLowerCase()) ||
      r.country.toLowerCase().includes(stateFilter.toLowerCase())
    )
  }

  return results.slice(0, 5)
}
