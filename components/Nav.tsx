import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useSession, signOut } from 'next-auth/react'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'

export default function Nav() {
  const { theme, setTheme } = useTheme()
  const { data: session } = useSession()

  return (
    <nav className="fixed top-0 w-full bg-white dark:bg-gray-900 z-30 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-mono font-bold text-gray-900 dark:text-white">
              charliegram_
            </Link>
            <div className="hidden sm:flex items-center gap-6">
              <Link
                href="/milestones"
                className="font-mono text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                $ milestones
              </Link>
              <Link
                href="/about"
                className="font-mono text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                $ about
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {session ? (
              <>
                <Link 
                  href="/admin/upload"
                  className="font-mono text-sm text-green-500 hover:text-green-600"
                >
                  $ upload_photo
                </Link>
                <button
                  onClick={() => signOut()}
                  className="font-mono text-sm text-red-500 hover:text-red-600"
                >
                  $ logout
                </button>
              </>
            ) : (
              <Link 
                href="/auth/login"
                className="font-mono text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                $ login
              </Link>
            )}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <SunIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <MoonIcon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}