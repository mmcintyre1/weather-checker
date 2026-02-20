import { useState, useEffect, useRef } from 'react'
import AddTile from './components/AddTile'
import WeatherTile from './components/WeatherTile'
import './App.css'

export default function App() {
  const [locations, setLocations] = useState(() => {
    try {
      const saved = localStorage.getItem('weather-locations')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('weather-locations', JSON.stringify(locations))
  }, [locations])

  function handleAdd(locationEntry) {
    // Prevent duplicates by lat/lon
    const isDuplicate = locations.some(
      loc =>
        loc.latitude === locationEntry.latitude &&
        loc.longitude === locationEntry.longitude
    )
    if (isDuplicate) return
    setLocations(prev => [...prev, locationEntry])
  }

  function handleRemove(id) {
    setLocations(prev => prev.filter(loc => loc.id !== id))
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Weather</h1>
        <AddTile onAdd={handleAdd} />
      </header>

      <main className="tile-grid">
        {locations.map(loc => (
          <WeatherTile
            key={loc.id}
            location={loc}
            onRemove={handleRemove}
          />
        ))}
      </main>
    </div>
  )
}
