import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const STOP_META = {
  pickup: { label: 'Pickup', color: 'var(--stop-pickup)' },
  dropoff: { label: 'Dropoff', color: 'var(--stop-dropoff)' },
  fuel: { label: 'Fuel', color: 'var(--stop-fuel)' },
  rest: { label: '10-hour Rest', color: 'var(--stop-rest)' },
  break: { label: '30-min Break', color: 'var(--stop-break)' },
  deadhead: { label: 'Origin', color: 'var(--stop-deadhead)' },
}

function FitBounds({ bounds }) {
  const map = useMap()
  useEffect(() => {
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40] })
  }, [map, bounds])
  return null
}

function AnimatedRoute({ positions, onProgress }) {
  const [visibleCount, setVisibleCount] = useState(0)
  const pathRef = useRef(null)
  const [pathLength, setPathLength] = useState(0)

  useEffect(() => {
    setVisibleCount(positions.length)
    onProgress?.(positions.length - 1)
  }, [positions, onProgress])

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength?.() ?? 0)
    }
  }, [positions])

  if (positions.length < 2) return null

  return (
    <>
      <Polyline
        positions={positions}
        pathOptions={{ color: '#0ea5e9', weight: 10, opacity: 0.15, lineCap: 'round', lineJoin: 'round' }}
      />
      <Polyline
        ref={pathRef}
        positions={positions.slice(0, Math.max(2, visibleCount))}
        pathOptions={{
          color: '#0ea5e9',
          weight: 4,
          opacity: 1,
          lineCap: 'round',
          lineJoin: 'round',
          dashArray: pathLength || undefined,
          dashOffset: pathLength ? 0 : undefined,
        }}
        eventHandlers={{
          add: (e) => {
            const len = e.target.getElement()?.getTotalLength?.() ?? 0
            setPathLength(len)
            const el = e.target.getElement()
            if (el) {
              el.style.strokeDasharray = `${len}`
              el.style.strokeDashoffset = `${len}`
              el.style.transition = 'stroke-dashoffset 2000ms cubic-bezier(0.2, 0.7, 0.2, 1)'
              requestAnimationFrame(() => {
                el.style.strokeDashoffset = '0'
              })
            }
          },
        }}
      />
    </>
  )
}

function makeStopIcon(color, size = 18) {
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:999px;background:${color};border:2.5px solid white;box-shadow:0 2px 6px rgba(15,23,42,0.2)"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function TruckMarkerIcon() {
  return L.divIcon({
    className: 'sp-truck-marker',
    html: `<div style="width:34px;height:34px;border-radius:999px;background:#ffffff;border:2px solid #1e3a8a;display:grid;place-items:center;box-shadow:0 6px 14px -4px rgba(15,23,42,0.35), 0 2px 4px rgba(15,23,42,0.15)">
      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
    </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  })
}

export default function TripMap({ geometry = [], stops = [] }) {
  const [truckIndex, setTruckIndex] = useState(0)
  const positions = useMemo(() => geometry.map(([lat, lng]) => [lat, lng]), [geometry])

  const truckIcon = useMemo(() => TruckMarkerIcon(), [])

  if (!geometry.length) {
    return (
      <div className="flex h-[420px] items-center justify-center rounded-xl border border-[color:var(--sp-border)] bg-white text-sm text-[color:var(--sp-text-secondary)] sm:h-[520px]">
        No route geometry available.
      </div>
    )
  }

  const bounds = L.latLngBounds(positions)
  const truckPos = positions[Math.min(truckIndex, positions.length - 1)]

  return (
    <div
      data-testid="trip-map"
      className="relative h-[420px] w-full overflow-hidden rounded-xl border border-[color:var(--sp-border)] shadow-sm sm:h-[520px]"
    >
      <MapContainer bounds={bounds} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='© <a href="https://carto.com/">Carto</a> · <a href="https://openstreetmap.org">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <FitBounds bounds={bounds} />
        <AnimatedRoute positions={positions} onProgress={setTruckIndex} />
        {truckPos && <Marker position={truckPos} icon={truckIcon} zIndexOffset={1000} />}
        {stops.map((stop, i) => {
          const meta = STOP_META[stop.type] || STOP_META.deadhead
          const isMajor = stop.type === 'pickup' || stop.type === 'dropoff' || stop.type === 'deadhead'
          return (
            <Marker
              key={`${stop.type}-${i}`}
              position={[stop.lat, stop.lng]}
              icon={makeStopIcon(meta.color, isMajor ? 18 : 12)}
            >
              <Popup>
                <strong>{meta.label}</strong>
                <br />
                {stop.location_label}
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      <div
        data-testid="map-legend"
        className="pointer-events-none absolute bottom-3 left-3 z-[500] flex flex-wrap gap-1.5 rounded-lg border border-[color:var(--sp-border)] bg-white/95 px-3 py-2 shadow-sm backdrop-blur-sm"
      >
        {Object.entries(STOP_META).map(([key, { label, color }]) => (
          <span key={key} className="flex items-center gap-1.5 text-[10px] font-medium text-[color:var(--sp-text-secondary)]">
            <span className="h-2 w-2 rounded-full ring-1 ring-white" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
