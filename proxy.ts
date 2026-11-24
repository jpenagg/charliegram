import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE, authConfigFromEnv, verifySession } from './lib/token'

// First line of defense: bounce signed-out visitors to /login before any
// page renders. Pages, data access, server actions and route handlers all
// re-check the session themselves, so this is not the only gate.
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value, authConfigFromEnv())

  if (pathname === '/login') {
    return session ? NextResponse.redirect(new URL('/', request.url)) : NextResponse.next()
  }

  if (!session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
    }
    const login = new URL('/login', request.url)
    if (pathname !== '/') login.searchParams.set('next', pathname + search)
    return NextResponse.redirect(login)
  }

  if (pathname.startsWith('/upload') && session.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png).*)'],
}
