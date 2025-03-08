import Link from 'next/link'
import ThemeSwitch from './ThemeSwitch'

export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 backdrop-blur-lg bg-opacity-80 dark:bg-opacity-80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link 
            href="/" 
            className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            charliegram
          </Link>
          
          <div className="flex items-center gap-8">
            <div className="hidden sm:flex items-center gap-8">
              <Link 
                href="/about" 
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-lg"
              >
                About
              </Link>
              <Link 
                href="/milestones" 
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-lg"
              >
                Milestones
              </Link>
            </div>
            <ThemeSwitch />
          </div>
        </div>
      </div>
    </nav>
  )
}