import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 dark:text-gray-300"
        aria-label="Menu"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg flex flex-col">
            <div className="p-4 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-600 dark:text-gray-300"
                aria-label="Close menu"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <nav className="flex-1 px-6 py-4">
              <div className="space-y-6">
                <Link 
                  href="/milestones"
                  className="block text-lg font-mono text-gray-900 dark:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  milestones
                </Link>
                <Link 
                  href="/about"
                  className="block text-lg font-mono text-gray-900 dark:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  about
                </Link>
                {session && (
                  <Link
                    href="/admin/upload"
                    className="block text-lg font-mono text-gray-900 dark:text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    upload
                  </Link>
                )}
                {session ? (
                  <button
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                    className="block text-lg font-mono text-gray-900 dark:text-white"
                  >
                    logout
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      signIn();
                      setIsOpen(false);
                    }}
                    className="block text-lg font-mono text-gray-900 dark:text-white"
                  >
                    login
                  </button>
                )}
              </div>
            </nav>

            {/* Dark mode toggle at bottom */}
            <div className="border-t border-gray-200 dark:border-gray-800 p-6">
              <button
                onClick={() => {
                  setTheme(theme === 'dark' ? 'light' : 'dark');
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between text-gray-600 dark:text-gray-300"
              >
                <span className="font-mono text-lg">
                  {theme === 'dark' ? 'light mode' : 'dark mode'}
                </span>
                {theme === 'dark' ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 