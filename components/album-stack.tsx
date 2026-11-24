import Link from 'next/link'
import type { Album } from '@/lib/paths'

// An album shown as a small pile of prints: the newest photo on top, the
// next two peeking out underneath. Hover or focus fans the pile out.
export function AlbumStack({ album, priority }: { album: Album; priority?: boolean }) {
  const [top, second, third] = album.previews

  return (
    <Link href={`/albums/${album.slug}`} className="stack group block rounded-md focus-visible:outline-offset-8">
      <div className="relative mx-auto aspect-[4/5] w-[86%]">
        {third && <Print src={third.thumb} className="layer layer-3" />}
        {second && <Print src={second.thumb} className="layer layer-2" />}
        <Print src={top.thumb} className="layer layer-1" priority={priority} />
      </div>
      <h2 className="mt-5 text-lg text-ink group-hover:underline group-hover:underline-offset-4 sm:mt-6 sm:text-xl">
        {album.title}
      </h2>
      <p className="text-ink-soft">
        {album.count} {album.count === 1 ? 'photo' : 'photos'}
      </p>
    </Link>
  )
}

function Print({ src, className, priority }: { src: string; className: string; priority?: boolean }) {
  return (
    <div className={`print absolute inset-0 ${className}`}>
      {/* Private photos come from our own route, so next/image optimization doesn't apply. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className="h-full w-full bg-rule object-cover"
      />
    </div>
  )
}
