import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  authConfigFromEnv,
  signSession,
  verifySession,
  type Role,
  type Session,
} from './token'

/** The current viewer's session, or null. Deduplicated per request. */
export const getSession = cache(async (): Promise<Session | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  return verifySession(token, authConfigFromEnv())
})

/** For pages and data access: redirects to /login if not signed in. */
export async function requireSession(): Promise<Session> {
  const session = await getSession()
  if (!session) redirect('/login')
  return session
}

/** For admin-only pages: non-admins go back to the albums. */
export async function requireAdmin(): Promise<Session> {
  const session = await requireSession()
  if (session.role !== 'admin') redirect('/')
  return session
}

export async function createSession(role: Role) {
  const token = await signSession(role, authConfigFromEnv())
  ;(await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
}

export async function deleteSession() {
  ;(await cookies()).delete(SESSION_COOKIE)
}
