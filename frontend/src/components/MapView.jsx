import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './MapView.css'

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function stopColors() {
  return {
    pickup: cssVar('--stop-pickup'),
    dropoff: cssVar('--stop-dropoff'),
    fuel: cssVar('--stop-fuel'),
    rest: cssVar('--stop-rest'),
    break: cssVar('--stop-break'),
    deadhead: cssVar('--stop-deadhead'),
  }
}

function makeIcon(color, size = 14) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div class="map-marker" style="background:${color};width:${size}px;height:${size}px"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function FitBounds({ bounds }) {
  const map = useMap()
  useEffect(() => {
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40] })
  }, [map, bounds])
  return null
}

function AnimatedPolyline({ positions, onProgress }) {
  const [count, setCount] = useState(0)
  const routeColor = cssVar('--route-line')
  const glowColor = cssVar('--route-line-glow')

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
      <Polyline positions={visible} pathOptions={{ color: glowColor, weight: 8, opacity: 0.35 }} />
      <Polyline positions={visible} pathOptions={{ color: routeColor, weight: 4, opacity: 0.95 }} />
    </>
  )
}

export default function MapView({ geometry = [], stops = [] }) {
  const [truckIndex, setTruckIndex] = useState(0)
  const [colors, setColors] = useState({})

  useEffect(() => {
    setColors(stopColors())
  }, [])

  const positions = useMemo(() => geometry.map(([lat, lng]) => [lat, lng]), [geometry])

  const truckIcon = useMemo(
    () =>
      L.divIcon({
        className: 'truck-marker',
        html: '<div class="truck-pin"></div>',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      }),
    []
  )

  if (!geometry.length) {
    return <div className="map-empty card">No route geometry available.</div>
  }

  const bounds = L.latLngBounds(positions)
  const truckPos = positions[Math.min(truckIndex, positions.length - 1)]

  return (
    <div className="map-wrapper card">
      <div className="map-wrapper__header">
        <h2 className="section-title">Route Map</h2>
        <span className="map-wrapper__badge">Live animation</span>
      </div>
      <MapContainer bounds={bounds} scrollWheelZoom className="trip-map">
        <TileLayer
          attribution='&copy; OpenStreetMap &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <FitBounds bounds={bounds} />
        <AnimatedPolyline positions={positions} onProgress={setTruckIndex} />
        {truckPos && <Marker position={truckPos} icon={truckIcon} zIndexOffset={1000} />}
        {stops.map((stop, i) => (
          <Marker
            key={`${stop.type}-${i}`}
            position={[stop.lat, stop.lng]}
            icon={makeIcon(colors[stop.type] || cssVar('--stop-deadhead'))}
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
        {Object.entries(colors).map(([type, color]) => (
          <span key={type} className="map-legend__item">
            <span className="map-legend__dot" style={{ background: color }} />
            {type}
          </span>
        ))}
      </div>
    </div>
  )
}
