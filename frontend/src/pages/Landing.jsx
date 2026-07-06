import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  FileText,
  Map,
  Play,
  Route,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import HeroBanner from '../components/HeroBanner'

const HERO_IMG =
  'https://images.unsplash.com/photo-1542705959-878ca346eb20?auto=format&fit=crop&w=1600&q=80'

const FEATURES = [
  {
    icon: Route,
    title: 'Truck-safe routing',
    blurb:
      'Multi-leg routes with realistic drive-time modeling — deadhead, pickup, dropoff, and every planned stop in between.',
    gradient: 'linear-gradient(135deg, #1e3a8a, #0ea5e9)',
  },
  {
    icon: ShieldCheck,
    title: 'HOS compliance engine',
    blurb:
      'Applies 49 CFR §395 rules — 11-hour driving, 14-hour window, 30-min breaks, 10-hour resets, and the 70/8 cycle.',
    gradient: 'linear-gradient(135deg, #0f172a, #1e3a8a)',
  },
  {
    icon: Map,
    title: 'Live route map',
    blurb:
      'Interactive map with animated route drawing, color-coded stops, and a truck marker that traces the trip.',
    gradient: 'linear-gradient(135deg, #1e3a8a, #0ea5e9)',
  },
  {
    icon: FileText,
    title: 'FMCSA log sheets',
    blurb:
      'Auto-generated Record of Duty for every day of the trip, ready for review or paper backup.',
    gradient: 'linear-gradient(135deg, #0f172a, #1e3a8a)',
  },
]

const STEPS = [
  { step: '01', title: 'Enter the trip', blurb: 'Origin, pickup, dropoff, and cycle hours used. Four fields.' },
  { step: '02', title: 'We plan the route', blurb: 'Fuel stops, 30-min breaks, 10-hour resets, and a legal check against the 70/8 cycle.' },
  { step: '03', title: 'You get the logs', blurb: 'Daily FMCSA-style Record of Duty sheets, ready to hand the driver.' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex max-w-7xl flex-col px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <HeroBanner
        testId="landing-hero"
        imageSrc={HERO_IMG}
        imageAlt="Highway at dusk"
        eyebrow="US Freight · Dispatch Grade"
        title="Plan compliant truck routes in seconds."
        subtitle="Trip inputs in, HOS-legal route and FMCSA-ready daily logs out. Built for dispatchers who ship on time."
        rightSlot={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              data-testid="landing-cta-plan"
              to="/plan"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[color:var(--sp-primary)] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow"
            >
              Get started
              <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
            </Link>
            <button
              type="button"
              data-testid="landing-cta-demo"
              onClick={() => navigate('/plan', { state: { demo: true } })}
              className="inline-flex items-center gap-2 rounded-lg border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
            >
              <Play size={14} strokeWidth={2.6} aria-hidden="true" />
              Try demo trip
            </button>
          </div>
        }
      />

      <div className="mt-10 sm:mt-14">
        <div className="mb-6 flex flex-col gap-1 sm:mb-8">
          <span className="eyebrow">What ships in the box</span>
          <h2 className="font-sora text-2xl font-semibold tracking-tight text-[color:var(--sp-text)] sm:text-3xl">
            The freight-planner cockpit
          </h2>
          <p className="mt-1 max-w-xl text-sm text-[color:var(--sp-text-secondary)]">
            Four dispatcher-grade tools working from a single trip record — everything talks to the same HOS engine.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                data-testid={`feature-card-${i}`}
                className="sp-fade-up group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-[color:var(--sp-border)] bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[color:var(--sp-border-strong)] hover:shadow-md"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <span
                  className="grid h-10 w-10 place-items-center rounded-xl text-white"
                  style={{ background: f.gradient }}
                >
                  <Icon size={18} strokeWidth={2.2} aria-hidden="true" />
                </span>
                <h3 className="font-sora text-lg font-semibold text-[color:var(--sp-text)]">{f.title}</h3>
                <p className="text-sm leading-relaxed text-[color:var(--sp-text-secondary)]">{f.blurb}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {STEPS.map((s, i) => (
          <div
            key={s.step}
            data-testid={`how-step-${i}`}
            className="flex gap-4 rounded-xl border border-[color:var(--sp-border)] bg-white p-5 shadow-sm"
          >
            <span className="font-sora text-3xl font-semibold text-[color:var(--sp-accent)]">{s.step}</span>
            <div>
              <h4 className="font-sora text-base font-semibold text-[color:var(--sp-text)]">{s.title}</h4>
              <p className="mt-1 text-sm text-[color:var(--sp-text-secondary)]">{s.blurb}</p>
            </div>
          </div>
        ))}
      </div>

      <div
        data-testid="landing-bottom-cta"
        className="mt-14 flex flex-col items-start justify-between gap-4 overflow-hidden rounded-2xl bg-[color:var(--sp-dark)] p-8 shadow-sm sm:flex-row sm:items-center sm:p-10"
      >
        <div className="flex items-center gap-4">
          <span
            className="grid h-12 w-12 place-items-center rounded-xl text-white"
            style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #0ea5e9 100%)' }}
          >
            <Truck size={22} strokeWidth={2.2} aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-sora text-xl font-semibold text-white">Ready to plan your next trip?</h3>
            <p className="mt-1 text-sm text-slate-400">No account, no card — just enter your route.</p>
          </div>
        </div>
        <Link
          data-testid="landing-bottom-cta-btn"
          to="/plan"
          className="inline-flex items-center gap-2 rounded-lg bg-[color:var(--sp-accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[color:var(--sp-accent-600)]"
        >
          Open the planner
          <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
