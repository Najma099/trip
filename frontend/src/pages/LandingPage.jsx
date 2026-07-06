import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <section className="landing card">
      <h1>Plan a compliant truck trip</h1>
      <p className="lead">
        Enter your current location, pickup, dropoff, and cycle hours used.
        Get a truck-routed map and FMCSA daily log sheets — no account required.
      </p>
      <div className="landing-actions">
        <button type="button" className="btn btn-primary" onClick={() => navigate('/plan')}>
          Continue as Guest
        </button>
      </div>
    </section>
  )
}
