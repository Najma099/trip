from django.contrib.auth import get_user_model
from django.db import transaction

from trips.models import DutyStatusSegment, RouteStop, Trip
from trips.services.trip_simulator import TripSimulationResult, simulate_trip
from trips.services.routing import ORSClient, RoutingError

User = get_user_model()


def persist_trip(
    guest_id: str | None,
    current_location: str,
    pickup_location: str,
    dropoff_location: str,
    current_cycle_used: float,
    simulation: TripSimulationResult,
    user: User | None = None,
) -> Trip:
    with transaction.atomic():
        trip = Trip.objects.create(
            user=user,
            guest_id=guest_id or None,
            current_location=current_location,
            pickup_location=pickup_location,
            dropoff_location=dropoff_location,
            current_cycle_used=current_cycle_used,
            start_at=simulation.start_at,
            end_at=simulation.end_at,
            total_miles=simulation.distance_miles,
            loaded_miles=simulation.loaded_miles,
            total_drive_hours=simulation.total_drive_hours,
            is_legal=simulation.is_legal,
            cycle_used_at_end=simulation.cycle_used_at_end,
            not_legal_reason=simulation.not_legal_reason,
            route_geometry=simulation.route_geometry,
        )

        for stop in simulation.stops:
            RouteStop.objects.create(
                trip=trip,
                stop_type=stop.stop_type,
                lat=stop.lat,
                lng=stop.lng,
                location_label=stop.location_label,
                arrival_time=stop.arrival_time,
                departure_time=stop.departure_time,
            )

        for seg in simulation.segments:
            DutyStatusSegment.objects.create(
                trip=trip,
                status=seg.status,
                start_time=seg.start_time,
                end_time=seg.end_time,
                location_lat=seg.location_lat,
                location_lng=seg.location_lng,
                location_label=seg.location_label,
            )

        return trip


def create_and_simulate_trip(
    guest_id: str | None,
    current_location: str,
    pickup_location: str,
    dropoff_location: str,
    current_cycle_used: float,
    ors_client: ORSClient | None = None,
    user: User | None = None,
) -> tuple[Trip, TripSimulationResult]:
    client = ors_client or ORSClient()
    simulation = simulate_trip(
        current_location=current_location,
        pickup_location=pickup_location,
        dropoff_location=dropoff_location,
        current_cycle_used=current_cycle_used,
        ors_client=client,
    )
    trip = persist_trip(
        guest_id=guest_id,
        current_location=current_location,
        pickup_location=pickup_location,
        dropoff_location=dropoff_location,
        current_cycle_used=current_cycle_used,
        simulation=simulation,
        user=user,
    )
    return trip, simulation
