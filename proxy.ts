import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) =>
          cookies.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          ),
      },
    }
  )

  const { pathname } = request.nextUrl

  // Public routes — always accessible
  if (pathname.startsWith('/signin')) return response
  if (pathname.startsWith('/auth/callback')) return response

  // Dev bypass — skip auth when SKIP_AUTH=true in .env.local (never set in production)
  if (process.env.SKIP_AUTH === 'true') return response

  const { data: { user } } = await supabase.auth.getUser()

  // If Supabase redirected here with an auth code, forward it to the callback handler
  const code = request.nextUrl.searchParams.get('code')
  if (code && !user) {
    const callbackUrl = new URL('/auth/callback', request.url)
    callbackUrl.searchParams.set('code', code)
    callbackUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(callbackUrl)
  }

  // Everything else requires authentication
  if (!user) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|manifest.json).*)'],
}
