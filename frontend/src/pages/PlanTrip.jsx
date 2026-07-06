import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  Flag,
  History,
  MapPin,
  Package,
  Timer,
} from 'lucide-react'
import HeroBanner from '../components/HeroBanner'
import TripSparkline from '../components/TripSparkline'
import { useGuest } from '../context/GuestContext'
import { createTrip, listTrips } from '../services/api'
import { shortCity } from '../utils/format'

const BANNER_IMG =
  'https://images.unsplash.com/photo-1759826350352-c5b0b77729bd?auto=format&fit=crop&w=1200&q=80'

const DEMO = {
  current_location: 'Dallas, TX',
  pickup_location: 'Houston, TX',
  dropoff_location: 'Chicago, IL',
  current_cycle_used: 20,
}

function FormField({ label, hint, icon: Icon, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--sp-text-tertiary)]">
        {label}
      </span>
      <span className="group relative flex items-center rounded-lg border border-[color:var(--sp-border)] bg-white transition-colors focus-within:border-[color:var(--sp-primary)] focus-within:ring-2 focus-within:ring-[color:var(--sp-primary)]/15">
        {Icon && (
          <Icon
            size={16}
            className="ml-3 shrink-0 text-[color:var(--sp-text-tertiary)] group-focus-within:text-[color:var(--sp-primary)]"
            aria-hidden="true"
          />
        )}
        {children}
      </span>
      {hint && <span className="text-[11px] text-[color:var(--sp-text-tertiary)]">{hint}</span>}
    </label>
  )
}

export default function PlanTrip() {
  const location = useLocation()
  const navigate = useNavigate()
  const { guestId } = useGuest()
  const autoDemo = location.state?.demo

  const [form, setForm] = useState({
    current_location: '',
    pickup_location: '',
    dropoff_location: '',
    current_cycle_used: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [trips, setTrips] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)

  useEffect(() => {
    if (autoDemo) {
      setForm({ ...DEMO, current_cycle_used: String(DEMO.current_cycle_used) })
      navigate('/plan', { replace: true, state: {} })
    }
  }, [autoDemo, navigate])

  useEffect(() => {
    if (!guestId) return
    listTrips(guestId)
      .then(setTrips)
      .catch(() => setTrips([]))
      .finally(() => setHistoryLoading(false))
  }, [guestId])

  function fillDemo() {
    setForm({ ...DEMO, current_cycle_used: String(DEMO.current_cycle_used) })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await createTrip({
        ...form,
        current_cycle_used: parseFloat(form.current_cycle_used),
        guest_id: guestId,
      })
      navigate(`/results/${result.trip_id}`)
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to plan trip'
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <HeroBanner
        testId="plan-hero"
        imageSrc={BANNER_IMG}
        imageAlt="Logistics yard"
        heightClass="h-[220px] sm:h-[260px]"
        eyebrow="New trip"
        title="Plan a trip"
        subtitle="Enter your dispatch details — we'll compute the HOS-legal route and daily logs."
      />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form
          data-testid="plan-form"
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[color:var(--sp-border)] bg-white p-6 shadow-sm sm:p-8 lg:col-span-2"
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-sora text-xl font-semibold tracking-tight text-[color:var(--sp-text)]">
                Trip details
              </h2>
              <p className="mt-1 text-sm text-[color:var(--sp-text-secondary)]">
                Four fields. We take it from there.
              </p>
            </div>
            <button
              type="button"
              data-testid="plan-demo-fill-btn"
              onClick={fillDemo}
              className="rounded-md border border-[color:var(--sp-border)] bg-[color:var(--sp-bg)] px-3 py-1.5 text-xs font-medium text-[color:var(--sp-text-secondary)] transition-colors hover:text-[color:var(--sp-primary)]"
            >
              Fill demo trip
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Current location" icon={MapPin}>
              <input
                data-testid="plan-current-location"
                className="w-full bg-transparent px-3 py-2.5 text-sm text-[color:var(--sp-text)] placeholder:text-[color:var(--sp-text-tertiary)] focus:outline-none"
                placeholder="e.g. Dallas, TX"
                value={form.current_location}
                onChange={(e) => setForm((p) => ({ ...p, current_location: e.target.value }))}
                required
              />
            </FormField>
            <FormField label="Pickup location" icon={Package}>
              <input
                data-testid="plan-pickup-location"
                className="w-full bg-transparent px-3 py-2.5 text-sm text-[color:var(--sp-text)] placeholder:text-[color:var(--sp-text-tertiary)] focus:outline-none"
                placeholder="e.g. Houston, TX"
                value={form.pickup_location}
                onChange={(e) => setForm((p) => ({ ...p, pickup_location: e.target.value }))}
                required
              />
            </FormField>
            <FormField label="Dropoff location" icon={Flag}>
              <input
                data-testid="plan-dropoff-location"
                className="w-full bg-transparent px-3 py-2.5 text-sm text-[color:var(--sp-text)] placeholder:text-[color:var(--sp-text-tertiary)] focus:outline-none"
                placeholder="e.g. Chicago, IL"
                value={form.dropoff_location}
                onChange={(e) => setForm((p) => ({ ...p, dropoff_location: e.target.value }))}
                required
              />
            </FormField>
            <FormField label="Cycle hours used (0–70)" hint="Hours already logged in the 70/8-day cycle." icon={Timer}>
              <input
                data-testid="plan-cycle-used"
                type="number"
                min="0"
                max="70"
                step="0.5"
                className="w-full bg-transparent px-3 py-2.5 text-sm text-[color:var(--sp-text)] placeholder:text-[color:var(--sp-text-tertiary)] focus:outline-none"
                placeholder="e.g. 20"
                value={form.current_cycle_used}
                onChange={(e) => setForm((p) => ({ ...p, current_cycle_used: e.target.value }))}
                required
              />
            </FormField>
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="mt-6 flex items-center justify-between gap-3">
            <div className="hidden text-xs text-[color:var(--sp-text-tertiary)] sm:block">
              Enforces 11-hour drive, 14-hour window, 30-min break, and 10-hour reset rules.
            </div>
            <button
              type="submit"
              data-testid="plan-submit-btn"
              disabled={loading || !guestId}
              className="inline-flex items-center gap-2 rounded-lg bg-[color:var(--sp-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[color:var(--sp-primary-600)] disabled:opacity-70"
            >
              {loading ? 'Planning…' : 'Plan trip'}
              <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
            </button>
          </div>
        </form>

        <aside
          data-testid="plan-history"
          className="rounded-2xl border border-[color:var(--sp-border)] bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <History size={16} className="text-[color:var(--sp-accent)]" aria-hidden="true" />
            <h3 className="font-sora text-base font-semibold tracking-tight text-[color:var(--sp-text)]">
              Your trip history
            </h3>
          </div>

          {historyLoading ? (
            <p className="text-sm text-[color:var(--sp-text-secondary)]">Loading…</p>
          ) : !trips.length ? (
            <p className="text-sm text-[color:var(--sp-text-secondary)]">
              No trips yet. Plan your first route.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {trips.map((trip) => (
                <li key={trip.id}>
                  <button
                    type="button"
                    data-testid={`plan-history-item-${trip.id}`}
                    onClick={() => navigate(`/results/${trip.id}`)}
                    className="group flex w-full items-center gap-3 rounded-lg border border-[color:var(--sp-border)] bg-white px-3 py-2.5 text-left transition-all hover:-translate-y-0.5 hover:border-[color:var(--sp-border-strong)] hover:shadow-sm"
                  >
                    <div className="flex h-10 w-16 shrink-0 items-center justify-center rounded-md bg-[color:var(--sp-bg)]">
                      <TripSparkline />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[color:var(--sp-text)]">
                        <span className="truncate">{shortCity(trip.current_location)}</span>
                        <ArrowRight size={12} className="shrink-0 text-[color:var(--sp-text-tertiary)]" />
                        <span className="truncate">{shortCity(trip.dropoff_location)}</span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[color:var(--sp-text-tertiary)]">
                        <span>{trip.total_miles?.toLocaleString?.() ?? '—'} mi</span>
                        <span>·</span>
                        <span>{trip.total_drive_hours?.toFixed?.(1) ?? '—'}h</span>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        trip.is_legal
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                      title={trip.is_legal ? 'HOS legal' : 'Not legal'}
                    >
                      <CheckCircle2 size={11} aria-hidden="true" />
                      {trip.is_legal ? 'Legal' : 'Illegal'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  )
}
