import type { StopType } from '../types/trip'

export const STOP_COLORS: Record<StopType, string> = {
  pickup: '#2563eb',
  dropoff: '#7c3aed',
  fuel: '#d97706',
  rest: '#059669',
  break: '#0891b2',
  deadhead: '#64748b',
}

export interface StopMeta {
  label: string
  color: string
}

export const STOP_META: Record<StopType, StopMeta> = {
  pickup: { label: 'Pickup', color: STOP_COLORS.pickup },
  dropoff: { label: 'Dropoff', color: STOP_COLORS.dropoff },
  fuel: { label: 'Fuel', color: STOP_COLORS.fuel },
  rest: { label: '10-hour Rest', color: STOP_COLORS.rest },
  break: { label: '30-min Break', color: STOP_COLORS.break },
  deadhead: { label: 'Origin', color: STOP_COLORS.deadhead },
}
