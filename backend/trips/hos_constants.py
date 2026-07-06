"""FMCSA Hours-of-Service constants for property-carrying drivers (70-hour/8-day)."""

# 49 CFR §395.3(a)(3) — max 11 hours driving after 10 consecutive hours off
MAX_DRIVE_MINUTES = 11 * 60

# 49 CFR §395.3(a)(2) — 14-hour driving window after coming on duty
MAX_WINDOW_MINUTES = 14 * 60

# 49 CFR §395.3(a)(3)(ii) — 30-minute break after 8 cumulative driving hours
BREAK_AFTER_DRIVE_MINUTES = 8 * 60
BREAK_DURATION_MINUTES = 30

# 49 CFR §395.3(a)(1) — 10 consecutive hours off duty
DAILY_RESET_MINUTES = 10 * 60

# 49 CFR §395.3(b)(2) — 70 hours on duty in 8 consecutive days
MAX_CYCLE_HOURS = 70
CYCLE_DAYS = 8

# 49 CFR §395.3(c) — 34 consecutive hours off restarts the cycle
CYCLE_RESTART_MINUTES = 34 * 60

# Trip-specific durations
PRE_TRIP_ON_DUTY_MINUTES = 15
PICKUP_ON_DUTY_MINUTES = 60
DROPOFF_ON_DUTY_MINUTES = 60

# Fuel stop interval
FUEL_INTERVAL_MILES = 1000

# Average driving speed for time estimation (mph)
DEFAULT_AVG_SPEED_MPH = 55

# Skip deadhead if current location within this distance of pickup (km)
DEADHEAD_SKIP_KM = 5

# Default trip start hour (local simulation uses UTC)
DEFAULT_START_HOUR = 6
