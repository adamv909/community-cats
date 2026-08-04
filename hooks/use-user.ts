'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const DEV_USER = { id: 'dev-user-00000000-0000-0000-0000-000000000000' } as User

export function useUser() {
  const [user, setUser] = useState<User | null>(
    process.env.NEXT_PUBLIC_SKIP_AUTH === 'true' ? DEV_USER : null
  )
  const [loading, setLoading] = useState(process.env.NEXT_PUBLIC_SKIP_AUTH !== 'true')

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SKIP_AUTH === 'true') return
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })
  }, [])

  return { user, loading }
}
