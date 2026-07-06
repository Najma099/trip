import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet'
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

function makeIcon(color) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

export default function MapView({ geometry = [], stops = [] }) {
  if (!geometry.length) {
    return <div className="map-empty card">No route geometry available.</div>
  }

  const positions = geometry.map(([lat, lng]) => [lat, lng])
  const bounds = L.latLngBounds(positions)

  return (
    <div className="map-wrapper card">
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [40, 40] }}
        scrollWheelZoom={false}
        className="trip-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={positions} pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.85 }} />
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
