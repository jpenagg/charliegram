'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { upload } from '@vercel/blob/client'
import { finishUpload } from '@/app/actions'
import { FULL_PREFIX, THUMB_PREFIX, albumTitle, buildPhotoName, slugify, wallClockMs } from '@/lib/paths'

const FULL_EDGE = 2560
const THUMB_EDGE = 800
const NEW = '__new__'

type Status = 'preparing' | 'ready' | 'uploading' | 'done' | 'error'
interface Item {
  key: string
  file: File
  status: Status
  progress: number
  previewUrl?: string
  thumb?: Blob
  takenMs?: number
  error?: string
}

interface Encoded {
  blob: Blob
  width: number
  height: number
}

// Drawing to a canvas and re-encoding drops all EXIF metadata, including GPS.
// createImageBitmap applies the EXIF orientation first, so photos stay upright.
async function encodeJpeg(bitmap: ImageBitmap, maxEdge: number, quality: number): Promise<Encoded> {
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height)
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', quality))
  if (!blob) throw new Error('encode failed')
  return { blob, width, height }
}

/** When the photo was taken, as camera wall-clock time (see lib/paths). */
async function readTakenMs(file: File): Promise<number> {
  try {
    const exifr = (await import('exifr')).default
    const tags = await exifr.parse(file, { pick: ['DateTimeOriginal', 'CreateDate'] })
    const date: unknown = tags?.DateTimeOriginal ?? tags?.CreateDate
    if (date instanceof Date && !Number.isNaN(date.getTime())) return wallClockMs(date)
  } catch {
    // No EXIF; fall through.
  }
  return wallClockMs(new Date(file.lastModified))
}

const UNREADABLE = 'This browser can’t open this file. iPhone HEIC photos work from Safari, or export them as JPEG.'

export function UploadForm({ albums }: { albums: { slug: string; title: string }[] }) {
  const router = useRouter()
  const [choice, setChoice] = useState(albums[0]?.slug ?? NEW)
  const [newName, setNewName] = useState('')
  const [items, setItems] = useState<Item[]>([])
  const [phase, setPhase] = useState<'pick' | 'uploading' | 'done'>('pick')
  const [result, setResult] = useState<{ album: string; uploaded: number; failed: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const urls = useRef(new Set<string>())

  // Free preview images when leaving the page.
  useEffect(() => {
    const created = urls.current
    return () => created.forEach(url => URL.revokeObjectURL(url))
  }, [])

  const album = choice === NEW ? slugify(newName) : choice
  const ready = items.filter(i => i.status === 'ready')
  const preparing = items.some(i => i.status === 'preparing')

  const update = (key: string, patch: Partial<Item>) =>
    setItems(prev => prev.map(i => (i.key === key ? { ...i, ...patch } : i)))

  async function addFiles(files: FileList | File[]) {
    const added: Item[] = Array.from(files)
      .filter(f => f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name))
      .map(file => ({ key: crypto.randomUUID(), file, status: 'preparing' as const, progress: 0 }))
    if (!added.length) return
    setItems(prev => [...prev, ...added])

    // Make previews one at a time to keep memory low on phones.
    for (const item of added) {
      try {
        const bitmap = await createImageBitmap(item.file)
        const thumb = await encodeJpeg(bitmap, THUMB_EDGE, 0.8)
        bitmap.close()
        const previewUrl = URL.createObjectURL(thumb.blob)
        urls.current.add(previewUrl)
        update(item.key, {
          status: 'ready',
          thumb: thumb.blob,
          previewUrl,
          takenMs: await readTakenMs(item.file),
        })
      } catch {
        update(item.key, { status: 'error', error: UNREADABLE })
      }
    }
  }

  function remove(item: Item) {
    if (item.previewUrl) {
      URL.revokeObjectURL(item.previewUrl)
      urls.current.delete(item.previewUrl)
    }
    setItems(prev => prev.filter(i => i.key !== item.key))
  }

  async function uploadAll() {
    if (!album || !ready.length) return
    setPhase('uploading')
    let uploaded = 0

    for (const item of ready) {
      update(item.key, { status: 'uploading', progress: 0 })
      try {
        const bitmap = await createImageBitmap(item.file)
        const full = await encodeJpeg(bitmap, FULL_EDGE, 0.88)
        bitmap.close()

        const rand = crypto.randomUUID().replace(/-/g, '').slice(0, 8)
        const name = buildPhotoName(item.takenMs!, full.width, full.height, rand)
        const options = { access: 'private' as const, contentType: 'image/jpeg', handleUploadUrl: '/api/upload' }

        // Thumbnail first: the gallery lists full-size photos, so a photo only
        // appears once both halves exist.
        await upload(`${THUMB_PREFIX}${album}/${name}`, item.thumb!, options)
        await upload(`${FULL_PREFIX}${album}/${name}`, full.blob, {
          ...options,
          onUploadProgress: ({ percentage }) => update(item.key, { progress: Math.round(percentage) }),
        })
        update(item.key, { status: 'done', progress: 100 })
        uploaded++
      } catch {
        update(item.key, { status: 'error', error: 'Upload failed. Check the connection and try again.' })
      }
    }

    if (uploaded) {
      await finishUpload(album)
      router.refresh()
    }
    setResult({ album, uploaded, failed: ready.length - uploaded })
    setPhase('done')
  }

  function startOver() {
    urls.current.forEach(url => URL.revokeObjectURL(url))
    urls.current.clear()
    setItems([])
    setResult(null)
    setPhase('pick')
    if (choice === NEW && result?.uploaded) setChoice(result.album)
  }

  if (phase === 'done' && result) {
    return (
      <div className="mt-10 rounded-lg border-2 border-rule bg-print p-6 sm:p-8">
        <h2 className="text-2xl">
          {result.uploaded
            ? `Uploaded ${result.uploaded} ${result.uploaded === 1 ? 'photo' : 'photos'} to ${albumTitle(result.album)}`
            : 'Nothing was uploaded'}
        </h2>
        {result.failed > 0 && (
          <p className="mt-2 text-danger">
            {result.failed} {result.failed === 1 ? 'photo' : 'photos'} didn’t upload. Pick them again to retry.
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          {result.uploaded > 0 && (
            <Link href={`/albums/${result.album}`} className="btn-primary">
              View the album
            </Link>
          )}
          <button type="button" onClick={startOver} className="btn-quiet">
            Upload more
          </button>
        </div>
      </div>
    )
  }

  const busy = phase === 'uploading'

  return (
    <div className="mt-10 space-y-10">
      <fieldset disabled={busy}>
        <legend className="font-serif text-xl">Album</legend>
        <div className="mt-4 flex flex-wrap gap-3">
          {albums.map(a => (
            <AlbumChoice key={a.slug} checked={choice === a.slug} onChange={() => setChoice(a.slug)}>
              {a.title}
            </AlbumChoice>
          ))}
          <AlbumChoice checked={choice === NEW} onChange={() => setChoice(NEW)}>
            New album
          </AlbumChoice>
        </div>
        {choice === NEW && (
          <div className="mt-4 max-w-sm">
            <label htmlFor="new-album" className="sr-only">
              New album name
            </label>
            <input
              id="new-album"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Name it, e.g. Spring soccer"
              className="field"
              autoFocus
            />
            {album && albums.some(a => a.slug === album) && (
              <p className="mt-2 text-ink-soft">That album already exists; photos will be added to it.</p>
            )}
          </div>
        )}
      </fieldset>

      <section aria-labelledby="photos-heading">
        <h2 id="photos-heading" className="text-xl">
          Photos
        </h2>
        <div
          onDragOver={e => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => {
            e.preventDefault()
            setDragging(false)
            if (!busy) void addFiles(e.dataTransfer.files)
          }}
          className={`mt-4 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
            dragging ? 'border-pitch bg-pitch/10' : 'border-rule'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            id="files"
            onChange={e => {
              if (e.target.files) void addFiles(e.target.files)
              e.target.value = ''
            }}
            disabled={busy}
          />
          <label htmlFor="files" className="btn-quiet cursor-pointer">
            Choose photos
          </label>
          <p className="mt-3 text-ink-soft">or drop them here</p>
        </div>

        {items.length > 0 && (
          <ul className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {items.map(item => (
              <li key={item.key} className="print relative">
                <div className="relative aspect-square overflow-hidden bg-rule">
                  {item.previewUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.previewUrl} alt={item.file.name} className="h-full w-full object-cover" />
                  )}
                  <StatusOverlay item={item} />
                </div>
                {(item.status === 'ready' || item.status === 'error') && !busy && (
                  <button
                    type="button"
                    onClick={() => remove(item)}
                    aria-label={`Remove ${item.file.name}`}
                    className="absolute -top-2 -right-2 grid size-9 cursor-pointer place-items-center rounded-full bg-ink text-linen"
                  >
                    <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4 fill-current">
                      <path d="M5.3 5.3a1 1 0 0 1 1.4 0L10 8.6l3.3-3.3a1 1 0 1 1 1.4 1.4L11.4 10l3.3 3.3a1 1 0 0 1-1.4 1.4L10 11.4l-3.3 3.3a1 1 0 0 1-1.4-1.4L8.6 10 5.3 6.7a1 1 0 0 1 0-1.4Z" />
                    </svg>
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        {items.some(i => i.status === 'error') && (
          <p className="mt-4 text-danger">{items.find(i => i.status === 'error')?.error}</p>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={uploadAll}
          disabled={busy || preparing || !ready.length || !album}
          className="btn-primary"
        >
          {busy
            ? 'Uploading…'
            : `Upload ${ready.length || ''} ${ready.length === 1 ? 'photo' : 'photos'}${album ? ` to ${albumTitle(album)}` : ''}`}
        </button>
        {!album && <p className="text-ink-soft">Give the new album a name first.</p>}
        {preparing && <p className="text-ink-soft">Getting photos ready…</p>}
      </div>
    </div>
  )
}

function AlbumChoice({
  checked,
  onChange,
  children,
}: {
  checked: boolean
  onChange: () => void
  children: React.ReactNode
}) {
  return (
    <label
      className={`inline-flex min-h-12 cursor-pointer items-center rounded-full border-2 px-5 font-bold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-pitch ${
        checked ? 'border-pitch bg-pitch text-pitch-ink' : 'border-rule text-ink hover:border-ink-soft'
      }`}
    >
      <input type="radio" name="album" checked={checked} onChange={onChange} className="sr-only" />
      {children}
    </label>
  )
}

function StatusOverlay({ item }: { item: Item }) {
  if (item.status === 'ready') return null
  const label =
    item.status === 'preparing'
      ? '…'
      : item.status === 'uploading'
        ? `${item.progress}%`
        : item.status === 'done'
          ? 'Done'
          : 'Can’t use'
  return (
    <div
      className={`absolute inset-0 grid place-items-center font-bold ${
        item.status === 'done' ? 'bg-pitch/70 text-pitch-ink' : 'bg-black/50 text-white'
      }`}
    >
      {label}
    </div>
  )
}
