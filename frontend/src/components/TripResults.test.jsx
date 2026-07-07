import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

const mockTrip = {
  trip_id: 1,
  current_location: 'Dallas, TX',
  pickup_location: 'Houston, TX',
  dropoff_location: 'Chicago, IL',
  current_cycle_used: 20,
  total_miles: 1000,
  total_drive_hours: 18.5,
  is_legal: true,
  cycle_used_at_end: 48.5,
  not_legal_reason: '',
  route: {
    geometry: [[40.7128, -74.006]],
    distance_miles: 1000,
    loaded_miles: 700,
    duration_hours: 20.5,
  },
  stops: [
    { type: 'deadhead', lat: 32.7767, lng: -96.797, location_label: 'Dallas, TX', arrival: '2025-01-01T08:00:00Z', departure: '2025-01-01T08:00:00Z' },
    { type: 'pickup', lat: 29.7604, lng: -95.3698, location_label: 'Houston, TX', arrival: '2025-01-01T10:00:00Z', departure: '2025-01-01T11:00:00Z' },
    { type: 'dropoff', lat: 41.8781, lng: -87.6298, location_label: 'Chicago, IL', arrival: '2025-01-02T06:00:00Z', departure: '2025-01-02T06:00:00Z' },
  ],
  daily_logs: [
    {
      date: '2025-01-01',
      segments: [
        { status: 'off', start: '00:00', end: '08:00', location: 'Dallas, TX' },
        { status: 'driving', start: '08:00', end: '10:00', location: '' },
      ],
      total_driving_hours: 2,
      total_on_duty_hours: 3,
      total_off_duty_hours: 21,
    },
  ],
  created_at: '2025-01-01T08:00:00Z',
}

vi.mock('../services/api', () => ({
  getTrip: vi.fn(() => Promise.resolve(mockTrip)),
}))

vi.mock('../components/TripMap', () => ({
  default: () => <div data-testid="trip-map" />,
}))

vi.mock('../components/StopTimeline', () => ({
  default: () => <div data-testid="stop-timeline" />,
}))

vi.mock('../components/DaySelector', () => ({
  default: () => <div data-testid="day-selector" />,
}))

vi.mock('../components/DailyCharts', () => ({
  default: () => <div data-testid="daily-charts" />,
}))

vi.mock('../components/FMCSALogSheet', () => ({
  default: () => <div data-testid="fmcsa-log-sheet" />,
}))

import TripResults from '../pages/TripResults'

describe('TripResults', () => {
  it('renders loading state initially', () => {
    render(
      <MemoryRouter initialEntries={['/results/1']}>
        <Routes>
          <Route path="/results/:tripId" element={<TripResults />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText(/Loading trip dashboard/i)).toBeInTheDocument()
  })

  it('renders trip data after loading', async () => {
    render(
      <MemoryRouter initialEntries={['/results/1']}>
        <Routes>
          <Route path="/results/:tripId" element={<TripResults />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('trip-stats')).toBeInTheDocument()
    })

    expect(screen.getByTestId('trip-map')).toBeInTheDocument()
    expect(screen.getByTestId('stop-timeline')).toBeInTheDocument()
    expect(screen.getByTestId('daily-charts')).toBeInTheDocument()
    expect(screen.getByTestId('fmcsa-log-sheet')).toBeInTheDocument()
  })
})
