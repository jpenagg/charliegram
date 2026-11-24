import { get } from '@vercel/blob'
import { getSession } from '@/lib/session'
import { BLOB_PATH_RE } from '@/lib/paths'

// Streams a private blob to a signed-in viewer. Add ?download to save it.
export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  if (!(await getSession())) {
    return new Response('Sign in required', { status: 401 })
  }

  const pathname = (await params).path.join('/')
  if (!BLOB_PATH_RE.test(pathname)) {
    return new Response('Not found', { status: 404 })
  }

  let result: Awaited<ReturnType<typeof get>>
  try {
    result = await get(pathname, {
      access: 'private',
      ifNoneMatch: request.headers.get('if-none-match') ?? undefined,
    })
  } catch (error) {
    console.error(`Blob fetch failed for ${pathname}:`, (error as Error).message)
    return new Response('Photo unavailable', { status: 502 })
  }
  if (!result) {
    return new Response('Not found', { status: 404 })
  }

  const headers = new Headers({
    // Photos never change after upload. Let the viewer's browser keep them,
    // but never a shared cache.
    'Cache-Control': 'private, max-age=31536000, immutable',
    ETag: result.blob.etag,
  })

  if (result.statusCode === 304) {
    return new Response(null, { status: 304, headers })
  }

  headers.set('Content-Type', result.blob.contentType)
  headers.set('Content-Length', String(result.blob.size))
  if (new URL(request.url).searchParams.has('download')) {
    headers.set('Content-Disposition', `attachment; filename="${pathname.split('/').pop()}"`)
  }

  return new Response(result.stream, { headers })
}
