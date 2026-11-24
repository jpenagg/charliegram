import Link from 'next/link'
import { AlbumStack } from '@/components/album-stack'
import { getAlbums } from '@/lib/photos'
import { getSession } from '@/lib/session'

export default async function AlbumsPage() {
  const [albums, session] = await Promise.all([getAlbums(), getSession()])

  if (albums.length === 0) {
    return (
      <section className="max-w-prose pt-10">
        <h1 className="text-2xl">No albums yet</h1>
        {session?.role === 'admin' ? (
          <>
            <p className="mt-3 text-ink-soft">Upload some photos and they&apos;ll show up here as albums.</p>
            <Link href="/upload" className="btn-primary mt-6">
              Upload photos
            </Link>
          </>
        ) : (
          <p className="mt-3 text-ink-soft">Photos will show up here as soon as they&apos;re added.</p>
        )}
      </section>
    )
  }

  return (
    <>
      <h1 className="sr-only">Albums</h1>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-12 pt-6 sm:gap-x-12 sm:gap-y-16 sm:pt-10 lg:grid-cols-3">
        {albums.map((album, i) => (
          <li key={album.slug}>
            <AlbumStack album={album} priority={i < 3} />
          </li>
        ))}
      </ul>
    </>
  )
}
