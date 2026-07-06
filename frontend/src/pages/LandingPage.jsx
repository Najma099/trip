import { useNavigate } from 'react-router-dom'
import TripHistory from '../components/TripHistory'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="landing-layout">
      <section className="landing card">
        <p className="eyebrow">Spotter AI Take-Home</p>
        <h1>Plan a compliant truck trip</h1>
        <p className="lead">
          Enter your current location, pickup, dropoff, and cycle hours used.
          Get a truck-routed map and FMCSA daily log sheets — no account required.
        </p>
        <ul className="feature-list">
          <li>OpenRouteService truck routing (driving-hgv)</li>
          <li>FMCSA 70-hour / 8-day HOS simulation</li>
          <li>Interactive map with fuel, rest, and pickup stops</li>
          <li>DOT-style daily log sheet grids</li>
        </ul>
        <div className="landing-actions">
          <button type="button" className="btn btn-primary" onClick={() => navigate('/plan')}>
            Continue as Guest
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/plan', { state: { demo: true } })}
          >
            Try Demo Trip
          </button>
        </div>
      </section>
      <TripHistory />
    </div>
  )
}
