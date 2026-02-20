// WMO Weather Interpretation Codes
// Reference: https://open-meteo.com/en/docs

const WMO_CODES = {
  0:  { description: 'Clear sky',              symbol: '☀️' },
  1:  { description: 'Mainly clear',           symbol: '🌤️' },
  2:  { description: 'Partly cloudy',          symbol: '⛅' },
  3:  { description: 'Overcast',               symbol: '☁️' },
  45: { description: 'Fog',                    symbol: '🌫️' },
  48: { description: 'Rime fog',               symbol: '🌫️' },
  51: { description: 'Light drizzle',          symbol: '🌦️' },
  53: { description: 'Drizzle',                symbol: '🌦️' },
  55: { description: 'Heavy drizzle',          symbol: '🌧️' },
  56: { description: 'Freezing drizzle',       symbol: '🌧️' },
  57: { description: 'Heavy freezing drizzle', symbol: '🌧️' },
  61: { description: 'Light rain',             symbol: '🌧️' },
  63: { description: 'Rain',                   symbol: '🌧️' },
  65: { description: 'Heavy rain',             symbol: '🌧️' },
  66: { description: 'Freezing rain',          symbol: '🌨️' },
  67: { description: 'Heavy freezing rain',    symbol: '🌨️' },
  71: { description: 'Light snow',             symbol: '🌨️' },
  73: { description: 'Snow',                   symbol: '❄️' },
  75: { description: 'Heavy snow',             symbol: '❄️' },
  77: { description: 'Snow grains',            symbol: '❄️' },
  80: { description: 'Rain showers',           symbol: '🌦️' },
  81: { description: 'Heavy showers',          symbol: '🌧️' },
  82: { description: 'Violent showers',        symbol: '🌧️' },
  85: { description: 'Snow showers',           symbol: '🌨️' },
  86: { description: 'Heavy snow showers',     symbol: '❄️' },
  95: { description: 'Thunderstorm',           symbol: '⛈️' },
  96: { description: 'Thunderstorm w/ hail',   symbol: '⛈️' },
  99: { description: 'Severe thunderstorm',    symbol: '⛈️' },
}

const FALLBACK = { description: 'Unknown', symbol: '—' }

export function getWeatherInfo(code) {
  return WMO_CODES[code] ?? FALLBACK
}
