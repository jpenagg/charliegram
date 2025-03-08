import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import Navbar from '../../components/Navbar'

export default function Login() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false
      })
      
      if (result?.error) {
        console.error('Login error:', result.error)
        setError('Invalid credentials')
      } else {
        // Redirect to home page instead of upload
        await router.push('/')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Head>
        <title>Login - charliegram</title>
      </Head>

      <Navbar />

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 font-mono">
              {'>'} login_
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-gray-100 dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <div>
              <label htmlFor="username" className="block text-sm font-mono text-gray-700 dark:text-gray-300 mb-2">
                <span className="text-green-500">$</span> username
              </label>
              <input
                type="text"
                name="username"
                id="username"
                required
                className="w-full px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 focus:outline-none text-gray-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-mono text-gray-700 dark:text-gray-300 mb-2">
                <span className="text-green-500">$</span> password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  required
                  className="w-full px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 focus:outline-none text-gray-900 dark:text-white font-mono pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-500 font-mono text-sm">
                <span className="text-red-500">!</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white rounded font-mono transition-colors"
            >
              {loading ? '$ authenticating...' : '$ submit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
} 