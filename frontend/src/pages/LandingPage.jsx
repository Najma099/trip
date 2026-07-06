import { useNavigate } from 'react-router-dom'
import TripHistory from '../components/TripHistory'
import './LandingPage.css'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="landing-page">
      <section className="landing-hero">
        <div className="landing-hero-grid">
          <div className="landing-hero-content">
            <p className="eyebrow">FMCSA-Compliant Trip Planning</p>
            <h1>Logistics solutions for your routes</h1>
            <p className="lead">
              Plan truck trips with HOS-compliant schedules, interactive maps,
              and DOT-style daily log sheets — no account required.
            </p>
            <div className="landing-actions">
              <button type="button" className="btn btn-primary" onClick={() => navigate('/plan')}>
                Get Started
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate('/plan', { state: { demo: true } })}
              >
                Try Demo Trip
              </button>
            </div>
          </div>

          <div className="landing-hero-visual" aria-hidden="true">
            <svg className="route-animation-svg" viewBox="0 0 400 280">
              <rect width="400" height="280" rx="16" fill="rgba(15,23,42,0.6)" />
              <path
                className="route-path-glow"
                d="M40,220 C80,180 120,200 160,140 S240,80 280,100 S340,60 360,40"
              />
              <path
                className="route-path"
                d="M40,220 C80,180 120,200 160,140 S240,80 280,100 S340,60 360,40"
              />
              <circle className="route-dot" cx="40" cy="220" r="6" />
              <circle className="route-dot-fuel" cx="160" cy="140" r="5" />
              <circle className="route-dot-end" cx="360" cy="40" r="6" />
              <text x="40" y="250" fill="#94a3b8" fontSize="11">Dallas</text>
              <text x="300" y="30" fill="#94a3b8" fontSize="11">Chicago</text>
            </svg>
          </div>
        </div>
      </section>

      <section className="landing-features">
        <article className="feature-card">
          <div className="feature-icon blue">🚛</div>
          <h3>Truck Routing</h3>
          <p>OpenRouteService HGV profile with height and weight aware paths.</p>
        </article>
        <article className="feature-card">
          <div className="feature-icon green">⏱</div>
          <h3>HOS Simulation</h3>
          <p>11h drive, 14h window, 30-min breaks, and 70-hour cycle enforcement.</p>
        </article>
        <article className="feature-card">
          <div className="feature-icon amber">🗺</div>
          <h3>Live Route Map</h3>
          <p>Animated route with fuel, rest, pickup, and dropoff markers.</p>
        </article>
        <article className="feature-card">
          <div className="feature-icon purple">📋</div>
          <h3>Daily Log Sheets</h3>
          <p>FMCSA §395.8 grids with duty status timelines per day.</p>
        </article>
      </section>

      <div className="landing-bottom">
        <TripHistory />
      </div>
    </div>
  )
}
