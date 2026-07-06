import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import TripForm from '../components/TripForm'
import TripHistory from '../components/TripHistory'

export default function TripFormPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const autoDemo = location.state?.demo

  useEffect(() => {
    if (autoDemo) {
      navigate('/plan', { replace: true, state: {} })
    }
  }, [autoDemo, navigate])

  return (
    <div className="plan-layout">
      <section className="card">
        <h2>New Trip</h2>
        <p className="form-subtitle">
          All four fields are required. Cycle hours used must be between 0 and 70.
        </p>
        <TripForm autoFillDemo={autoDemo} />
      </section>
      <TripHistory />
    </div>
  )
}
