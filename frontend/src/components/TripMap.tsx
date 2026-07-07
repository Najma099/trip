import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Polyline, CircleMarker, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import useReducedMotion from '../hooks/useReducedMotion'
import { STOP_META } from '../constants/stopColors'
import type { RouteStop } from '../types/trip'

function spreadOverlappingStops(stops: RouteStop[]): [number, number][] {
  const groups = new Map<string, number[]>()

  stops.forEach((stop, index) => {
    const key = `${stop.lat.toFixed(5)}:${stop.lng.toFixed(5)}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(index)
  })

  const centers: [number, number][] = stops.map((stop) => [stop.lat, stop.lng])

  groups.forEach((indices) => {
    if (indices.length <= 1) return

    const radius = 0.006
    const step = (2 * Math.PI) / indices.length

    indices.forEach((index, offsetIndex) => {
      const angle = step * offsetIndex
      const lat = stops[index].lat
      centers[index] = [
        lat + radius * Math.sin(angle),
        stops[index].lng + (radius * Math.cos(angle)) / Math.cos((lat * Math.PI) / 180),
      ]
    })
  })

  return centers
}

function FitBounds({ bounds }: { bounds: L.LatLngBounds }) {
  const map = useMap()
  useEffect(() => {
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40] })
  }, [map, bounds])
  return null
}

function AnimatedRoute({
  positions,
  onProgress,
  reduceMotion,
}: {
  positions: [number, number][]
  onProgress?: (index: number) => void
  reduceMotion: boolean
}) {
  const animatedRef = useRef<L.Polyline>(null)
  const animationDone = useRef(false)

  useEffect(() => {
    onProgress?.(positions.length - 1)
  }, [positions, onProgress])

  useEffect(() => {
    if (animationDone.current || !animatedRef.current || reduceMotion) return
    const el = animatedRef.current.getElement?.()
    if (!el) return
    const len = el.getTotalLength?.() ?? 0
    if (len <= 0) return
    animationDone.current = true
    el.style.strokeDasharray = `${len}`
    el.style.strokeDashoffset = `${len}`
    el.style.transition = 'stroke-dashoffset 2000ms cubic-bezier(0.2, 0.7, 0.2, 1)'
    requestAnimationFrame(() => {
      el.style.strokeDashoffset = '0'
    })
  }, [positions, reduceMotion])

  if (positions.length < 2) return null

  return (
    <>
      <Polyline
        positions={positions}
        pathOptions={{ color: '#0ea5e9', weight: 10, opacity: 0.15, lineCap: 'round', lineJoin: 'round' }}
      />
      <Polyline
        ref={animatedRef}
        positions={positions}
        pathOptions={{
          color: '#0ea5e9',
          weight: 4,
          opacity: 1,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />
    </>
  )
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

export default function TripMap({ geometry = [], stops = [] }: { geometry?: [number, number][]; stops?: RouteStop[] }) {
  const reduceMotion = useReducedMotion()
  const [truckIndex, setTruckIndex] = useState(0)
  const positions = useMemo(() => geometry.map(([lat, lng]) => [lat, lng] as [number, number]), [geometry])
  const stopCenters = useMemo(() => spreadOverlappingStops(stops), [stops])
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
        <AnimatedRoute positions={positions} onProgress={setTruckIndex} reduceMotion={reduceMotion} />
        {truckPos && <Marker position={truckPos} icon={truckIcon} zIndexOffset={1000} />}
        {stops.map((stop, i) => {
          const meta = STOP_META[stop.type] || STOP_META.deadhead
          const isMajor = stop.type === 'pickup' || stop.type === 'dropoff' || stop.type === 'deadhead'
          const radius = isMajor ? 11 : 9
          const zIndexOffset = isMajor ? 200 : 100 + i

          return (
            <CircleMarker
              key={`${stop.type}-${i}-${stop.lat}-${stop.lng}`}
              center={stopCenters[i]}
              radius={radius}
              zIndexOffset={zIndexOffset}
              fillColor={meta.color}
              fillOpacity={1}
              color="#ffffff"
              weight={2.5}
              opacity={1}
            >
              <Popup>
                <strong>{meta.label}</strong>
                <br />
                {stop.location_label}
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>

      <div
        data-testid="map-legend"
        className="pointer-events-none absolute bottom-3 left-3 z-[500] flex flex-wrap gap-1.5 rounded-lg border border-[color:var(--sp-border)] bg-white/95 px-3 py-2 shadow-sm backdrop-blur-sm"
      >
        {Object.entries(STOP_META).map(([key, { label, color }]) => (
          <span key={key} className="flex items-center gap-1.5 text-[10px] font-medium text-[color:var(--sp-text-secondary)]">
            <span className="h-2.5 w-2.5 rounded-full ring-1 ring-white" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
