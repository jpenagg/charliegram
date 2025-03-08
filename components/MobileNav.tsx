import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
      >
        <div className="space-y-1.5">
          <div className="w-6 h-0.5 bg-gray-600 dark:bg-gray-300"></div>
          <div className="w-6 h-0.5 bg-gray-600 dark:bg-gray-300"></div>
          <div className="w-6 h-0.5 bg-gray-600 dark:bg-gray-300"></div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <Link
              href="/milestones"
              className="block px-4 py-2 text-sm font-mono text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <span className="text-green-500">$</span> milestones
            </Link>
            <Link
              href="/about"
              className="block px-4 py-2 text-sm font-mono text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <span className="text-green-500">$</span> about
            </Link>
            {session && (
              <Link
                href="/admin/upload"
                className="block px-4 py-2 text-sm font-mono text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                <span className="text-green-500">$</span> upload
              </Link>
            )}
            {session ? (
              <button
                onClick={() => {
                  signOut({ 
                    callbackUrl: '/?message=logged_out'
                  });
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm font-mono text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <span className="text-green-500">$</span> logout
              </button>
            ) : (
              <button
                onClick={() => {
                  signIn();
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm font-mono text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <span className="text-green-500">$</span> login
              </button>
            )}
            <button
              onClick={() => {
                setTheme(theme === 'dark' ? 'light' : 'dark');
                setIsOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm font-mono text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span className="text-green-500">$</span> toggle_theme
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 