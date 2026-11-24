// Blob naming scheme, shared by server and client. No server imports here.
//
//   photos/<album>/<takenMs>-<rand>-<w>x<h>.jpg   full size, long edge <= 2560px
//   thumbs/<album>/<takenMs>-<rand>-<w>x<h>.jpg   grid size, long edge <= 800px
//
// takenMs is the camera's wall-clock time stored *as if* it were UTC (EXIF
// has no time zone). Always format it with timeZone 'UTC' (see formatDate);
// that keeps dates as the photographer saw them and identical on server and
// client.
//
// Encoding the capture time and dimensions in the name means the gallery
// needs no database: one Blob listing has everything required to sort and
// lay out photos without layout shift.

export const FULL_PREFIX = 'photos/'
export const THUMB_PREFIX = 'thumbs/'

const SLUG = '[a-z0-9]+(?:-[a-z0-9]+)*'
export const ALBUM_SLUG_RE = new RegExp(`^${SLUG}$`)
const NAME = '(\\d{10,16})-([a-z0-9]{8})-(\\d{1,5})x(\\d{1,5})\\.jpg'
export const BLOB_PATH_RE = new RegExp(`^(photos|thumbs)/(${SLUG})/(${NAME})$`)

export interface Photo {
  /** Full-size blob pathname; the stable id for a photo. */
  id: string
  /** File name without folders; used in URLs (?photo=...). */
  name: string
  album: string
  src: string
  thumb: string
  width: number
  height: number
  takenAt: string
}

export interface Album {
  slug: string
  title: string
  count: number
  /** Newest first, up to 3, for the cover stack. */
  previews: Photo[]
  latest: string
}

export function parsePhotoPath(pathname: string): Photo | null {
  const m = BLOB_PATH_RE.exec(pathname)
  if (!m || m[1] !== 'photos') return null
  const [, , album, name, taken, , w, h] = m
  const width = Number(w)
  const height = Number(h)
  if (!width || !height) return null
  return {
    id: pathname,
    name,
    album,
    src: mediaUrl(pathname),
    thumb: mediaUrl(`${THUMB_PREFIX}${album}/${name}`),
    width,
    height,
    takenAt: new Date(Number(taken)).toISOString(),
  }
}

export function buildPhotoName(takenMs: number, width: number, height: number, rand: string): string {
  return `${Math.round(takenMs)}-${rand}-${width}x${height}.jpg`
}

export const thumbPathFor = (id: string) => THUMB_PREFIX + id.slice(FULL_PREFIX.length)

/** Photos are private; the browser loads them through the session-checked route. */
export const mediaUrl = (pathname: string) => `/api/photo/${pathname}`

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
    .replace(/-+$/, '')

/** Wall-clock time of a local Date, encoded as UTC milliseconds. */
export const wallClockMs = (d: Date) =>
  Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds())

const monthFmt = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
const dayFmt = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})
export const formatMonth = (iso: string) => monthFmt.format(new Date(iso))
export const formatDay = (iso: string) => dayFmt.format(new Date(iso))

export const albumTitle = (slug: string) =>
  slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
