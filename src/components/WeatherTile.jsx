import { useState, useEffect } from 'react'
import { fetchWeather } from '../api/weather'
import { getWeatherInfo } from '../utils/weatherCodes'
import { formatTemp } from '../utils/temperature'
import './WeatherTile.css'

function ForecastStrip({ daily, unit }) {
  // daily[0] is today — already shown in current block. Show indices 1-5.
  return (
    <div className="forecast-strip">
      {daily.time.slice(1, 6).map((dateStr, i) => {
        const idx = i + 1
        const dayLabel = new Intl.DateTimeFormat('en', { weekday: 'short' })
          .format(new Date(dateStr + 'T00:00:00'))
        const info = getWeatherInfo(daily.weathercode[idx])
        const precip = daily.precipProb?.[idx]
        return (
          <div key={dateStr} className="forecast-day">
            <span className="fc-day">{dayLabel}</span>
            <span className="fc-symbol">{info.symbol}</span>
            <span className="fc-high">{formatTemp(daily.tempMax[idx], unit)}</span>
            <span className="fc-low">{formatTemp(daily.tempMin[idx], unit)}</span>
            {precip != null && (
              <span className="fc-precip">{precip}%</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function useRelativeTime(date) {
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!date) return
    const interval = setInterval(() => setTick(n => n + 1), 30000)
    return () => clearInterval(interval)
  }, [date])
  if (!date) return null
  const mins = Math.floor((Date.now() - date) / 60000)
  if (mins < 1) return 'Just now'
  if (mins === 1) return '1 min ago'
  return `${mins} mins ago`
}

function HourlyStrip({ hourly, unit }) {
  return (
    <div className="hourly-strip">
      {hourly.time.map((timeStr, i) => {
        const hour = new Intl.DateTimeFormat('en', { hour: 'numeric', hour12: true })
          .format(new Date(timeStr))
        const info = getWeatherInfo(hourly.weathercode[i])
        return (
          <div key={timeStr} className="hourly-item">
            <span className="hr-time">{i === 0 ? 'Now' : hour}</span>
            <span className="hr-symbol">{info.symbol}</span>
            <span className="hr-temp">{formatTemp(hourly.temperature[i], unit)}</span>
            {hourly.precipProb[i] > 0 && (
              <span className="hr-precip">{hourly.precipProb[i]}%</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function WeatherTile({ location, onRemove, onDragStart, onDrop }) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [unit, setUnit] = useState('celsius')
  const [refreshKey, setRefreshKey] = useState(0)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [forecastView, setForecastView] = useState('daily')

  const updatedLabel = useRelativeTime(lastUpdated)

  const [localTime, setLocalTime] = useState('')
  useEffect(() => {
    function tick() {
      setLocalTime(
        new Intl.DateTimeFormat('en', {
          timeZone: location.timezone,
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }).format(new Date())
      )
    }
    tick()
    const interval = setInterval(tick, 60000)
    return () => clearInterval(interval)
  }, [location.timezone])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchWeather(location.latitude, location.longitude, unit)
      .then(data => {
        if (!cancelled) {
          setWeather(data)
          setLastUpdated(new Date())
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Could not load weather data.')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [location.latitude, location.longitude, unit, refreshKey])

  const info = weather ? getWeatherInfo(weather.current.weathercode) : null

  return (
    <article
      className="weather-tile"
      draggable
      onDragStart={onDragStart}
      onDragOver={e => e.preventDefault()}
      onDrop={onDrop}
    >
      <button
        className="tile-remove"
        onClick={() => onRemove(location.id)}
        aria-label={`Remove ${location.name}`}
        title="Remove"
      >
        ×
      </button>

      <header className="tile-header">
        <div className="tile-header-top">
          <h2 className="tile-city">{location.name}</h2>
          <button
            className="tile-refresh"
            onClick={() => setRefreshKey(k => k + 1)}
            disabled={loading}
            title="Refresh"
            aria-label="Refresh weather"
          >
            ↻
          </button>
        </div>
        <p className="tile-region">
          {[location.admin1, location.country].filter(Boolean).join(', ')}
          {localTime && <span className="tile-local-time"> · {localTime}</span>}
        </p>
        {updatedLabel && (
          <p className="tile-updated">Updated {updatedLabel}</p>
        )}
      </header>

      {loading && (
        <div className="tile-loading">
          <span className="tile-spinner" />
        </div>
      )}

      {error && !loading && (
        <div className="tile-error">{error}</div>
      )}

      {weather && !loading && (
        <>
          <div className="tile-current">
            <div className="tile-current-main">
              <span className="tile-symbol">{info.symbol}</span>
              <span className="tile-temp">{formatTemp(weather.current.temperature, unit)}</span>
            </div>
            <p className="tile-desc">{info.description}</p>
            <div className="tile-meta">
              <span>H: {formatTemp(weather.daily.tempMax[0], unit)} · L: {formatTemp(weather.daily.tempMin[0], unit)}</span>
              <span>Feels like {formatTemp(weather.current.feelsLike, unit)}</span>
              <span>{weather.current.humidity}% humidity</span>
              <span>{Math.round(weather.current.windspeed)} {weather.units.windspeed}</span>
            </div>
          </div>

          <div className="tile-controls">
            <div className="tile-unit-toggle">
              <button
                className={`unit-btn${unit === 'celsius' ? ' active' : ''}`}
                onClick={() => setUnit('celsius')}
              >
                °C
              </button>
              <button
                className={`unit-btn${unit === 'fahrenheit' ? ' active' : ''}`}
                onClick={() => setUnit('fahrenheit')}
              >
                °F
              </button>
            </div>
            <div className="tile-view-toggle">
              <button
                className={`unit-btn${forecastView === 'daily' ? ' active' : ''}`}
                onClick={() => setForecastView('daily')}
              >
                5-day
              </button>
              <button
                className={`unit-btn${forecastView === 'hourly' ? ' active' : ''}`}
                onClick={() => setForecastView('hourly')}
              >
                24-hr
              </button>
            </div>
          </div>

          {forecastView === 'daily'
            ? <ForecastStrip daily={weather.daily} unit={unit} />
            : <HourlyStrip hourly={weather.hourly} unit={unit} />
          }
        </>
      )}
    </article>
  )
}
