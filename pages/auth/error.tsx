import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function ErrorPage() {
  const router = useRouter()
  const { error } = router.query

  const errorMessages: { [key: string]: string } = {
    Configuration: '> Error: Server configuration issue detected',
    AccessDenied: '> Error: Access denied. Please log in with admin credentials',
    Verification: '> Error: Unable to verify credentials',
    Default: '> Error: An authentication error occurred'
  }

  const message = error ? errorMessages[error as string] || errorMessages.Default : errorMessages.Default

  return (
    <>
      <Head>
        <title>Error - charliegram</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <h1 className="text-4xl font-bold text-red-500 font-mono mb-4">
              ! authentication_error
            </h1>
            <p className="text-gray-600 dark:text-gray-400 font-mono mb-8">
              {message}
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <Link
              href="/auth/login"
              className="font-mono text-sm text-green-500 hover:text-green-600"
            >
              $ retry_login
            </Link>
            <Link
              href="/"
              className="font-mono text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              $ return_home
            </Link>
          </div>
        </div>
      </div>
    </>
  )
} 