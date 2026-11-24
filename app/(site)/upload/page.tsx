import type { Metadata } from 'next'
import { getAlbums } from '@/lib/photos'
import { requireAdmin } from '@/lib/session'
import { UploadForm } from './upload-form'

export const metadata: Metadata = { title: 'Upload photos' }

export default async function UploadPage() {
  await requireAdmin()
  const albums = await getAlbums()

  return (
    <div className="max-w-3xl pt-6 sm:pt-12">
      <h1 className="text-3xl">Upload photos</h1>
      <p className="mt-3 max-w-prose text-ink-soft">
        Photos are resized and their location data is removed before they leave this device.
      </p>
      <UploadForm albums={albums.map(a => ({ slug: a.slug, title: a.title }))} />
    </div>
  )
}
