import { useState } from 'react'
import { Check, Link2 } from 'lucide-react'
import { useToast } from '../context/ToastContext'

export default function CopyTripLink({ tripId }) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  async function copy() {
    const url = `${window.location.origin}/results/${tripId}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast('Trip link copied to clipboard', 'success')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast('Could not copy link — try selecting the URL manually', 'error')
    }
  }

  return (
    <button
      type="button"
      data-testid="copy-trip-link"
      onClick={copy}
      className="sp-focus-ring inline-flex items-center gap-1.5 rounded-md border border-[color:var(--sp-border)] bg-white px-3 py-1.5 text-xs font-medium text-[color:var(--sp-text-secondary)] transition-all hover:border-[color:var(--sp-primary)] hover:text-[color:var(--sp-primary)]"
    >
      {copied ? <Check size={13} aria-hidden="true" /> : <Link2 size={13} aria-hidden="true" />}
      {copied ? 'Copied' : 'Copy trip link'}
    </button>
  )
}
