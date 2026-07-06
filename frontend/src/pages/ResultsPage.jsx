import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getTrip } from '../services/api'
import MapView from '../components/MapView'
import LogSheet from '../components/LogSheet'
import DayWiseChart from '../components/DayWiseChart'
import TripTimeline from '../components/TripTimeline'
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
      ? `${trip.daily_logs[0].date} — ${trip.daily_logs[trip.daily_logs.length - 1].date}`
      : trip.daily_logs?.[0]?.date || ''

  return (
    <section className="results-page page-enter">
      <div className="results-top">
        <div>
          <p className="eyebrow">Trip #{trip.trip_id}</p>
          <h1 className="results-title">
            {trip.current_location.split(',')[0]} → {trip.dropoff_location.split(',')[0]}
          </h1>
          <p className="results-meta">
            via {trip.pickup_location.split(',')[0]} · {dateRange} · {trip.daily_logs?.length} log days
          </p>
        </div>
        <Link to="/plan" className="btn btn-primary">+ Plan Another</Link>
      </div>

      <div className={`verdict-banner ${trip.is_legal ? 'legal' : 'illegal'}`}>
        <span className="verdict-icon">{trip.is_legal ? '✓' : '✗'}</span>
        <div>
          <strong>{trip.is_legal ? 'Legal trip plan' : 'Trip not completable'}</strong>
          {!trip.is_legal && trip.not_legal_reason && <p>{trip.not_legal_reason}</p>}
        </div>
      </div>

      {/* TRIPRISE-style stat cards */}
      <div className="dashboard-stats">
        <div className="stat-card card">
          <span className="stat-card-label">Distance</span>
          <span className="stat-card-value">{trip.route?.distance_miles?.toFixed?.(0) ?? trip.total_miles}</span>
          <span className="stat-card-unit">miles</span>
        </div>
        <div className="stat-card card">
          <span className="stat-card-label">Drive Hours</span>
          <span className="stat-card-value">{trip.total_drive_hours?.toFixed?.(1)}</span>
          <span className="stat-card-unit">hours</span>
        </div>
        <div className="stat-card card">
          <span className="stat-card-label">Cycle Used</span>
          <span className="stat-card-value">{trip.cycle_used_at_end?.toFixed?.(1)}</span>
          <span className="stat-card-unit">/ 70 h</span>
        </div>
        <div className="stat-card card accent">
          <span className="stat-card-label">Log Days</span>
          <span className="stat-card-value">{trip.daily_logs?.length ?? 0}</span>
          <span className="stat-card-unit">days</span>
        </div>
      </div>

      {/* Main grid: map + sidebar */}
      <div className="dashboard-grid">
        <div className="grid-main">
          <MapView geometry={trip.route?.geometry} stops={trip.stops} />
        </div>
        <div className="grid-sidebar">
          <TripTimeline stops={trip.stops} />
        </div>
      </div>

      {/* Chart + log sheet row */}
      <div className="dashboard-bottom">
        <DayWiseChart
          dailyLogs={trip.daily_logs}
          selectedDate={selectedDay}
          onSelectDay={setSelectedDay}
        />
        <LogSheet
          dailyLogs={trip.daily_logs}
          selectedDate={selectedDay}
          onSelectDate={setSelectedDay}
        />
      </div>
    </section>
  )
}
