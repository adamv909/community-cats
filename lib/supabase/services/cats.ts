import { createClient } from '@/lib/supabase/client'

const CAT_STATION_COLUMNS = 'id, name, photo_url, description, status, health_notes, sex, feeding_instructions, safety_notes'

// A cat's primary_station_id is its Dry Food Round location (or null if it has none).
// The Wet Food Round tracks cats at cluster level via wet_food_cluster_id instead — a
// separate column, not derived from primary_station_id, so a cat's dry/wet locations
// can freely differ (e.g. Maple's primary is "Tornado" but her wet_food_cluster_id is
// "Cluster Q"). cat_known_locations is the older per-stop mechanism, kept for any
// historical/legacy station id still referenced elsewhere. All three are checked and
// merged so no round misses a cat regardless of which mechanism placed them there.
export async function fetchCatsByStations(stationIds: string[]) {
  if (stationIds.length === 0) return []
  const supabase = createClient()

  const [primaryResult, knownResult, clusterResult] = await Promise.all([
    supabase
      .from('cats')
      .select(CAT_STATION_COLUMNS)
      .in('primary_station_id', stationIds)
      .eq('is_active', true)
      // Cats added mid-round by a volunteer stay provisional and invisible to other
      // volunteers — the admin adds them properly (with a real name) on their own system,
      // outside this app. Without this filter, whatever free text was typed into
      // "Describe the cat…" would show up as a permanent name for every volunteer.
      .eq('is_provisional', false),
    supabase
      .from('cat_known_locations')
      .select(`cat:cats!inner(${CAT_STATION_COLUMNS})`)
      .in('station_id', stationIds)
      .eq('cats.is_active', true)
      .eq('cats.is_provisional', false),
    supabase
      .from('cats')
      .select(CAT_STATION_COLUMNS)
      .in('wet_food_cluster_id', stationIds)
      .eq('is_active', true)
      .eq('is_provisional', false),
  ])

  if (primaryResult.error) throw primaryResult.error
  if (knownResult.error) throw knownResult.error
  if (clusterResult.error) throw clusterResult.error

  type CatRow = { id: string; name: string; photo_url: string | null; description: string | null; status: string; health_notes: string | null; sex: string | null; feeding_instructions: string | null; safety_notes: string | null }
  const byId = new Map<string, CatRow>()
  for (const cat of (primaryResult.data ?? []) as CatRow[]) byId.set(cat.id, cat)
  for (const row of knownResult.data ?? []) {
    const cat = (Array.isArray(row.cat) ? row.cat[0] : row.cat) as CatRow
    if (cat) byId.set(cat.id, cat)
  }
  for (const cat of (clusterResult.data ?? []) as CatRow[]) byId.set(cat.id, cat)

  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name))
}

export async function fetchCatsByStation(stationId: string) {
  return fetchCatsByStations([stationId])
}

export async function fetchCatsByIds(ids: string[]) {
  if (ids.length === 0) return []
  const supabase = createClient()
  const { data, error } = await supabase
    .from('cats')
    .select('id, name, photo_url, status, health_notes, sex, feeding_instructions, safety_notes')
    .in('id', ids)

  if (error) throw error
  return data ?? []
}

export async function fetchAllCats() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('cats')
    .select('id, name, photo_url, description, status, primary_station_id')
    .eq('is_active', true)
    // Same reasoning as fetchCatsByStation — a provisional cat shouldn't be pickable as a
    // "seen at this station too" guest cat either.
    .eq('is_provisional', false)
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function insertProvisionalCat(cat: {
  id: string
  name: string
  description: string | null
  primaryStationId: string | null
  createdBy: string
  photoUrl?: string | null
}) {
  const supabase = createClient()
  // ON CONFLICT DO NOTHING via ignoreDuplicates — makes this safe to retry after a partial
  // sync failure without creating duplicate cats. (Volunteers only have an INSERT policy on
  // `cats`, no UPDATE policy, so a real upsert-with-update would be rejected by RLS on retry.)
  const { error } = await supabase
    .from('cats')
    .upsert({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      primary_station_id: cat.primaryStationId,
      created_by: cat.createdBy,
      photo_url: cat.photoUrl ?? null,
      is_provisional: true,
      status: 'active',
    }, { onConflict: 'id', ignoreDuplicates: true })

  if (error) throw error
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg'
  const bytes = atob(data)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

export async function uploadCatPhoto(dataUrl: string, key: string): Promise<string> {
  const supabase = createClient()
  const path = `${key}.jpg`
  const { error } = await supabase.storage
    .from('cat-photos')
    .upload(path, dataUrlToBlob(dataUrl), { contentType: 'image/jpeg', upsert: true })
  if (error) throw error
  return supabase.storage.from('cat-photos').getPublicUrl(path).data.publicUrl
}
