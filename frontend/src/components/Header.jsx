import { NavLink, useNavigate } from 'react-router-dom'
import { useGuest } from '../context/GuestContext'
import './Header.css'

export default function Header() {
  const { guestId } = useGuest()
  const navigate = useNavigate()
  const guestLabel = guestId ? `Guest-${guestId.slice(0, 6)}` : 'Guest'

  return (
    <header className="site-header">
      <div className="header-inner">
        <button type="button" className="logo" onClick={() => navigate('/')}>
          <span className="logo-icon">⬡</span>
          <span className="logo-text">Spotter</span>
        </button>

        <nav className="main-nav" aria-label="Main">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Home
          </NavLink>
          <NavLink to="/plan" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Plan Trip
          </NavLink>
        </nav>

        <div className="header-actions">
          <div className="guest-badge">
            <span className="guest-avatar">{guestLabel.charAt(0)}</span>
            <div className="guest-info">
              <span className="guest-greeting">Hi, {guestLabel}</span>
              <span className="guest-mode">Guest mode</span>
            </div>
          </div>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/plan')}>
            + New Trip
          </button>
        </div>
      </div>
    </header>
  )
}
