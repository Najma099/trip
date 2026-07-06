import { Link } from 'react-router-dom'
import { ArrowLeft, MapPinOff } from 'lucide-react'
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function NotFound() {
  useDocumentTitle('Page not found')

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-full rounded-2xl border border-[color:var(--sp-border)] bg-white p-8 shadow-sm sm:p-10">
        <span
          className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[color:var(--sp-bg)] text-[color:var(--sp-text-tertiary)]"
          aria-hidden="true"
        >
          <MapPinOff size={28} strokeWidth={2} />
        </span>
        <p className="mt-5 font-mono text-5xl font-bold tracking-tight text-[color:var(--sp-primary)]">404</p>
        <h1 className="mt-2 font-sora text-2xl font-semibold tracking-tight text-[color:var(--sp-text)]">
          Page not found
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--sp-text-secondary)]">
          That route doesn&apos;t exist or may have moved. Head back home to plan a trip.
        </p>
        <Link
          to="/"
          className="sp-focus-ring mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-[color:var(--sp-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[color:var(--sp-primary-600)]"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to home
        </Link>
      </div>
    </div>
  )
}
