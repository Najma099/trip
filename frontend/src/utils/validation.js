export function validateLocation(value, label) {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return `Please enter a ${label.toLowerCase()}.`
  if (trimmed.length < 2) return `${label} must be at least 2 characters.`
  return ''
}

export function validateCycleHours(value) {
  if (value === '' || value === null || value === undefined) {
    return 'Please enter cycle hours used (0–70).'
  }
  const num = parseFloat(value)
  if (Number.isNaN(num)) return 'Cycle hours must be a number.'
  if (num < 0) return 'Cycle hours cannot be negative.'
  if (num > 70) return 'Cycle hours cannot exceed 70 (70/8-day limit).'
  return ''
}

export function validateTripForm(form) {
  return {
    current_location: validateLocation(form.current_location, 'Current location'),
    pickup_location: validateLocation(form.pickup_location, 'Pickup location'),
    dropoff_location: validateLocation(form.dropoff_location, 'Dropoff location'),
    current_cycle_used: validateCycleHours(form.current_cycle_used),
  }
}

export function formHasErrors(errors) {
  return Object.values(errors).some(Boolean)
}
