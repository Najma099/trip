import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Truck } from 'lucide-react'
import api from '../services/api'

export default function PasswordResetPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api.post('/api/auth/password-reset/', { email })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  if (sent) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-12 text-center">
        <span className="mb-6 grid h-12 w-12 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
          <Mail size={22} />
        </span>
        <h1 className="font-sora text-2xl font-semibold text-[color:var(--sp-text)]">Check your email</h1>
        <p className="mt-2 text-sm text-[color:var(--sp-text-secondary)]">
          If an account with that email exists, we&apos;ve sent a password reset link.
        </p>
        <Link to="/login" className="mt-6 text-sm font-medium text-[color:var(--sp-accent)] hover:underline">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-12">
      <span className="mb-6 grid h-12 w-12 place-items-center rounded-xl bg-[color:var(--sp-primary)] text-white shadow-sm">
        <Truck size={22} strokeWidth={2.2} />
      </span>
      <h1 className="font-sora text-2xl font-semibold text-[color:var(--sp-text)]">Reset your password</h1>
      <p className="mt-1 text-sm text-[color:var(--sp-text-secondary)]">
        Enter the email address linked to your account.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex w-full flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-[color:var(--sp-text)]">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-[color:var(--sp-border)] px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[color:var(--sp-accent)] focus:ring-2 focus:ring-[color:var(--sp-accent)]/20"
          />
        </label>

        {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[color:var(--sp-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[color:var(--sp-primary-600)] disabled:opacity-50"
        >
          {busy ? 'Sending…' : 'Send reset link'}
          <Mail size={15} strokeWidth={2.5} />
        </button>
      </form>

      <p className="mt-6 text-xs text-[color:var(--sp-text-tertiary)]">
        <Link to="/login" className="hover:underline">Back to sign in</Link>
        {' · '}
        <Link to="/" className="hover:underline">Home</Link>
      </p>
    </div>
  )
}
