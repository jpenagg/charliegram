'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { deletePhoto } from '@/app/actions'
import { formatDay, type Photo } from '@/lib/paths'

interface Props {
  photos: Photo[]
  index: number
  onShow: (index: number) => void
  onClose: () => void
  isAdmin: boolean
  onDeleted: (id: string) => void
}

const SWIPE_PX = 50

export function PhotoViewer({ photos, index, onShow, onClose, isAdmin, onDeleted }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const swipeStart = useRef<{ x: number; y: number } | null>(null)
  const [deleting, startDelete] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const photo = photos[index]
  const hasPrev = index > 0
  const hasNext = index < photos.length - 1
  const prev = () => hasPrev && onShow(index - 1)
  const next = () => hasNext && onShow(index + 1)

  // Native <dialog>: focus trap, Esc and an inert page come for free.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    dialog.showModal()
    const root = document.documentElement
    const overflow = root.style.overflow
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = overflow
      dialog.close()
    }
  }, [])

  // Warm the browser cache for the neighbors so arrows feel instant.
  useEffect(() => {
    for (const neighbor of [photos[index - 1], photos[index + 1]]) {
      if (neighbor) new Image().src = neighbor.src
    }
  }, [photos, index])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') prev()
    if (e.key === 'ArrowRight') next()
  }

  const handleDelete = () => {
    if (!confirm('Delete this photo for everyone? This can’t be undone.')) return
    setError(null)
    startDelete(async () => {
      try {
        await deletePhoto(photo.id)
        onDeleted(photo.id)
      } catch {
        setError('Couldn’t delete the photo. Try again.')
      }
    })
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label={`Photo ${index + 1} of ${photos.length}`}
      onCancel={e => {
        e.preventDefault()
        onClose()
      }}
      onKeyDown={handleKeyDown}
      className="m-0 h-dvh max-h-none w-full max-w-none bg-[#14120f] p-0 text-[#eee6d8] backdrop:bg-black/80"
    >
      <div className="flex h-full flex-col">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
          <p>
            <span className="font-bold">
              {index + 1} of {photos.length}
            </span>
            <span className="ml-3 text-[#eee6d8]/70">{formatDay(photo.takenAt)}</span>
          </p>
          <div className="flex items-center gap-2">
            <a href={`${photo.src}?download`} className={chromeButton} download>
              Download
            </a>
            {isAdmin && (
              <button type="button" onClick={handleDelete} disabled={deleting} className={chromeButton}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            )}
            <button type="button" onClick={onClose} className={chromeButton} autoFocus>
              <svg aria-hidden="true" viewBox="0 0 20 20" className="size-5 fill-current">
                <path d="M5.3 5.3a1 1 0 0 1 1.4 0L10 8.6l3.3-3.3a1 1 0 1 1 1.4 1.4L11.4 10l3.3 3.3a1 1 0 0 1-1.4 1.4L10 11.4l-3.3 3.3a1 1 0 0 1-1.4-1.4L8.6 10 5.3 6.7a1 1 0 0 1 0-1.4Z" />
              </svg>
              Close
            </button>
          </div>
          {error && (
            <p role="alert" className="w-full text-[#f08a7e]">
              {error}
            </p>
          )}
        </div>

        <div
          className="relative flex min-h-0 flex-1 touch-pan-y items-center justify-center px-2 pb-2 select-none sm:px-20 sm:pb-6"
          onPointerDown={e => (swipeStart.current = { x: e.clientX, y: e.clientY })}
          onPointerUp={e => {
            const start = swipeStart.current
            swipeStart.current = null
            if (!start) return
            const dx = e.clientX - start.x
            if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(e.clientY - start.y)) {
              if (dx < 0) next()
              else prev()
            }
          }}
        >
          <Slide key={photo.id} photo={photo} />

          <NavButton side="left" label="Previous photo" onClick={prev} disabled={!hasPrev} />
          <NavButton side="right" label="Next photo" onClick={next} disabled={!hasNext} />
        </div>

        {/* On phones, big labelled buttons as well as swiping. */}
        <div className="grid grid-cols-2 gap-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:hidden">
          <button type="button" onClick={prev} disabled={!hasPrev} className={`${chromeButton} justify-center bg-white/10`}>
            Previous
          </button>
          <button type="button" onClick={next} disabled={!hasNext} className={`${chromeButton} justify-center bg-white/10`}>
            Next
          </button>
        </div>
      </div>
    </dialog>
  )
}

const chromeButton =
  'inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full px-4 font-bold hover:bg-white/10 disabled:opacity-60'

/** Shows the (already cached) thumbnail until the full-size image arrives. */
function Slide({ photo }: { photo: Photo }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <div
      className="relative max-h-full max-w-full"
      style={{ aspectRatio: `${photo.width} / ${photo.height}`, height: '100%' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.thumb} alt="" className="absolute inset-0 h-full w-full object-contain" draggable={false} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.src}
        alt={`Photo from ${formatDay(photo.takenAt)}`}
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        draggable={false}
      />
    </div>
  )
}

function NavButton({
  side,
  label,
  onClick,
  disabled,
}: {
  side: 'left' | 'right'
  label: string
  onClick: () => void
  disabled: boolean
}) {
  if (disabled) return null
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 hidden size-14 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-black/40 hover:bg-black/60 sm:grid ${
        side === 'left' ? 'left-3' : 'right-3'
      }`}
    >
      <svg aria-hidden="true" viewBox="0 0 20 20" className={`size-7 fill-current ${side === 'right' ? 'rotate-180' : ''}`}>
        <path d="M12.7 4.3a1 1 0 0 1 0 1.4L8.4 10l4.3 4.3a1 1 0 0 1-1.4 1.4l-5-5a1 1 0 0 1 0-1.4l5-5a1 1 0 0 1 1.4 0Z" />
      </svg>
    </button>
  )
}
