import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Plus, ShieldCheck, Truck } from 'lucide-react'
import { useGuest } from '../context/GuestContext'

export default function Header() {
  const navigate = useNavigate()
  const { guestId } = useGuest()
  const handle = guestId ? guestId.replace(/-/g, '').slice(0, 4).toUpperCase() : '----'

  return (
    <header
      data-testid="app-header"
      className="sticky top-0 z-40 w-full border-b border-[color:var(--sp-border)] bg-white/85 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link data-testid="header-logo" to="/" className="group flex items-center gap-2.5">
          <span
            className="grid h-9 w-9 place-items-center rounded-lg text-white shadow-sm transition-transform group-hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #0ea5e9 140%)' }}
          >
            <Truck size={18} strokeWidth={2.5} aria-hidden="true" />
          </span>
          <span className="font-sora text-[1.05rem] font-semibold tracking-tight text-[color:var(--sp-text)]">
            Spotter<span className="text-[color:var(--sp-accent)]">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          <NavLink
            data-testid="nav-home"
            to="/"
            end
            className={({ isActive }) =>
              `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'text-[color:var(--sp-primary)]'
                  : 'text-[color:var(--sp-text-secondary)] hover:text-[color:var(--sp-text)]'
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            data-testid="nav-plan-trip"
            to="/plan"
            className={({ isActive }) =>
              `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'text-[color:var(--sp-primary)]'
                  : 'text-[color:var(--sp-text-secondary)] hover:text-[color:var(--sp-text)]'
              }`
            }
          >
            Plan Trip
          </NavLink>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div
            data-testid="guest-badge"
            className="hidden items-center gap-2 rounded-full border border-[color:var(--sp-border)] bg-[color:var(--sp-bg)] px-3 py-1 text-xs font-medium text-[color:var(--sp-text-secondary)] sm:flex"
            title="Guest session"
          >
            <ShieldCheck size={13} className="text-[color:var(--sp-accent)]" aria-hidden="true" />
            <span>Guest</span>
            <span className="font-mono text-[10px] text-[color:var(--sp-text-tertiary)]">#{handle}</span>
          </div>
          <button
            type="button"
            data-testid="header-new-trip-btn"
            onClick={() => navigate('/plan')}
            className="inline-flex items-center gap-1.5 rounded-md bg-[color:var(--sp-primary)] px-3.5 py-1.5 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[color:var(--sp-primary-600)] hover:shadow"
          >
            <Plus size={15} strokeWidth={2.5} aria-hidden="true" />
            <span className="hidden sm:inline">New Trip</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>
    </header>
  )
}
