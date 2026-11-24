'use server'

import { redirect } from 'next/navigation'
import { revalidateTag } from 'next/cache'
import { del } from '@vercel/blob'
import { createSession, deleteSession, getSession } from '@/lib/session'
import { authConfigFromEnv, roleForPassword } from '@/lib/token'
import { ALBUM_SLUG_RE, BLOB_PATH_RE, FULL_PREFIX, thumbPathFor } from '@/lib/paths'
import { PHOTOS_TAG } from '@/lib/photos'

export interface LoginState {
  error?: string
}

/** Only follow same-site, path-only redirects. */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === 'string' ? value : ''
  return next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\') ? next : '/'
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get('password') ?? '')
  const role = password ? await roleForPassword(password, authConfigFromEnv()) : null

  if (!role) {
    // Slow down guessing a little.
    await new Promise(resolve => setTimeout(resolve, 800))
    return { error: "That password didn't match. Check with the family for the current one." }
  }

  await createSession(role)
  redirect(safeNext(formData.get('next')))
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}

async function assertAdmin() {
  const session = await getSession()
  if (session?.role !== 'admin') throw new Error('Only the admin can change photos.')
}

export async function deletePhoto(id: string) {
  await assertAdmin()
  if (!id.startsWith(FULL_PREFIX) || !BLOB_PATH_RE.test(id)) throw new Error('Unknown photo.')
  await del([id, thumbPathFor(id)])
  revalidateTag(PHOTOS_TAG, { expire: 0 })
}

/** Called by the upload page once all files are in Blob. */
export async function finishUpload(album: string) {
  await assertAdmin()
  if (!ALBUM_SLUG_RE.test(album)) throw new Error('Unknown album.')
  revalidateTag(PHOTOS_TAG, { expire: 0 })
}
