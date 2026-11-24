import 'server-only'
import { unstable_cache } from 'next/cache'
import { list } from '@vercel/blob'
import { requireSession } from './session'
import { FULL_PREFIX, albumTitle, parsePhotoPath, type Album, type Photo } from './paths'

export const PHOTOS_TAG = 'photos'

// One Blob listing for the whole library, cached across requests and
// deployments. Uploads and deletes invalidate it via revalidateTag(PHOTOS_TAG).
// Not exported: callers go through the session-checked getters below.
const listAllPhotos = unstable_cache(
  async (): Promise<Photo[]> => {
    const photos: Photo[] = []
    let cursor: string | undefined
    do {
      const page = await list({ prefix: FULL_PREFIX, limit: 1000, cursor })
      for (const blob of page.blobs) {
        const photo = parsePhotoPath(blob.pathname)
        if (photo) photos.push(photo)
      }
      cursor = page.hasMore ? page.cursor : undefined
    } while (cursor)
    // Newest first.
    return photos.sort((a, b) => b.takenAt.localeCompare(a.takenAt))
  },
  ['blob-photos-v1'],
  { tags: [PHOTOS_TAG], revalidate: 3600 }
)

/** All albums, the most recently added-to first. */
export async function getAlbums(): Promise<Album[]> {
  await requireSession()
  const albums = new Map<string, Album>()
  for (const photo of await listAllPhotos()) {
    const album = albums.get(photo.album)
    if (!album) {
      albums.set(photo.album, {
        slug: photo.album,
        title: albumTitle(photo.album),
        count: 1,
        previews: [photo],
        latest: photo.takenAt,
      })
    } else {
      album.count++
      if (album.previews.length < 3) album.previews.push(photo)
    }
  }
  return [...albums.values()].sort((a, b) => b.latest.localeCompare(a.latest))
}

/** One album's photos, newest first, or null if it has none. */
export async function getAlbum(slug: string): Promise<{ title: string; photos: Photo[] } | null> {
  await requireSession()
  const photos = (await listAllPhotos()).filter(p => p.album === slug)
  return photos.length ? { title: albumTitle(slug), photos } : null
}
