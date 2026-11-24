'use client'

import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { formatMonth, type Photo } from '@/lib/paths'
import { PhotoViewer } from './photo-viewer'

// The open photo lives in the URL (?photo=<name>) so links can be shared
// within the family and the phone's back button closes the viewer.
const URL_EVENT = 'cg:urlchange'
function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange)
  window.addEventListener(URL_EVENT, onChange)
  return () => {
    window.removeEventListener('popstate', onChange)
    window.removeEventListener(URL_EVENT, onChange)
  }
}
const getSearch = () => window.location.search
const getServerSearch = () => ''

function setPhotoParam(name: string | null, mode: 'push' | 'replace') {
  const url = new URL(window.location.href)
  if (name) url.searchParams.set('photo', name)
  else url.searchParams.delete('photo')
  window.history[mode === 'push' ? 'pushState' : 'replaceState'](window.history.state, '', url)
  window.dispatchEvent(new Event(URL_EVENT))
}

export function PhotoGallery({ photos, isAdmin }: { photos: Photo[]; isAdmin: boolean }) {
  const router = useRouter()
  const [removed, setRemoved] = useState<ReadonlySet<string>>(new Set())
  const pushedRef = useRef(false)

  const visible = useMemo(() => photos.filter(p => !removed.has(p.id)), [photos, removed])
  const sections = useMemo(() => groupByMonth(visible), [visible])

  const search = useSyncExternalStore(subscribe, getSearch, getServerSearch)
  const openName = new URLSearchParams(search).get('photo')
  const openIndex = openName ? visible.findIndex(p => p.name === openName) : -1

  const open = (photo: Photo) => {
    pushedRef.current = true
    setPhotoParam(photo.name, 'push')
  }

  const show = useCallback((index: number) => setPhotoParam(visible[index].name, 'replace'), [visible])

  const close = useCallback(() => {
    if (pushedRef.current) {
      pushedRef.current = false
      window.history.back()
    } else {
      setPhotoParam(null, 'replace')
    }
  }, [])

  const handleDeleted = useCallback(
    (id: string) => {
      const index = visible.findIndex(p => p.id === id)
      const neighbor = visible[index + 1] ?? visible[index - 1]
      setRemoved(prev => new Set(prev).add(id))
      if (neighbor) setPhotoParam(neighbor.name, 'replace')
      else close()
      router.refresh()
    },
    [visible, close, router]
  )

  return (
    <>
      <div className="space-y-12">
        {sections.map(section => (
          <section key={section.label} aria-labelledby={`m-${section.key}`}>
            <h2 id={`m-${section.key}`} className="mb-4 text-xl">
              {section.label}
            </h2>
            {/* Justified rows: each print grows in proportion to its aspect ratio,
                so every image in a row ends up exactly var(--row) + slack tall. */}
            <ul className="flex flex-wrap gap-2 [--row:8.5rem] sm:gap-4 sm:[--row:12rem] lg:[--row:15rem]">
              {section.photos.map(({ photo, index }) => {
                const ratio = photo.width / photo.height
                return (
                  <li
                    key={photo.id}
                    style={{ flexGrow: ratio, flexBasis: `calc(var(--row) * ${ratio} + 2 * var(--mat))` }}
                  >
                    <button
                      type="button"
                      onClick={() => open(photo)}
                      className="print block w-full cursor-zoom-in"
                      aria-label={`Open photo ${index + 1} of ${visible.length}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.thumb}
                        alt=""
                        width={photo.width}
                        height={photo.height}
                        loading={index < 8 ? 'eager' : 'lazy'}
                        decoding="async"
                        className="block h-auto w-full bg-rule"
                      />
                    </button>
                  </li>
                )
              })}
              {/* Soaks up the last row's spare width so it isn't blown up. */}
              <li aria-hidden="true" className="grow-[1000]" />
            </ul>
          </section>
        ))}
      </div>

      {openIndex >= 0 && (
        <PhotoViewer
          photos={visible}
          index={openIndex}
          onShow={show}
          onClose={close}
          isAdmin={isAdmin}
          onDeleted={handleDeleted}
        />
      )}
    </>
  )
}

interface Section {
  key: string
  label: string
  photos: { photo: Photo; index: number }[]
}

function groupByMonth(photos: Photo[]): Section[] {
  const sections: Section[] = []
  photos.forEach((photo, index) => {
    const key = photo.takenAt.slice(0, 7)
    let section = sections[sections.length - 1]
    if (section?.key !== key) {
      section = { key, label: formatMonth(photo.takenAt), photos: [] }
      sections.push(section)
    }
    section.photos.push({ photo, index })
  })
  return sections
}
