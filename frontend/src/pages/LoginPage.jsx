import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, Truck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(username, password)
      navigate('/plan')
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.[0] || 'Login failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-12">
      <span className="mb-6 grid h-12 w-12 place-items-center rounded-xl bg-[color:var(--sp-primary)] text-white shadow-sm">
        <Truck size={22} strokeWidth={2.2} />
      </span>
      <h1 className="font-sora text-2xl font-semibold text-[color:var(--sp-text)]">Sign in to Spotter</h1>
      <p className="mt-1 text-sm text-[color:var(--sp-text-secondary)]">
        Or{' '}
        <Link to="/register" className="font-medium text-[color:var(--sp-accent)] hover:underline">
          create an account
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex w-full flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-[color:var(--sp-text)]">
          Username
          <input
            type="text"
            required
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="rounded-lg border border-[color:var(--sp-border)] px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[color:var(--sp-accent)] focus:ring-2 focus:ring-[color:var(--sp-accent)]/20"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-[color:var(--sp-text)]">
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-[color:var(--sp-border)] px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[color:var(--sp-accent)] focus:ring-2 focus:ring-[color:var(--sp-accent)]/20"
          />
        </label>

        {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[color:var(--sp-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[color:var(--sp-primary-600)] disabled:opacity-50"
        >
          {busy ? 'Signing in…' : 'Sign in'}
          <LogIn size={15} strokeWidth={2.5} />
        </button>
      </form>

      <p className="mt-6 text-xs text-[color:var(--sp-text-tertiary)]">
        <Link to="/password-reset" className="hover:underline">Forgot password?</Link>
        {' · '}
        <Link to="/" className="hover:underline">Back to home</Link>
      </p>
    </div>
  )
}
