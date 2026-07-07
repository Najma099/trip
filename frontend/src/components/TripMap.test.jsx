import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Polyline: () => <div data-testid="polyline" />,
  CircleMarker: ({ children }) => <div data-testid="circle-marker">{children}</div>,
  Marker: () => <div data-testid="marker" />,
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
  useMap: () => ({ fitBounds: vi.fn(), invalidateSize: vi.fn() }),
}))

vi.mock('leaflet', () => ({
  default: {
    latLngBounds: () => ({ isValid: () => true, extend: () => {} }),
    divIcon: () => ({}),
  },
  latLngBounds: () => ({ isValid: () => true, extend: () => {} }),
  divIcon: () => ({}),
}))

import TripMap from './TripMap'

describe('TripMap', () => {
  it('renders fallback when geometry is empty', () => {
    render(<TripMap geometry={[]} stops={[]} />)
    expect(screen.getByText('No route geometry available.')).toBeInTheDocument()
  })

  it('renders map container when geometry is provided', () => {
    render(<TripMap geometry={[[40.7128, -74.006], [40.7580, -73.9855]]} stops={[]} />)
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  })

  it('renders legend', () => {
    render(<TripMap geometry={[[40.7128, -74.006]]} stops={[]} />)
    expect(screen.getByTestId('map-legend')).toBeInTheDocument()
  })
})
