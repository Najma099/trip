import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Skeleton } from './Skeleton'

const TripMap = lazy(() => import('./TripMap'))

export default function LazyTripMap(props) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '120px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="min-h-[420px] sm:min-h-[520px]">
      {visible ? (
        <Suspense fallback={<Skeleton className="h-[420px] w-full rounded-xl sm:h-[520px]" />}>
          <TripMap {...props} />
        </Suspense>
      ) : (
        <Skeleton className="h-[420px] w-full rounded-xl sm:h-[520px]" aria-label="Map loading placeholder" />
      )}
    </div>
  )
}
