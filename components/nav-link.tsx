'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const navLinkClass =
  'cursor-pointer rounded-md px-2 py-2 text-ink-soft underline-offset-4 hover:text-ink hover:underline'

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const current = href === '/' ? pathname === '/' || pathname.startsWith('/albums') : pathname.startsWith(href)
  return (
    <Link
      href={href}
      aria-current={current ? 'page' : undefined}
      className={`${navLinkClass} aria-[current=page]:text-ink aria-[current=page]:underline aria-[current=page]:decoration-pitch aria-[current=page]:decoration-2`}
    >
      {children}
    </Link>
  )
}
