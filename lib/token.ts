// Session token helpers. Pure (no Next.js imports) so the proxy, server code
// and tests can all use them.
import { SignJWT, jwtVerify } from 'jose'

export type Role = 'family' | 'admin'
export interface Session {
  role: Role
}

export const SESSION_COOKIE = 'cg_session'
export const SESSION_MAX_AGE = 90 * 24 * 60 * 60 // seconds

export interface AuthConfig {
  secret: string
  familyPassword: string
  adminPassword: string
}

export function authConfigFromEnv(env: Record<string, string | undefined> = process.env): AuthConfig {
  const secret = env.SESSION_SECRET
  const familyPassword = env.FAMILY_PASSWORD
  const adminPassword = env.ADMIN_PASSWORD
  const missing = Object.entries({ SESSION_SECRET: secret, FAMILY_PASSWORD: familyPassword, ADMIN_PASSWORD: adminPassword })
    .filter(([, v]) => !v)
    .map(([k]) => k)
  if (missing.length) throw new Error(`Missing environment variables: ${missing.join(', ')}`)
  if (secret!.length < 32) throw new Error('SESSION_SECRET must be at least 32 characters')
  if (familyPassword === adminPassword) throw new Error('FAMILY_PASSWORD and ADMIN_PASSWORD must differ')
  return { secret: secret!, familyPassword: familyPassword!, adminPassword: adminPassword! }
}

const encoder = new TextEncoder()

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(input))
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * A short fingerprint of the password a session was created with. Changing
 * FAMILY_PASSWORD or ADMIN_PASSWORD changes it, which signs out everyone
 * who logged in with the old one.
 */
async function passwordVersion(role: Role, config: AuthConfig): Promise<string> {
  const password = role === 'admin' ? config.adminPassword : config.familyPassword
  return (await sha256Hex(`${config.secret}:${role}:${password}`)).slice(0, 16)
}

/** Constant-time comparison via hashing both sides to equal-length digests. */
async function safeEqual(a: string, b: string): Promise<boolean> {
  const [ha, hb] = await Promise.all([sha256Hex(a), sha256Hex(b)])
  let diff = 0
  for (let i = 0; i < ha.length; i++) diff |= ha.charCodeAt(i) ^ hb.charCodeAt(i)
  return diff === 0
}

/** Which role (if any) a submitted password unlocks. */
export async function roleForPassword(password: string, config: AuthConfig): Promise<Role | null> {
  const [isAdmin, isFamily] = await Promise.all([
    safeEqual(password, config.adminPassword),
    safeEqual(password, config.familyPassword),
  ])
  if (isAdmin) return 'admin'
  if (isFamily) return 'family'
  return null
}

export async function signSession(role: Role, config: AuthConfig): Promise<string> {
  return new SignJWT({ role, pv: await passwordVersion(role, config) })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(encoder.encode(config.secret))
}

export async function verifySession(token: string | undefined, config: AuthConfig): Promise<Session | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, encoder.encode(config.secret), { algorithms: ['HS256'] })
    const role = payload.role
    if (role !== 'family' && role !== 'admin') return null
    if (payload.pv !== (await passwordVersion(role, config))) return null
    return { role }
  } catch {
    return null
  }
}
