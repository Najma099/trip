import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import TripForm from '../components/TripForm'
import TripHistory from '../components/TripHistory'
import './TripFormPage.css'

const BANNER_IMG =
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
      <header className="plan-header">
        <h1 className="plan-header__title">Plan a new trip</h1>
        <p className="plan-header__sub">
          Enter your current location, pickup, dropoff, and hours already used this cycle.
        </p>
      </header>

      <div className="plan-grid">
        <div className="plan-main">
          <div className="plan-banner">
            <img src={BANNER_IMG} alt="" aria-hidden="true" />
            <div className="plan-banner__overlay" />
          </div>
          <section className="card plan-form-card">
            <TripForm autoFillDemo={autoDemo} />
          </section>
        </div>
        <aside className="plan-sidebar">
          <TripHistory />
        </aside>
      </div>
    </div>
  )
}
