import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getTrip } from '../services/api'
import MapView from '../components/MapView'
import LogSheet from '../components/LogSheet'
import DayWiseChart from '../components/DayWiseChart'
import TripTimeline from '../components/TripTimeline'
import DaySelector from '../components/DaySelector'
import './ResultsPage.css'

export default function ResultsPage() {
  const { tripId } = useParams()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDay, setSelectedDay] = useState(null)

  useEffect(() => {
    getTrip(tripId)
      .then((data) => {
        setTrip(data)
        if (data.daily_logs?.length) {
          setSelectedDay(data.daily_logs[0].date)
        }
      })
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load trip'))
      .finally(() => setLoading(false))
  }, [tripId])

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading trip dashboard…</p>
      </div>
    )
  }
  if (error) return <p className="error-banner">{error}</p>
  if (!trip) return null

  const dateRange =
    trip.daily_logs?.length >= 2
      ? `${formatShortDate(trip.daily_logs[0].date)} — ${formatShortDate(trip.daily_logs[trip.daily_logs.length - 1].date)}`
      : formatShortDate(trip.daily_logs?.[0]?.date)

  return (
    <section className="results page-enter">
      <header className="results__header">
        <div>
          <p className="eyebrow">Trip #{trip.trip_id}</p>
          <h1 className="results__title">
            {shortCity(trip.current_location)} → {shortCity(trip.dropoff_location)}
          </h1>
          <p className="results__meta">
            via {shortCity(trip.pickup_location)} · {dateRange} · {trip.daily_logs?.length} log days
          </p>
        </div>
        <Link to="/plan" className="btn btn-primary">Plan Another</Link>
      </header>

      <div className={`verdict ${trip.is_legal ? 'verdict--legal' : 'verdict--illegal'}`}>
        <span className="verdict__icon">{trip.is_legal ? '✓' : '✗'}</span>
        <div>
          <strong>{trip.is_legal ? 'Legal trip plan' : 'Trip not completable'}</strong>
          {!trip.is_legal && trip.not_legal_reason && <p>{trip.not_legal_reason}</p>}
        </div>
      </div>

      <div className="results__stats">
        <StatCard label="Distance" value={trip.route?.distance_miles?.toFixed?.(0) ?? trip.total_miles} unit="mi" />
        <StatCard label="Drive Hours" value={trip.total_drive_hours?.toFixed?.(1)} unit="hrs" />
        <StatCard label="Cycle Used" value={trip.cycle_used_at_end?.toFixed?.(1)} unit="/ 70h" />
        <StatCard label="Log Days" value={trip.daily_logs?.length ?? 0} unit="days" highlight />
      </div>

      <div className="results__map-row">
        <MapView geometry={trip.route?.geometry} stops={trip.stops} />
        <TripTimeline stops={trip.stops} />
      </div>

      <section className="results__days card">
        <h2 className="section-title">Trip days</h2>
        <p className="section-sub">Select a day to view hours chart and FMCSA log sheet</p>
        <DaySelector
          dailyLogs={trip.daily_logs}
          selectedDate={selectedDay}
          onSelect={setSelectedDay}
        />
      </section>

      <DayWiseChart
        dailyLogs={trip.daily_logs}
        selectedDate={selectedDay}
        onSelectDay={setSelectedDay}
      />

      <LogSheet
        dailyLogs={trip.daily_logs}
        selectedDate={selectedDay}
      />
    </section>
  )
}

function StatCard({ label, value, unit, highlight }) {
  return (
    <div className={`stat-card card ${highlight ? 'stat-card--highlight' : ''}`}>
      <span className="stat-card__label">{label}</span>
      <div className="stat-card__row">
        <span className="stat-card__value">{value}</span>
        <span className="stat-card__unit">{unit}</span>
      </div>
    </div>
  )
}

function shortCity(loc) {
  return loc?.split(',')[0]?.trim() || loc
}

function formatShortDate(iso) {
  if (!iso) return ''
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
