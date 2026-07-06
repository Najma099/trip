import { useNavigate } from 'react-router-dom'
import TripHistory from '../components/TripHistory'
import './LandingPage.css'

const HERO_IMG =
  'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1600&q=80'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="landing-page page-enter">
      <section className="hero-banner">
        <img src={HERO_IMG} alt="Truck on highway at sunset" className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="hero-eyebrow">Spotter AI · Trip Planner</p>
          <h1>Logistics solutions for compliant routes</h1>
          <p className="hero-lead">
            Plan HOS-compliant truck trips with interactive maps, day-wise log sheets,
            and FMCSA §395.8 duty grids — continue as guest, no signup needed.
          </p>
          <div className="hero-actions">
            <button type="button" className="btn btn-primary btn-lg" onClick={() => navigate('/plan')}>
              Get Started
            </button>
            <button
              type="button"
              className="btn btn-outline-light btn-lg"
              onClick={() => navigate('/plan', { state: { demo: true } })}
            >
              Try Demo Trip
            </button>
          </div>
        </div>
      </section>

      <section className="welcome-strip card">
        <div className="welcome-text">
          <h2>Welcome in, Guest</h2>
          <p>Your trip planner is ready. Enter four fields and get a fully compliant route with daily logs.</p>
        </div>
        <div className="welcome-stats">
          <div className="welcome-stat">
            <span className="welcome-stat-val">70h</span>
            <span className="welcome-stat-label">Cycle limit</span>
          </div>
          <div className="welcome-stat">
            <span className="welcome-stat-val">11h</span>
            <span className="welcome-stat-label">Drive limit</span>
          </div>
          <div className="welcome-stat">
            <span className="welcome-stat-val">HGV</span>
            <span className="welcome-stat-label">Truck routing</span>
          </div>
        </div>
      </section>

      <section className="features-grid">
        <article className="feature-card card">
          <div className="feature-icon blue">🚛</div>
          <h3>Truck Routing</h3>
          <p>OpenRouteService HGV profile — height & weight aware paths.</p>
        </article>
        <article className="feature-card card">
          <div className="feature-icon green">⏱</div>
          <h3>HOS Engine</h3>
          <p>11h drive, 14h window, breaks, rest, and 70-hour cycle.</p>
        </article>
        <article className="feature-card card">
          <div className="feature-icon sky">🗺</div>
          <h3>Animated Map</h3>
          <p>Live route draw with fuel, rest, pickup & dropoff stops.</p>
        </article>
        <article className="feature-card card">
          <div className="feature-icon purple">📋</div>
          <h3>Day-wise Logs</h3>
          <p>Swipe through each day — duty grids with location remarks.</p>
        </article>
      </section>

      <TripHistory />
    </div>
  )
}
