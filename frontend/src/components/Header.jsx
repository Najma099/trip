import { NavLink, useNavigate } from 'react-router-dom'
import './Header.css'

function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect width="28" height="28" rx="8" fill="var(--brand-accent-soft)" />
      <path
        d="M7 18 L14 8 L21 18"
        stroke="var(--brand-accent)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <line x1="9" y1="18" x2="19" y2="18" stroke="var(--brand-primary)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="4.5" r="2.25" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M2.5 12.5c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function Header() {
  const navigate = useNavigate()

  return (
    <header className="site-header">
      <div className="header-inner">
        <button type="button" className="logo" onClick={() => navigate('/')}>
          <LogoMark />
          <span className="logo-text">
            Spotter
            <span className="logo-sub">Trip Planner</span>
          </span>
        </button>

        <nav className="main-nav" aria-label="Main navigation">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Home
          </NavLink>
          <NavLink to="/plan" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Plan Trip
          </NavLink>
        </nav>

        <div className="header-actions">
          <span className="guest-pill">
            <PersonIcon />
            Guest
          </span>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/plan')}>
            New Trip
          </button>
        </div>
      </div>
    </header>
  )
}
