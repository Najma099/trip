import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGuest } from '../context/GuestContext'
import { createTrip } from '../services/api'

const DEMO = {
  current_location: 'Dallas, TX',
  pickup_location: 'Houston, TX',
  dropoff_location: 'Chicago, IL',
  current_cycle_used: 20,
}

export default function TripForm({ autoFillDemo = false }) {
  const { guestId } = useGuest()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    current_location: '',
    pickup_location: '',
    dropoff_location: '',
    current_cycle_used: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (autoFillDemo) {
      setForm({ ...DEMO, current_cycle_used: String(DEMO.current_cycle_used) })
    }
  }, [autoFillDemo])

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

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
    <form className="trip-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label htmlFor="current_location">Current Location</label>
        <input
          id="current_location"
          value={form.current_location}
          onChange={(e) => updateField('current_location', e.target.value)}
          placeholder="Dallas, TX"
          required
        />
      </div>
      <div className="form-row">
        <label htmlFor="pickup_location">Pickup Location</label>
        <input
          id="pickup_location"
          value={form.pickup_location}
          onChange={(e) => updateField('pickup_location', e.target.value)}
          placeholder="Houston, TX"
          required
        />
      </div>
      <div className="form-row">
        <label htmlFor="dropoff_location">Dropoff Location</label>
        <input
          id="dropoff_location"
          value={form.dropoff_location}
          onChange={(e) => updateField('dropoff_location', e.target.value)}
          placeholder="Chicago, IL"
          required
        />
      </div>
      <div className="form-row">
        <label htmlFor="current_cycle_used">Current Cycle Used (hours)</label>
        <input
          id="current_cycle_used"
          type="number"
          min="0"
          max="70"
          step="0.5"
          value={form.current_cycle_used}
          onChange={(e) => updateField('current_cycle_used', e.target.value)}
          placeholder="20"
          required
        />
      </div>

      {error && <p className="error-banner">{error}</p>}

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={fillDemo}>
          Load Demo Trip
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading || !guestId}>
          {loading ? 'Planning…' : 'Plan Trip'}
        </button>
      </div>
    </form>
  )
}
