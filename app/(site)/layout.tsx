import Link from 'next/link'
import { NavLink, navLinkClass } from '@/components/nav-link'
import { requireSession } from '@/lib/session'
import { logout } from '../actions'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession()

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 pt-6 pb-4 sm:px-8 sm:pt-10">
        <Link href="/" className="font-serif text-2xl text-ink">
          charliegram
        </Link>
        <nav aria-label="Main" className="-mx-2 flex flex-wrap items-center gap-x-2">
          <NavLink href="/">Albums</NavLink>
          <NavLink href="/about">About</NavLink>
          {session.role === 'admin' && <NavLink href="/upload">Upload</NavLink>}
          <form action={logout}>
            <button type="submit" className={navLinkClass}>
              Sign out
            </button>
          </form>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 sm:px-8">{children}</main>

      <footer className="mx-auto w-full max-w-6xl px-4 py-8 text-ink-soft sm:px-8">
        <p>
          Made with love by Papa<span className="cursor" aria-hidden="true">_</span>
        </p>
      </footer>
    </div>
  )
}
