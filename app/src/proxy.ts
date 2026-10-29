import { NextResponse, type NextRequest } from 'next/server'

import { SESSION_COOKIE, verifySessionToken } from './lib/session'

const PUBLIC = ['/login', '/auth/', '/_next/', '/favicon']

// Payload's own password endpoints. Sign-in goes through /auth/password (one session cookie for
// everything); first-register would let anyone create the first user (with any role) on an empty
// database; there is no e-mail for password resets.
const BLOCKED_API = ['/api/users/login', '/api/users/first-register', '/api/users/forgot-password', '/api/users/reset-password']

// Portal language cookie (lib/constants LANG_COOKIE) → Payload admin language code.
const LANG_COOKIE = 'osbel_lang'
const ADMIN_LANG_COOKIE = 'payload-lng'
const ADMIN_LANGS: Record<string, string> = { sr: 'rs', en: 'en', de: 'de' }

/**
 * Every page requires a signed-in colleague. Payload's REST/GraphQL API under
 * /api enforces its own access rules, so it is left alone here.
 */
export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  // Payload's own login/logout screens are replaced by the Microsoft flow.
  if (pathname === '/admin/login' || pathname === '/admin/create-first-user') {
    return NextResponse.redirect(new URL('/login?next=/admin', req.url))
  }
  if (pathname === '/admin/logout') return NextResponse.redirect(new URL('/auth/logout', req.url))
  if (BLOCKED_API.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return new NextResponse('Not found', { status: 404 })
  }

  if (pathname.startsWith('/api/') || PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next()

  const uid = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value)
  if (!uid) {
    const login = new URL('/login', req.url)
    if (pathname !== '/') login.searchParams.set('next', pathname + search)
    return NextResponse.redirect(login)
  }

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const lang = ADMIN_LANGS[req.cookies.get(LANG_COOKIE)?.value ?? 'sr'] ?? 'rs'
    if (req.cookies.get(ADMIN_LANG_COOKIE)?.value !== lang) {
      req.cookies.set(ADMIN_LANG_COOKIE, lang)
      const res = NextResponse.next({ request: { headers: req.headers } })
      res.cookies.set(ADMIN_LANG_COOKIE, lang, { path: '/', sameSite: 'lax' })
      return res
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\.(?:ico|png|svg|jpg|jpeg|webp|woff2?)$).*)'],
}
