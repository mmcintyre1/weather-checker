import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export async function createShare(locations) {
  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 8)
  const data = locations.map(({ name, admin1, latitude, longitude, timezone }) => ({
    name, admin1, latitude, longitude, timezone,
  }))
  const { error } = await supabase.from('shares').insert({ id, locations: data })
  if (error) throw error
  return id
}

export async function loadShare(id) {
  const { data, error } = await supabase
    .from('shares')
    .select('locations')
    .eq('id', id)
    .single()
  if (error || !data) return []
  return data.locations.map(loc => ({
    id: crypto.randomUUID(),
    name: loc.name ?? '',
    admin1: loc.admin1 ?? '',
    country: '',
    latitude: loc.latitude,
    longitude: loc.longitude,
    timezone: loc.timezone ?? 'auto',
  }))
}
