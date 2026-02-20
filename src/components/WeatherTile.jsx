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

export default function WeatherTile({ location, onRemove }) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [unit, setUnit] = useState('celsius')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchWeather(location.latitude, location.longitude, unit)
      .then(data => {
        if (!cancelled) {
          setWeather(data)
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
  }, [location.latitude, location.longitude, unit])

  const info = weather ? getWeatherInfo(weather.current.weathercode) : null

  return (
    <article className="weather-tile">
      <button
        className="tile-remove"
        onClick={() => onRemove(location.id)}
        aria-label={`Remove ${location.name}`}
        title="Remove"
      >
        ×
      </button>

      <header className="tile-header">
        <h2 className="tile-city">{location.name}</h2>
        <p className="tile-region">
          {[location.admin1, location.country].filter(Boolean).join(', ')}
        </p>
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

          <ForecastStrip daily={weather.daily} unit={unit} />
        </>
      )}
    </article>
  )
}
