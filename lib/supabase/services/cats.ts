import { createClient } from '@/lib/supabase/client'

export async function fetchCatsByStation(stationId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('cats')
    .select('id, name, photo_url, description, status, health_notes')
    .eq('primary_station_id', stationId)
    .eq('is_active', true)
    .order('name')

  if (error) throw error
  return data ?? []
}

export async function fetchCatsByIds(ids: string[]) {
  if (ids.length === 0) return []
  const supabase = createClient()
  const { data, error } = await supabase
    .from('cats')
    .select('id, name, photo_url, status')
    .in('id', ids)

  if (error) throw error
  return data ?? []
}

export async function insertProvisionalCat(cat: {
  name: string
  description: string | null
  primaryStationId: string | null
  createdBy: string
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('cats')
    .insert({
      name: cat.name,
      description: cat.description,
      primary_station_id: cat.primaryStationId,
      created_by: cat.createdBy,
      is_provisional: true,
      status: 'active',
    })
    .select('id')
    .single()

  if (error) throw error
  return data
}
