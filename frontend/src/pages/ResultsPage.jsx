import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getTrip } from '../services/api'
import MapView from '../components/MapView'
import LogSheet from '../components/LogSheet'
import DayWiseChart from '../components/DayWiseChart'
import TripTimeline from '../components/TripTimeline'

export default function ResultsPage() {
  const { tripId } = useParams()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getTrip(tripId)
      .then(setTrip)
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load trip'))
      .finally(() => setLoading(false))
  }, [tripId])

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Planning your route…</p>
      </div>
    )
  }
  if (error) return <p className="error-banner">{error}</p>
  if (!trip) return null

  return (
    <section className="results">
      <div className="results-header card">
        <div>
          <p className="eyebrow">Trip #{trip.trip_id}</p>
          <h2>{trip.current_location} → {trip.dropoff_location}</h2>
          <p className="route-via">via {trip.pickup_location}</p>
        </div>
        <Link to="/plan" className="btn btn-primary">Plan Another</Link>
      </div>

      <div className={`verdict card ${trip.is_legal ? 'legal' : 'illegal'}`}>
        <strong>{trip.is_legal ? '✓ Legal trip plan' : '✗ Trip not completable'}</strong>
        {!trip.is_legal && trip.not_legal_reason && <p>{trip.not_legal_reason}</p>}
      </div>

      <div className="stats-grid card">
        <div className="stat">
          <span className="stat-label">Distance</span>
          <span className="stat-value">{trip.route?.distance_miles?.toFixed?.(0) ?? trip.total_miles} mi</span>
        </div>
        <div className="stat">
          <span className="stat-label">Drive Hours</span>
          <span className="stat-value">{trip.total_drive_hours?.toFixed?.(1)} h</span>
        </div>
        <div className="stat">
          <span className="stat-label">Cycle at End</span>
          <span className="stat-value">{trip.cycle_used_at_end?.toFixed?.(1)} / 70 h</span>
        </div>
        <div className="stat">
          <span className="stat-label">Log Days</span>
          <span className="stat-value">{trip.daily_logs?.length ?? 0}</span>
        </div>
      </div>

      <div className="results-dashboard">
        <MapView geometry={trip.route?.geometry} stops={trip.stops} />
        <TripTimeline stops={trip.stops} />
      </div>

      <DayWiseChart dailyLogs={trip.daily_logs} />
      <LogSheet dailyLogs={trip.daily_logs} />
    </section>
  )
}
