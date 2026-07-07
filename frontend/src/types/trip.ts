export type StopType = 'pickup' | 'dropoff' | 'fuel' | 'rest' | 'break' | 'deadhead'

export interface RouteStop {
  type: StopType
  lat: number
  lng: number
  location_label: string
  arrival: string
  departure: string
}

export interface RouteGeometry {
  geometry: [number, number][]
  distance_miles: number
  loaded_miles: number
  duration_hours: number
}

export interface DailyLogSegment {
  status: string
  start: string
  end: string
  location?: string
  remark?: string
}

export interface DailyLog {
  date: string
  segments: DailyLogSegment[]
  total_driving_hours: number
  total_on_duty_hours: number
  total_off_duty_hours: number
}

export interface TripResult {
  trip_id: number
  current_location: string
  pickup_location: string
  dropoff_location: string
  current_cycle_used: number
  start_at: string | null
  end_at: string | null
  total_miles: number
  total_drive_hours: number
  is_legal: boolean
  cycle_used_at_end: number
  not_legal_reason: string
  route: RouteGeometry
  stops: RouteStop[]
  daily_logs: DailyLog[]
  created_at: string
}
