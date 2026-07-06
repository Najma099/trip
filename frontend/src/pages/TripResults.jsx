import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getTrip } from '../services/api'
import HeroBanner from '../components/HeroBanner'
import VerdictBadge from '../components/VerdictBadge'
import StatCard from '../components/StatCard'
import TripMap from '../components/TripMap'
import StopTimeline from '../components/StopTimeline'
import DaySelector from '../components/DaySelector'
import DailyCharts from '../components/DailyCharts'
import FMCSALogSheet from '../components/FMCSALogSheet'
import { shortCity } from '../utils/format'

const HERO_IMG =
  'https://images.pexels.com/photos/27508769/pexels-photo-27508769.jpeg?auto=compress&cs=tinysrgb&w=940'

export default function TripResults() {
  const { tripId } = useParams()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDay, setSelectedDay] = useState(null)

  useEffect(() => {
    getTrip(tripId)
      .then((data) => {
        setTrip(data)
        if (data.daily_logs?.length) setSelectedDay(data.daily_logs[0].date)
      })
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load trip'))
      .finally(() => setLoading(false))
  }, [tripId])

  if (loading) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 text-[color:var(--sp-text-secondary)]">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[color:var(--sp-border)] border-t-[color:var(--sp-accent)]" />
        <p>Loading trip dashboard…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      </div>
    )
  }

  if (!trip) return null

  const activeDay = trip.daily_logs?.find((d) => d.date === selectedDay) || trip.daily_logs?.[0]
  const dayIndex = trip.daily_logs?.findIndex((d) => d.date === selectedDay) ?? 0
  const routeTitle = `${shortCity(trip.current_location)} → ${shortCity(trip.dropoff_location)}`
  const viaLine = `${trip.current_location} → ${trip.pickup_location} → ${trip.dropoff_location}`

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <HeroBanner
        testId="trip-hero"
        imageSrc={HERO_IMG}
        imageAlt="Semi truck on open road"
        eyebrow={`Trip #${trip.trip_id}`}
        title={routeTitle}
        subtitle={viaLine}
        rightSlot={<VerdictBadge isLegal={trip.is_legal} />}
      />

      {!trip.is_legal && trip.not_legal_reason && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {trip.not_legal_reason}
        </p>
      )}

      <div data-testid="trip-stats" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          testId="stat-distance"
          label="Distance"
          display={`${(trip.route?.distance_miles ?? trip.total_miles)?.toLocaleString?.() ?? '—'} mi`}
          hint="road-adjusted"
          icon="distance"
        />
        <StatCard
          testId="stat-drive-hours"
          label="Drive Hours"
          display={`${trip.total_drive_hours?.toFixed?.(1) ?? '—'}h`}
          hint="@ ~55 mph"
          icon="drive"
        />
        <StatCard
          testId="stat-cycle-used"
          label="Cycle Used"
          display={trip.cycle_used_at_end?.toFixed?.(2) ?? '—'}
          hint="/ 70h"
          icon="cycle"
          highlight
        />
        <StatCard
          testId="stat-log-days"
          label="Log Days"
          display={String(trip.daily_logs?.length ?? 0)}
          hint="days"
          icon="days"
        />
      </div>

      <div
        data-testid="trip-map-timeline"
        className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)]"
      >
        <TripMap geometry={trip.route?.geometry} stops={trip.stops} />
        <StopTimeline stops={trip.stops} loadedMiles={trip.route?.loaded_miles} />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <span className="eyebrow">Daily Record of Duty</span>
            <h2 className="mt-1 font-sora text-2xl font-semibold tracking-tight text-[color:var(--sp-text)]">
              Daily logs
            </h2>
          </div>
          <p className="text-xs text-[color:var(--sp-text-tertiary)]">
            {trip.daily_logs?.length} day{trip.daily_logs?.length !== 1 ? 's' : ''} · click a pill to switch the log below.
          </p>
        </div>
        <DaySelector
          dailyLogs={trip.daily_logs}
          selectedDate={selectedDay}
          onSelect={setSelectedDay}
        />
      </div>

      <DailyCharts day={activeDay} />

      <FMCSALogSheet
        day={activeDay}
        dayIndex={dayIndex >= 0 ? dayIndex : 0}
        totalDays={trip.daily_logs?.length ?? 1}
      />
    </div>
  )
}
