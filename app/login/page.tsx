import type { Metadata } from 'next'
import { LoginForm } from './login-form'

export const metadata: Metadata = { title: 'Sign in' }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      {/* The front cover of the album. */}
      <div className="w-full max-w-md rounded-md bg-cover p-3 text-cover-ink shadow-[0_2px_4px_rgb(var(--shadow)/0.2),0_30px_60px_-30px_rgb(var(--shadow)/0.6)]">
        <div className="rounded-sm border-2 border-cover-ink/25 px-6 py-12 sm:px-10">
          <h1 className="text-center text-3xl">charliegram</h1>
          <p className="mt-2 text-center text-cover-ink/75">The family photo album</p>
          <div className="mx-auto mt-8 mb-10 h-px w-16 bg-cover-ink/30" />
          <LoginForm next={next} />
        </div>
      </div>
    </main>
  )
}
