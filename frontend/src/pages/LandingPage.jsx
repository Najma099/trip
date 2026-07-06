import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

const HERO_IMG =
  'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1600&q=80'

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11" />
        <path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
        <circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" />
      </svg>
    ),
    title: 'Truck-Safe Routing',
    desc: 'OpenRouteService HGV profile with height and weight restrictions.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: 'HOS Compliance',
    desc: '11h drive, 14h window, mandatory breaks, and 70-hour cycle enforcement.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
        <line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
      </svg>
    ),
    title: 'Live Route Map',
    desc: 'Animated route draw with fuel, rest, pickup, and dropoff markers.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    title: 'Daily Log Sheets',
    desc: 'FMCSA §395.8 duty grids with day-wise segregation and remarks.',
  },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="landing page-enter">
      <section className="hero">
        <img src={HERO_IMG} alt="" className="hero__bg" aria-hidden="true" />
        <div className="hero__overlay" />
        <div className="hero__content animate-in">
          <p className="eyebrow eyebrow--light">Fleet dispatch · HOS compliance</p>
          <h1 className="hero__title">Plan compliant routes in minutes</h1>
          <p className="hero__lead">
            Enter four fields — current location, pickup, dropoff, and cycle hours used.
            Get a truck-routed map, stop schedule, and FMCSA daily log sheets instantly.
          </p>
          <div className="hero__actions">
            <button type="button" className="btn btn-accent btn-lg" onClick={() => navigate('/plan')}>
              Get Started
            </button>
            <button
              type="button"
              className="btn btn-outline btn-lg"
              onClick={() => navigate('/plan', { state: { demo: true } })}
            >
              Try Demo Trip
            </button>
          </div>
        </div>
      </section>

      <div className="landing__body">
        <section className="features">
          {FEATURES.map((f, i) => (
            <article key={f.title} className="feature-card card animate-in" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="feature-card__icon">{f.icon}</div>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__desc">{f.desc}</p>
            </article>
          ))}
        </section>
      </div>
    </div>
  )
}
