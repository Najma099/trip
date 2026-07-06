import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './MapView.css'

const STOP_COLORS = {
  pickup: '#3b82f6',
  dropoff: '#8b5cf6',
  fuel: '#f59e0b',
  rest: '#22c55e',
  break: '#06b6d4',
  deadhead: '#64748b',
}

function makeIcon(color, size = 14) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

const truckIcon = L.divIcon({
  className: 'truck-marker',
  html: `<div class="truck-pin">🚛</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

function FitBounds({ bounds }) {
  const map = useMap()
  useEffect(() => {
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40] })
    }
  }, [map, bounds])
  return null
}

function AnimatedPolyline({ positions, onProgress }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount(0)
    if (positions.length < 2) return

    const step = Math.max(1, Math.floor(positions.length / 150))
    let current = 0
    const timer = setInterval(() => {
      current += step
      if (current >= positions.length) {
        setCount(positions.length)
        onProgress?.(positions.length - 1)
        clearInterval(timer)
      } else {
        setCount(current)
        onProgress?.(current - 1)
      }
    }, 25)

    return () => clearInterval(timer)
  }, [positions, onProgress])

  const visible = positions.slice(0, Math.max(2, count))
  if (visible.length < 2) return null

  return (
    <>
      <Polyline
        positions={visible}
        pathOptions={{ color: '#1d4ed8', weight: 6, opacity: 0.2 }}
      />
      <Polyline
        positions={visible}
        pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.9 }}
      />
    </>
  )
}

export default function MapView({ geometry = [], stops = [] }) {
  const [truckIndex, setTruckIndex] = useState(0)

  const positions = useMemo(
    () => geometry.map(([lat, lng]) => [lat, lng]),
    [geometry]
  )

  if (!geometry.length) {
    return <div className="map-empty card">No route geometry available.</div>
  }

  const bounds = L.latLngBounds(positions)
  const truckPos = positions[Math.min(truckIndex, positions.length - 1)]

  return (
    <div className="map-wrapper card">
      <div className="map-header">
        <h3>Route Map</h3>
        <span className="map-badge">Animated route</span>
      </div>
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [40, 40] }}
        scrollWheelZoom={true}
        className="trip-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <FitBounds bounds={bounds} />
        <AnimatedPolyline positions={positions} onProgress={setTruckIndex} />
        {truckPos && (
          <Marker position={truckPos} icon={truckIcon} zIndexOffset={1000} />
        )}
        {stops.map((stop, i) => (
          <Marker
            key={`${stop.type}-${i}`}
            position={[stop.lat, stop.lng]}
            icon={makeIcon(STOP_COLORS[stop.type] || '#94a3b8')}
          >
            <Popup>
              <strong>{stop.type}</strong>
              <br />
              {stop.location_label}
              <br />
              <small>{new Date(stop.arrival).toLocaleString()}</small>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="map-legend">
        {Object.entries(STOP_COLORS).map(([type, color]) => (
          <span key={type} className="legend-item">
            <span className="legend-dot" style={{ background: color }} />
            {type}
          </span>
        ))}
      </div>
    </div>
  )
}
