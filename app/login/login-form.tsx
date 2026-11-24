'use client'

import { useActionState } from 'react'
import { login, type LoginState } from '../actions'

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {})

  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <label htmlFor="password" className="block font-bold">
        Family password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        autoFocus
        autoComplete="current-password"
        aria-describedby={state.error ? 'login-error' : undefined}
        className="min-h-14 w-full rounded-lg border-2 border-transparent bg-print px-4 text-lg text-ink focus:border-cover-ink/70 focus:outline-none"
      />
      {state.error && (
        <p id="login-error" role="alert" className="rounded-lg bg-cover-ink/15 px-4 py-3">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="btn min-h-14 w-full bg-cover-ink text-lg text-cover hover:bg-cover-ink/90 disabled:opacity-70"
      >
        {pending ? 'Opening…' : 'Open the album'}
      </button>
    </form>
  )
}
