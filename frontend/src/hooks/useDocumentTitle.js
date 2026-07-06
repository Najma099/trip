import { useEffect } from 'react'

export default function useDocumentTitle(title) {
  useEffect(() => {
    const prev = document.title
    document.title = title ? `${title} · Spotter` : 'Spotter Trip Planner'
    return () => {
      document.title = prev
    }
  }, [title])
}
