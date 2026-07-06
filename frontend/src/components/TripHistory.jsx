import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGuest } from '../context/GuestContext'
import { listTrips } from '../services/api'

export default function TripHistory() {
  const { guestId } = useGuest()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!guestId) return
    listTrips(guestId)
      .then(setTrips)
      .catch(() => setTrips([]))
      .finally(() => setLoading(false))
  }, [guestId])

  if (loading) return null

  return (
    <aside className="card trip-history">
      <h2 className="section-title">Recent Trips</h2>
      {!trips.length ? (
        <p className="trip-history__empty">No trips yet. Plan your first route.</p>
      ) : (
        <ul className="trip-history__list">
          {trips.map((trip) => (
            <li key={trip.id} className="trip-history__item">
              <Link to={`/results/${trip.id}`}>
                {trip.current_location?.split(',')[0]} → {trip.dropoff_location?.split(',')[0]}
              </Link>
              <span className="trip-history__meta">
                {trip.total_miles?.toFixed?.(0)} mi · {trip.is_legal ? 'Legal' : 'Not legal'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
