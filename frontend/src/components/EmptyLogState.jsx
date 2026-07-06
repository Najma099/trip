import { FileText } from 'lucide-react'

export default function EmptyLogState({ message }) {
  return (
    <section
      data-testid="empty-log-state"
      className="rounded-2xl border border-dashed border-[color:var(--sp-border)] bg-[color:var(--sp-bg)] p-8 text-center"
    >
      <FileText size={32} className="mx-auto text-[color:var(--sp-text-tertiary)]" aria-hidden="true" />
      <h3 className="mt-3 font-sora text-lg font-semibold text-[color:var(--sp-text)]">
        No daily log data
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-[color:var(--sp-text-secondary)]">
        {message ||
          'This trip did not produce calendar-day log sheets — common for very short same-day runs with no duty segments to record.'}
      </p>
    </section>
  )
}
