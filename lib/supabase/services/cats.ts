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

export async function fetchAllCats() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('cats')
    .select('id, name, photo_url, description, status, primary_station_id')
    .eq('is_active', true)
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
