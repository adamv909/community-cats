'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const TIMEOUT_MS = 10_000

function readHashError(): string | null {
  if (typeof window === 'undefined') return null
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const errorDescription = hashParams.get('error_description') || hashParams.get('error')
  return errorDescription ? errorDescription.replace(/\+/g, ' ') : null
}

export default function AuthCallbackPage() {
  const router = useRouter()
  const [timedOut, setTimedOut] = useState(false)
  // Magic links surface errors as URL params (e.g. #error=access_denied&error_description=...) —
  // read synchronously at mount via lazy initializer rather than an effect, since it's a plain
  // derivation of window.location that never needs to re-run.
  const [authError] = useState<string | null>(readHashError)

  useEffect(() => {
    if (authError) return

    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.replace('/home')
      }
    })

    const timer = setTimeout(() => setTimedOut(true), TIMEOUT_MS)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [router, authError])

  if (authError || timedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-xs">
          <p className="text-2xl mb-3">⚠️</p>
          <p className="text-sm font-medium mb-1">Couldn&apos;t sign you in</p>
          <p className="text-xs text-muted-foreground mb-5">
            {authError || 'This link may have expired or already been used.'}
          </p>
          <button
            onClick={() => router.replace('/signin')}
            className="text-sm font-semibold text-primary underline underline-offset-2"
          >
            Back to sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground text-sm">Signing you in…</p>
    </div>
  )
}
