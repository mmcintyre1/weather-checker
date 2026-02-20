const BASE = 'https://api.open-meteo.com/v1/forecast'

/**
 * Fetch current conditions and 6-day daily forecast.
 * `unit` is 'celsius' or 'fahrenheit'.
 * Returns structured WeatherData.
 */
export async function fetchWeather(latitude, longitude, unit = 'celsius') {
  const params = new URLSearchParams({
    latitude,
    longitude,
    current: 'temperature_2m,weathercode,windspeed_10m,apparent_temperature,relativehumidity_2m',
    daily: 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    temperature_unit: unit,
    wind_speed_unit: 'mph',
    timezone: 'auto',
    forecast_days: 6,
  })

  const res = await fetch(`${BASE}?${params}`)
  if (!res.ok) throw new Error(`Weather fetch error: ${res.status}`)

  const data = await res.json()

  return {
    current: {
      temperature: data.current.temperature_2m,
      feelsLike: data.current.apparent_temperature,
      humidity: data.current.relativehumidity_2m,
      windspeed: data.current.windspeed_10m,
      weathercode: data.current.weathercode,
    },
    daily: {
      time: data.daily.time,
      weathercode: data.daily.weathercode,
      tempMax: data.daily.temperature_2m_max,
      tempMin: data.daily.temperature_2m_min,
      precipProb: data.daily.precipitation_probability_max,
    },
    units: {
      temperature: data.current_units.temperature_2m,
      windspeed: data.current_units.windspeed_10m,
    },
  }
}
