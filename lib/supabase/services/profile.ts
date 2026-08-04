import { createClient } from '@/lib/supabase/client'

export interface Profile {
  id: string
  display_name: string
  role: 'volunteer' | 'admin'
}

export async function fetchMyProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, role')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}
