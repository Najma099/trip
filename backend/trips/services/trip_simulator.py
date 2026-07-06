from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone

from trips.hos_constants import (
    DEADHEAD_SKIP_KM,
    DEFAULT_AVG_SPEED_MPH,
    DEFAULT_START_HOUR,
    DROPOFF_ON_DUTY_MINUTES,
    FUEL_INTERVAL_MILES,
    PICKUP_ON_DUTY_MINUTES,
    PRE_TRIP_ON_DUTY_MINUTES,
)
from trips.services.hos_engine import HOSEngine, SegmentRecord
from trips.services.log_builder import DailyLog, build_daily_logs
from trips.services.routing import GeoPoint, ORSClient, RouteLeg, haversine_km


@dataclass
class StopRecord:
    stop_type: str
    lat: float
    lng: float
    location_label: str
    arrival_time: datetime
    departure_time: datetime | None = None


@dataclass
class TripSimulationResult:
    segments: list[SegmentRecord] = field(default_factory=list)
    stops: list[StopRecord] = field(default_factory=list)
    daily_logs: list[DailyLog] = field(default_factory=list)
    route_geometry: list[list[float]] = field(default_factory=list)
    distance_miles: float = 0.0
    duration_hours: float = 0.0
    total_drive_hours: float = 0.0
    start_at: datetime | None = None
    end_at: datetime | None = None
    is_legal: bool = True
    not_legal_reason: str = ""
    cycle_used_at_end: float = 0.0


def _default_start_time() -> datetime:
    now = datetime.now(timezone.utc)
    return now.replace(hour=DEFAULT_START_HOUR, minute=0, second=0, microsecond=0)


def _drive_with_fuel_stops(
    engine: HOSEngine,
    distance_miles: float,
    lat: float,
    lng: float,
    location_label: str,
    stops: list[StopRecord],
) -> bool:
    remaining = distance_miles
    while remaining > 0.01:
        chunk = min(remaining, FUEL_INTERVAL_MILES)
        if not engine.drive(chunk, avg_speed_mph=DEFAULT_AVG_SPEED_MPH, lat=lat, lng=lng, location_label=location_label):
            return False
        remaining -= chunk
        if remaining > 0.01:
            fuel_start = engine.clock
            if not engine.on_duty(30, lat=lat, lng=lng, location_label=f"Fuel stop — {location_label}"):
                return False
            stops.append(
                StopRecord(
                    stop_type="fuel",
                    lat=lat,
                    lng=lng,
                    location_label=f"Fuel stop — {location_label}",
                    arrival_time=fuel_start,
                    departure_time=engine.clock,
                )
            )
    return True


def _record_stop_from_on_duty(
    engine: HOSEngine,
    stop_type: str,
    duration_minutes: float,
    point: GeoPoint,
    stops: list[StopRecord],
) -> bool:
    arrival = engine.clock
    if not engine.on_duty(duration_minutes, lat=point.lat, lng=point.lng, location_label=point.label):
        return False
    stops.append(
        StopRecord(
            stop_type=stop_type,
            lat=point.lat,
            lng=point.lng,
            location_label=point.label,
            arrival_time=arrival,
            departure_time=engine.clock,
        )
    )
    return True


def simulate_trip(
    current_location: str,
    pickup_location: str,
    dropoff_location: str,
    current_cycle_used: float,
    ors_client: ORSClient | None = None,
    start_time: datetime | None = None,
) -> TripSimulationResult:
    client = ors_client or ORSClient()
    start = start_time or _default_start_time()

    current = client.geocode(current_location)
    pickup = client.geocode(pickup_location)
    dropoff = client.geocode(dropoff_location)

    legs: list[RouteLeg] = []
    skip_deadhead = haversine_km(current.lat, current.lng, pickup.lat, pickup.lng) < DEADHEAD_SKIP_KM

    if not skip_deadhead:
        legs.append(client.route_hgv(current, pickup))

    legs.append(client.route_hgv(pickup, dropoff))

    geometry: list[list[float]] = []
    for leg in legs:
        geometry.extend(leg.geometry)

    total_miles = sum(leg.distance_miles for leg in legs)
    total_duration = sum(leg.duration_hours for leg in legs)

    engine = HOSEngine(current_cycle_used_hrs=current_cycle_used, start_time=start)
    stops: list[StopRecord] = []

    # Pre-trip inspection at current location
    engine.on_duty(PRE_TRIP_ON_DUTY_MINUTES, lat=current.lat, lng=current.lng, location_label=current.label)

    if not skip_deadhead:
        deadhead = legs[0]
        if not engine.drive(
            deadhead.distance_miles,
            avg_speed_mph=DEFAULT_AVG_SPEED_MPH,
            lat=deadhead.start.lat,
            lng=deadhead.start.lng,
            location_label=f"Deadhead to {pickup.label}",
        ):
            return _build_partial_result(engine, stops, geometry, total_miles, total_duration)

    # Pickup — 1 hour on duty
    if not _record_stop_from_on_duty(engine, "pickup", PICKUP_ON_DUTY_MINUTES, pickup, stops):
        return _build_partial_result(engine, stops, geometry, total_miles, total_duration)

    loaded_leg = legs[-1]
    if not _drive_with_fuel_stops(
        engine,
        loaded_leg.distance_miles,
        loaded_leg.end.lat,
        loaded_leg.end.lng,
        loaded_leg.end.label,
        stops,
    ):
        return _build_partial_result(engine, stops, geometry, total_miles, total_duration)

    # Dropoff — 1 hour on duty
    if not _record_stop_from_on_duty(engine, "dropoff", DROPOFF_ON_DUTY_MINUTES, dropoff, stops):
        return _build_partial_result(engine, stops, geometry, total_miles, total_duration)

    # Collect rest/break stops from off-duty segments >= 30 min (excluding short breaks counted as stops)
    for seg in engine.segments:
        duration_min = (seg.end_time - seg.start_time).total_seconds() / 60
        if seg.status == "off" and duration_min >= 30:
            stop_type = "rest" if duration_min >= 600 else "break"
            if duration_min >= 34 * 60:
                stop_type = "rest"
            stops.append(
                StopRecord(
                    stop_type=stop_type,
                    lat=seg.location_lat or dropoff.lat,
                    lng=seg.location_lng or dropoff.lng,
                    location_label=seg.location_label or "Rest stop",
                    arrival_time=seg.start_time,
                    departure_time=seg.end_time,
                )
            )

    result = engine.finish()
    drive_hours = sum(
        (s.end_time - s.start_time).total_seconds() / 3600 for s in result.segments if s.status == "driving"
    )

    return TripSimulationResult(
        segments=result.segments,
        stops=_dedupe_stops(stops),
        daily_logs=build_daily_logs(result.segments),
        route_geometry=geometry,
        distance_miles=round(total_miles, 2),
        duration_hours=round(total_duration, 2),
        total_drive_hours=round(drive_hours, 2),
        start_at=result.segments[0].start_time if result.segments else start,
        end_at=result.segments[-1].end_time if result.segments else start,
        is_legal=result.is_legal,
        not_legal_reason=result.not_legal_reason,
        cycle_used_at_end=result.cycle_used_at_end,
    )


def _dedupe_stops(stops: list[StopRecord]) -> list[StopRecord]:
    seen: set[tuple] = set()
    unique: list[StopRecord] = []
    for s in sorted(stops, key=lambda x: x.arrival_time):
        key = (s.stop_type, s.arrival_time.isoformat())
        if key not in seen:
            seen.add(key)
            unique.append(s)
    return unique


def _build_partial_result(
    engine: HOSEngine,
    stops: list[StopRecord],
    geometry: list[list[float]],
    total_miles: float,
    total_duration: float,
) -> TripSimulationResult:
    result = engine.finish()
    drive_hours = sum(
        (s.end_time - s.start_time).total_seconds() / 3600 for s in result.segments if s.status == "driving"
    )
    return TripSimulationResult(
        segments=result.segments,
        stops=_dedupe_stops(stops),
        daily_logs=build_daily_logs(result.segments) if result.is_legal else [],
        route_geometry=geometry,
        distance_miles=round(total_miles, 2),
        duration_hours=round(total_duration, 2),
        total_drive_hours=round(drive_hours, 2),
        start_at=result.segments[0].start_time if result.segments else None,
        end_at=result.segments[-1].end_time if result.segments else None,
        is_legal=result.is_legal,
        not_legal_reason=result.not_legal_reason,
        cycle_used_at_end=result.cycle_used_at_end,
    )
