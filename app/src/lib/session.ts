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
  return new SignJWT({ uid: String(userId) })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey())
}

export async function verifySessionToken(token: string | undefined | null): Promise<string | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ['HS256'] })
    return typeof payload.uid === 'string' ? payload.uid : null
  } catch {
    return null
  }
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
