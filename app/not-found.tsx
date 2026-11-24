import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto max-w-prose px-4 py-24 sm:px-8">
      <h1 className="text-3xl">This page isn&apos;t in the album</h1>
      <p className="mt-4 text-ink-soft">The link may be old, or the photos may have moved to another album.</p>
      <Link href="/" className="btn-primary mt-8">
        See all albums
      </Link>
    </main>
  )
}
