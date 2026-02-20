import { useState, useEffect, useRef } from 'react'
import AddTile from './components/AddTile'
import WeatherTile from './components/WeatherTile'
import { createShare, loadShare } from './api/shares'
import './App.css'

// ---------------------------------------------------------------------------
// Backwards-compat: decode old-format URLs (?s=lat~lon~name~admin1~tz!...)
// New shares go through Supabase; old links still work via this decoder.
// ---------------------------------------------------------------------------
const TZ = [
  'Africa/Cairo','Africa/Johannesburg','Africa/Lagos','Africa/Nairobi',
  'America/Anchorage','America/Argentina/Buenos_Aires','America/Bogota',
  'America/Chicago','America/Denver','America/Halifax',
  'America/Indiana/Indianapolis','America/Lima','America/Los_Angeles',
  'America/Mexico_City','America/New_York','America/Phoenix','America/Santiago',
  'America/Sao_Paulo','America/Toronto','America/Vancouver',
  'Asia/Bangkok','Asia/Dhaka','Asia/Dubai','Asia/Jakarta','Asia/Karachi',
  'Asia/Kolkata','Asia/Kuala_Lumpur','Asia/Manila','Asia/Seoul',
  'Asia/Shanghai','Asia/Singapore','Asia/Taipei','Asia/Tehran','Asia/Tokyo',
  'Australia/Melbourne','Australia/Sydney',
  'Europe/Amsterdam','Europe/Athens','Europe/Berlin','Europe/Brussels',
  'Europe/Istanbul','Europe/London','Europe/Madrid','Europe/Moscow',
  'Europe/Paris','Europe/Rome','Europe/Warsaw',
  'Pacific/Auckland','Pacific/Honolulu','UTC',
]

function decTz(s) {
  const i = parseInt(s, 10)
  return !isNaN(i) && TZ[i] ? TZ[i] : s
}

function isShortCode(s) {
  // Short codes are alphanumeric only; old-format has ~ and ! separators
  return /^[a-z0-9]+$/i.test(s)
}

function locationsFromOldUrl(s) {
  try {
    return s.split('!').map(part => {
      const [lat, lon, name, admin1, tz] = part.split('~')
      if (!lat || !lon) return null
      return {
        id: crypto.randomUUID(),
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        name: name ?? '',
        admin1: admin1 ?? '',
        country: '',
        timezone: decTz(tz ?? 'auto'),
      }
    }).filter(Boolean)
  } catch {
    return []
  }
}
// ---------------------------------------------------------------------------

export default function App() {
  const [copied, setCopied] = useState(false)
  const [sharing, setSharing] = useState(false)

  const [locations, setLocations] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    const s = params.get('s')
    if (s && !isShortCode(s)) {
      // Old-format URL — decode inline
      const locs = locationsFromOldUrl(s)
      if (locs.length > 0) return locs
    }
    // Short code or no param — start from localStorage (Supabase load happens in useEffect)
    try {
      const saved = localStorage.getItem('weather-locations')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Load from Supabase if the URL contains a short code
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const s = params.get('s')
    if (s && isShortCode(s)) {
      loadShare(s).then(locs => {
        if (locs.length > 0) setLocations(locs)
      })
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('weather-locations', JSON.stringify(locations))
  }, [locations])

  function handleAdd(locationEntry) {
    const isDuplicate = locations.some(
      loc => loc.latitude === locationEntry.latitude && loc.longitude === locationEntry.longitude
    )
    if (isDuplicate) return
    setLocations(prev => [...prev, locationEntry])
  }

  function handleRemove(id) {
    setLocations(prev => prev.filter(loc => loc.id !== id))
  }

  async function handleShare() {
    setSharing(true)
    try {
      const code = await createShare(locations)
      const url = `${window.location.origin}${window.location.pathname}?s=${code}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } finally {
      setSharing(false)
    }
  }

  const dragIndex = useRef(null)

  function handleDragStart(index) {
    dragIndex.current = index
  }

  function handleDrop(index) {
    if (dragIndex.current === null || dragIndex.current === index) return
    const updated = [...locations]
    const [moved] = updated.splice(dragIndex.current, 1)
    updated.splice(index, 0, moved)
    setLocations(updated)
    dragIndex.current = null
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__top">
          <h1 className="app-title">Weather Across the Map</h1>
          {locations.length > 0 && (
            <button className="share-btn" onClick={handleShare} disabled={sharing}>
              {sharing ? '…' : copied ? 'Copied!' : 'Share'}
            </button>
          )}
        </div>
        <AddTile onAdd={handleAdd} />
      </header>

      <main className="tile-grid">
        {locations.map((loc, i) => (
          <WeatherTile
            key={loc.id}
            location={loc}
            onRemove={handleRemove}
            onDragStart={() => handleDragStart(i)}
            onDrop={() => handleDrop(i)}
          />
        ))}
      </main>
    </div>
  )
}
