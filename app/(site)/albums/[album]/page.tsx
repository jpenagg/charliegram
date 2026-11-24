import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PhotoGallery } from '@/components/photo-gallery'
import { ALBUM_SLUG_RE, albumTitle } from '@/lib/paths'
import { getAlbum } from '@/lib/photos'
import { getSession } from '@/lib/session'

type Props = { params: Promise<{ album: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { album } = await params
  return { title: ALBUM_SLUG_RE.test(album) ? albumTitle(album) : 'Album' }
}

export default async function AlbumPage({ params }: Props) {
  const { album: slug } = await params
  if (!ALBUM_SLUG_RE.test(slug)) notFound()

  const [album, session] = await Promise.all([getAlbum(slug), getSession()])
  if (!album) notFound()

  return (
    <>
      <div className="pt-4 pb-8 sm:pt-8">
        <Link href="/" className="-mx-2 inline-flex items-center gap-1 rounded-md px-2 py-2 text-ink-soft hover:text-ink">
          <svg aria-hidden="true" viewBox="0 0 20 20" className="size-5 fill-current">
            <path d="M12.7 4.3a1 1 0 0 1 0 1.4L8.4 10l4.3 4.3a1 1 0 0 1-1.4 1.4l-5-5a1 1 0 0 1 0-1.4l5-5a1 1 0 0 1 1.4 0Z" />
          </svg>
          All albums
        </Link>
        <h1 className="mt-2 text-3xl">{album.title}</h1>
        <p className="mt-1 text-ink-soft">
          {album.photos.length} {album.photos.length === 1 ? 'photo' : 'photos'}
        </p>
      </div>

      <PhotoGallery photos={album.photos} isAdmin={session?.role === 'admin'} />
    </>
  )
}
