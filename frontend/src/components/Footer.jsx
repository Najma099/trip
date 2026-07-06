import { Link } from 'react-router-dom'
import { Truck } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer data-testid="app-footer" className="mt-24 bg-[color:var(--sp-dark)] text-slate-400">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-6 py-14 sm:px-8 md:grid-cols-4 lg:px-10">
        <div className="col-span-2 md:col-span-1">
          <div className="mb-3 flex items-center gap-2.5">
            <span
              className="grid h-9 w-9 place-items-center rounded-lg text-white"
              style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #0ea5e9 140%)' }}
            >
              <Truck size={18} strokeWidth={2.5} aria-hidden="true" />
            </span>
            <span className="font-sora text-lg font-semibold text-white">
              Spotter<span className="text-[color:var(--sp-accent)]">.</span>
            </span>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-slate-400">
            Dispatcher-grade trip planning with HOS-compliant logs generated from the FMCSA rulebook.
            Built for fleets that move.
          </p>
        </div>

        <div>
          <h4 className="mb-3 font-sora text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">
            Product
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="transition-colors hover:text-white">Overview</Link></li>
            <li><Link to="/plan" className="transition-colors hover:text-white">Plan a Trip</Link></li>
            <li><Link to="/" className="transition-colors hover:text-white">HOS Engine</Link></li>
            <li><Link to="/" className="transition-colors hover:text-white">Log Sheets</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-sora text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">
            Compliance
          </h4>
          <ul className="space-y-2 text-sm">
            <li>49 CFR §395.3 — Driving limits</li>
            <li>49 CFR §395.8 — Record of duty</li>
            <li>70-hour / 8-day cycle</li>
            <li>30-min break requirement</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-sora text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">
            Company
          </h4>
          <ul className="space-y-2 text-sm">
            <li>About</li>
            <li>Careers</li>
            <li>Contact</li>
            <li>Status</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800/80">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-6 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:px-8 lg:px-10">
          <p>
            © {year} Spotter Logistics · For dispatch planning only, not a certified ELD device.
          </p>
          <p className="font-mono">v1.0 · US Freight · FMCSA-aligned</p>
        </div>
      </div>
    </footer>
  )
}
