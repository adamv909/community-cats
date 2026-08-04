'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Prevent static pre-rendering — this page always needs to run in the browser
export const dynamic = 'force-dynamic'

export default function SignInPage() {
  const searchParams = useSearchParams()
  const callbackError = searchParams.get('error')
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(callbackError)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        {/* Logo / title */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🐱</div>
          <h1 className="text-2xl font-semibold text-foreground">Cat Feeding Rounds</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to start your round</p>
        </div>

        {sent ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <div className="text-3xl mb-3">📧</div>
            <h2 className="font-semibold text-foreground mb-1">Check your email</h2>
            <p className="text-sm text-muted-foreground">
              We sent a sign-in link to <strong>{email}</strong>. Tap it to open the app.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoComplete="email"
                className="w-full h-14 rounded-xl border border-border bg-card px-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full h-14 rounded-xl bg-primary text-primary-foreground text-base font-semibold disabled:opacity-50 active:scale-[0.98] transition-transform"
            >
              {loading ? 'Sending…' : 'Send sign-in link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
