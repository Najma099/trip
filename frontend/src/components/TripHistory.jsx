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
  if (!trips.length) return null

  return (
    <aside className="card trip-history">
      <h3>Your Recent Trips</h3>
      <ul className="trip-history-list">
        {trips.map((trip) => (
          <li key={trip.id} className="trip-history-item">
            <div>
              <Link to={`/results/${trip.id}`}>
                {trip.current_location} → {trip.dropoff_location}
              </Link>
              <div className="trip-history-meta">
                {trip.total_miles?.toFixed?.(0)} mi ·{' '}
                {trip.is_legal ? 'Legal' : 'Not legal'} ·{' '}
                {new Date(trip.created_at).toLocaleDateString()}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  )
}
