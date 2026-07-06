import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
})

export async function createTrip(payload) {
  const { data } = await api.post('/api/trips/', payload)
  return data
}

export async function getTrip(tripId) {
  const { data } = await api.get(`/api/trips/${tripId}/`)
  return data
}

export async function listTrips(guestId) {
  const { data } = await api.get('/api/trips/', { params: { guest_id: guestId } })
  return data
}

export async function geocode(text) {
  const { data } = await api.get('/api/geocode/', { params: { text } })
  return data
}

export default api
