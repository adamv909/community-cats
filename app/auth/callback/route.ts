import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/home'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // On Vercel, use x-forwarded-host to get the public domain
      const forwardedHost = request.headers.get('x-forwarded-host')
      const base = forwardedHost ? `https://${forwardedHost}` : origin
      return NextResponse.redirect(`${base}${next}`)
    }
    // Redirect to signin with the actual error message for debugging
    const msg = encodeURIComponent(error.message ?? 'unknown error')
    const forwardedHost = request.headers.get('x-forwarded-host')
    const base = forwardedHost ? `https://${forwardedHost}` : origin
    return NextResponse.redirect(`${base}/signin?error=${msg}`)
  }

  return NextResponse.redirect(`${origin}/signin?error=No+code+provided`)
}
