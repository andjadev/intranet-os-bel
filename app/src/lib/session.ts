import { jwtVerify, SignJWT } from 'jose'

// Signed session cookie shared by the portal and the Payload admin.
// Kept free of Payload/Next imports so it can run inside proxy.ts.

export const SESSION_COOKIE = 'osbel_session'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

const secretKey = () => {
  const secret = process.env.AUTH_SECRET || process.env.PAYLOAD_SECRET
  if (!secret) throw new Error('AUTH_SECRET (or PAYLOAD_SECRET) is not set')
  return new TextEncoder().encode(secret)
}

export async function createSessionToken(userId: number | string): Promise<string> {
  // `ms`: issue time in milliseconds (`iat` only has seconds), compared with a password change.
  return new SignJWT({ uid: String(userId), ms: Date.now() })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey())
}

/** The user ID and issue time (milliseconds) of a valid session token. */
export async function readSession(token: string | undefined | null): Promise<{ uid: string; issuedAt: number } | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ['HS256'] })
    if (typeof payload.uid !== 'string') return null
    const issuedAt = typeof payload.ms === 'number' ? payload.ms : (payload.iat ?? 0) * 1000
    return { uid: payload.uid, issuedAt }
  } catch {
    return null
  }
}

export async function verifySessionToken(token: string | undefined | null): Promise<string | null> {
  return (await readSession(token))?.uid ?? null
}

export function readCookie(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined
  for (const part of cookieHeader.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return decodeURIComponent(v.join('='))
  }
  return undefined
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_MAX_AGE,
}
