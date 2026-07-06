import { NavLink, useNavigate } from 'react-router-dom'
import { useGuest } from '../context/GuestContext'
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

export default function Header() {
  const { guestId } = useGuest()
  const navigate = useNavigate()
  const guestLabel = guestId ? `Guest-${guestId.slice(0, 6)}` : 'Guest'

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
          <div className="guest-badge">
            <span className="guest-avatar" aria-hidden="true">
              {guestLabel.charAt(0).toUpperCase()}
            </span>
            <div className="guest-info">
              <span className="guest-greeting">Hi, {guestLabel}</span>
              <span className="guest-mode">Guest session</span>
            </div>
          </div>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/plan')}>
            New Trip
          </button>
        </div>
      </div>
    </header>
  )
}
