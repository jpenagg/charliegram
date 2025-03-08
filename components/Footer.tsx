export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-2">
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            made with ❤️ by papa
          </p>
          <a 
            href="https://jpena.dev" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            jpena.dev
          </a>
        </div>
      </div>
    </footer>
  )
}
