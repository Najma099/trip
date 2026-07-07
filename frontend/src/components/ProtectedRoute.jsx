import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 text-[color:var(--sp-text-secondary)]">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[color:var(--sp-border)] border-t-[color:var(--sp-accent)]" />
        <p>Loading…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
