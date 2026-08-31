import { createClient } from '@/lib/supabase/client'

export interface StationInfo {
  id: string
  name: string
  area: string
  latitude: number
  longitude: number
  access_notes: string | null
  kind: 'station' | 'stop' | 'cluster'
}

export interface ClusterArea {
  id: string
  name: string
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
        station:stations ( id, name, area, latitude, longitude, access_notes, kind )
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

// Wet Food Round only — the "areas to cover" checklist within a cluster. These are
// navigation/coverage prompts, not cat locations: a cat's cluster comes from
// cats.wet_food_cluster_id, never from which area was checked off.
export async function fetchAreasForCluster(clusterId: string): Promise<ClusterArea[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('stations')
    .select('id, name, access_notes')
    .eq('cluster_id', clusterId)
    .order('name')

  if (error) throw error
  return data ?? []
}
