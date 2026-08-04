import { createClient } from '@/lib/supabase/client'

export interface StationInfo {
  id: string
  name: string
  area: string
  latitude: number
  longitude: number
  access_notes: string | null
}

export interface RouteStation {
  id: string
  order_index: number
  station: StationInfo
}

export interface ActiveRoute {
  id: string
  name: string
  description: string | null
  round_type: 'morning' | 'evening'
  route_stations: RouteStation[]
}

export async function fetchActiveRoutes(): Promise<ActiveRoute[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('routes')
    .select(`
      id, name, description, round_type,
      route_stations (
        id, order_index,
        station:stations ( id, name, area, latitude, longitude, access_notes )
      )
    `)
    .eq('is_active', true)
    .order('name')

  if (error) throw error

  return (data ?? []).map(r => ({
    id: r.id,
    name: r.name,
    description: r.description ?? null,
    round_type: (r.round_type as 'morning' | 'evening') ?? 'evening',
    route_stations: [...r.route_stations]
      .sort((a, b) => a.order_index - b.order_index)
      .map(rs => {
        // Supabase returns the joined row as an array; take the first element
        const stationRaw = Array.isArray(rs.station) ? rs.station[0] : rs.station
        return {
          id: rs.id,
          order_index: rs.order_index,
          station: stationRaw as StationInfo,
        }
      }),
  }))
}
