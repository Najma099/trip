/** Literal hex values for map stop markers (Leaflet divIcons cannot resolve CSS vars in inline HTML). */
export const STOP_COLORS = {
  pickup: '#2563eb',
  dropoff: '#7c3aed',
  fuel: '#d97706',
  rest: '#059669',
  break: '#0891b2',
  deadhead: '#64748b',
}

export const STOP_META = {
  pickup: { label: 'Pickup', color: STOP_COLORS.pickup },
  dropoff: { label: 'Dropoff', color: STOP_COLORS.dropoff },
  fuel: { label: 'Fuel', color: STOP_COLORS.fuel },
  rest: { label: '10-hour Rest', color: STOP_COLORS.rest },
  break: { label: '30-min Break', color: STOP_COLORS.break },
  deadhead: { label: 'Origin', color: STOP_COLORS.deadhead },
}
