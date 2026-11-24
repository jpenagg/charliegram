import { NextResponse } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { getSession } from '@/lib/session'
import { BLOB_PATH_RE } from '@/lib/paths'

// The browser uploads straight to Vercel Blob, which avoids the 4.5 MB
// function body limit. This route only hands out short-lived upload tokens,
// and only to the admin.
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HandleUploadBody
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async pathname => {
        if ((await getSession())?.role !== 'admin') throw new Error('Only the admin can upload.')
        if (!BLOB_PATH_RE.test(pathname)) throw new Error('Invalid photo path.')
        return {
          allowedContentTypes: ['image/jpeg'],
          maximumSizeInBytes: 20 * 1024 * 1024,
          addRandomSuffix: false,
        }
      },
    })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
