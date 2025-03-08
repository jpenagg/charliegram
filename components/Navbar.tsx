import Link from "next/link";
import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useSession, signIn, signOut } from 'next-auth/react';
import MobileNav from "./MobileNav";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  return (
    <>
      {/* Mobile menu - only visible on smallest screens */}
      <div className="sm:hidden fixed top-3 right-3 z-50">
        <MobileNav />
      </div>

      <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 z-30 border-b dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl sm:text-3xl font-bold font-mono flex items-center">
              <span>charliegram</span>
              <span className="ml-1 animate-pulse">_</span>
            </Link>
            <div className="hidden sm:flex items-center space-x-4">
              <Link 
                href="/milestones"
                className="font-mono text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                $ milestones
              </Link>
              <Link 
                href="/about"
                className="font-mono text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                $ about
              </Link>
              {session && (
                <Link 
                  href="/admin/upload"
                  className="font-mono text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  $ upload
                </Link>
              )}
              {session ? (
                <button
                  onClick={() => signOut({ 
                    callbackUrl: '/?message=logged_out'
                  })}
                  className="font-mono text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  $ logout
                </button>
              ) : (
                <button
                  onClick={() => signIn()}
                  className="font-mono text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  $ login
                </button>
              )}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
} 