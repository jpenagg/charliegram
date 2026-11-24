import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'About' }

export default function AboutPage() {
  return (
    <article className="max-w-[34rem] pt-6 sm:pt-12">
      <h1 className="text-3xl">About this album</h1>
      <div className="mt-8 space-y-5 text-lg leading-relaxed">
        <p>
          This is where we keep the photos we want the family to see: soccer games, trips, birthdays, and plenty of
          ordinary days in between. New albums show up here as we add them.
        </p>
        <p>
          The site is private on purpose. Please don&apos;t share the password, and ask before posting any of these
          photos somewhere else.
        </p>
        <p className="text-ink-soft">
          To save a photo, open it and choose Download. To see what&apos;s new, start with the first album; the most
          recently updated one is always first.
        </p>
      </div>
    </article>
  )
}
