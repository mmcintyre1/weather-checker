import { useState, useEffect, useRef } from 'react'
import { searchLocations } from '../api/geocoding'
import './AddTile.css'

export default function AddTile({ onAdd }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const found = await searchLocations(query)
        setResults(found)
        setOpen(true)
      } catch {
        setError('Search failed. Please try again.')
        setResults([])
        setOpen(true)
      } finally {
        setLoading(false)
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [query])

  // Dismiss on outside click
  useEffect(() => {
    function handleMouseDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  function handleSelect(result) {
    onAdd({ ...result, id: crypto.randomUUID() })
    setQuery('')
    setResults([])
    setOpen(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      setQuery('')
      setResults([])
      setOpen(false)
    }
  }

  const showDropdown = open && (results.length > 0 || error || (!loading && query.trim().length >= 2))

  return (
    <div className="add-tile" ref={containerRef}>
      <div className="add-tile__label">Add a location</div>
      <div className="add-tile__input-row">
        <input
          type="text"
          className="add-tile__input"
          placeholder="Search city..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          autoComplete="off"
          spellCheck="false"
        />
        {loading && <span className="add-tile__spinner" />}
      </div>

      {showDropdown && (
        <ul className="add-tile__dropdown">
          {results.length > 0
            ? results.map((r, i) => (
                <li
                  key={i}
                  className="add-tile__result"
                  onClick={() => handleSelect(r)}
                >
                  <span className="result-name">{r.name}</span>
                  <span className="result-sub">
                    {[r.admin1, r.country].filter(Boolean).join(', ')}
                  </span>
                </li>
              ))
            : error
              ? <li className="add-tile__message add-tile__message--error">{error}</li>
              : <li className="add-tile__message">No locations found</li>
          }
        </ul>
      )}
    </div>
  )
}
