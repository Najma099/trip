import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import TripForm from '../components/TripForm'
import TripHistory from '../components/TripHistory'
import './TripFormPage.css'

const PLAN_BANNER =
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80'

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
    <div className="plan-page page-enter">
      <div className="plan-hero card">
        <img src={PLAN_BANNER} alt="" className="plan-hero-img" aria-hidden="true" />
        <div className="plan-hero-text">
          <p className="eyebrow">Plan a new trip</p>
          <h1>Where are you headed?</h1>
          <p>Enter current location, pickup, dropoff, and hours already used this cycle.</p>
        </div>
      </div>

      <div className="plan-layout">
        <section className="card plan-form-card">
          <TripForm autoFillDemo={autoDemo} />
        </section>
        <TripHistory />
      </div>
    </div>
  )
}
