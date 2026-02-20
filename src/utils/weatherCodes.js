// WMO Weather Interpretation Codes
// Reference: https://open-meteo.com/en/docs

const TINTS = {
  clear:  'rgba(254, 240, 138, 0.18)',
  cloudy: 'rgba(203, 213, 225, 0.22)',
  fog:    'rgba(203, 213, 225, 0.28)',
  rain:   'rgba(147, 197, 253, 0.22)',
  snow:   'rgba(224, 242, 254, 0.35)',
  storm:  'rgba(167, 139, 250, 0.18)',
}

const WMO_CODES = {
  0:  { description: 'Clear sky',              symbol: '☀️',  tint: TINTS.clear  },
  1:  { description: 'Mainly clear',           symbol: '🌤️', tint: TINTS.clear  },
  2:  { description: 'Partly cloudy',          symbol: '⛅',  tint: TINTS.cloudy },
  3:  { description: 'Overcast',               symbol: '☁️',  tint: TINTS.cloudy },
  45: { description: 'Fog',                    symbol: '🌫️', tint: TINTS.fog    },
  48: { description: 'Rime fog',               symbol: '🌫️', tint: TINTS.fog    },
  51: { description: 'Light drizzle',          symbol: '🌦️', tint: TINTS.rain   },
  53: { description: 'Drizzle',                symbol: '🌦️', tint: TINTS.rain   },
  55: { description: 'Heavy drizzle',          symbol: '🌧️', tint: TINTS.rain   },
  56: { description: 'Freezing drizzle',       symbol: '🌧️', tint: TINTS.snow   },
  57: { description: 'Heavy freezing drizzle', symbol: '🌧️', tint: TINTS.snow   },
  61: { description: 'Light rain',             symbol: '🌧️', tint: TINTS.rain   },
  63: { description: 'Rain',                   symbol: '🌧️', tint: TINTS.rain   },
  65: { description: 'Heavy rain',             symbol: '🌧️', tint: TINTS.rain   },
  66: { description: 'Freezing rain',          symbol: '🌨️', tint: TINTS.snow   },
  67: { description: 'Heavy freezing rain',    symbol: '🌨️', tint: TINTS.snow   },
  71: { description: 'Light snow',             symbol: '🌨️', tint: TINTS.snow   },
  73: { description: 'Snow',                   symbol: '❄️',  tint: TINTS.snow   },
  75: { description: 'Heavy snow',             symbol: '❄️',  tint: TINTS.snow   },
  77: { description: 'Snow grains',            symbol: '❄️',  tint: TINTS.snow   },
  80: { description: 'Rain showers',           symbol: '🌦️', tint: TINTS.rain   },
  81: { description: 'Heavy showers',          symbol: '🌧️', tint: TINTS.rain   },
  82: { description: 'Violent showers',        symbol: '🌧️', tint: TINTS.rain   },
  85: { description: 'Snow showers',           symbol: '🌨️', tint: TINTS.snow   },
  86: { description: 'Heavy snow showers',     symbol: '❄️',  tint: TINTS.snow   },
  95: { description: 'Thunderstorm',           symbol: '⛈️',  tint: TINTS.storm  },
  96: { description: 'Thunderstorm w/ hail',   symbol: '⛈️',  tint: TINTS.storm  },
  99: { description: 'Severe thunderstorm',    symbol: '⛈️',  tint: TINTS.storm  },
}

const FALLBACK = { description: 'Unknown', symbol: '—', tint: null }

export function getWeatherInfo(code) {
  return WMO_CODES[code] ?? FALLBACK
}
