export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[color:var(--sp-border)]/80 motion-reduce:animate-none ${className}`}
      aria-hidden="true"
    />
  )
}

export function PlanTripSubmitSkeleton() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10" aria-busy="true" aria-label="Planning trip">
      <Skeleton className="h-[220px] w-full rounded-2xl" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-[color:var(--sp-border)] bg-white p-8 lg:col-span-2">
          <Skeleton className="mb-6 h-8 w-48" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <Skeleton key={n} className="h-16" />
            ))}
          </div>
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
      <p className="text-center text-sm text-[color:var(--sp-text-secondary)]">
        Computing HOS-legal route and daily logs…
      </p>
    </div>
  )
}

export function ResultsPageSkeleton() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-10" aria-busy="true" aria-label="Loading trip results">
      <Skeleton className="h-[280px] w-full rounded-2xl sm:h-[340px]" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((n) => (
          <Skeleton key={n} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.85fr_1fr]">
        <Skeleton className="h-[420px] rounded-xl sm:h-[520px]" />
        <Skeleton className="h-[420px] rounded-xl" />
      </div>
      <Skeleton className="h-14 w-full max-w-md rounded-xl" />
      <Skeleton className="h-72 rounded-2xl" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  )
}
