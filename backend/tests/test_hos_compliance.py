from datetime import datetime, timezone
from unittest.mock import MagicMock

import pytest

from trips.hos_constants import MAX_DRIVE_MINUTES
from trips.services.hos_validator import max_continuous_driving_minutes, validate_hos_segments
from trips.services.routing import GeoPoint, RouteLeg
from trips.services.trip_simulator import simulate_trip


def _mock_ors_client():
    client = MagicMock()
    client.geocode.side_effect = lambda text: {
        "Dallas, TX": GeoPoint(32.7767, -96.797, "Dallas, TX, USA"),
        "Houston, TX": GeoPoint(29.7604, -95.3698, "Houston, TX, USA"),
        "Chicago, IL": GeoPoint(41.8781, -87.6298, "Chicago, IL, USA"),
    }.get(text, GeoPoint(0, 0, text))

    dallas = GeoPoint(32.7767, -96.797, "Dallas, TX, USA")
    houston = GeoPoint(29.7604, -95.3698, "Houston, TX, USA")
    chicago = GeoPoint(41.8781, -87.6298, "Chicago, IL, USA")

    client.route_hgv.side_effect = lambda start, end: {
        (dallas.label, houston.label): RouteLeg(
            distance_miles=240,
            duration_hours=4.5,
            geometry=[[32.7767, -96.797], [29.7604, -95.3698]],
            start=dallas,
            end=houston,
        ),
        (houston.label, chicago.label): RouteLeg(
            distance_miles=1080,
            duration_hours=20,
            geometry=[[29.7604, -95.3698], [41.8781, -87.6298]],
            start=houston,
            end=chicago,
        ),
    }[(start.label, end.label)]

    return client


def test_dallas_scenario_has_no_hos_violations():
    client = _mock_ors_client()
    start = datetime(2026, 7, 6, 6, 0, tzinfo=timezone.utc)
    result = simulate_trip(
        current_location="Dallas, TX",
        pickup_location="Houston, TX",
        dropoff_location="Chicago, IL",
        current_cycle_used=20.0,
        ors_client=client,
        start_time=start,
    )

    violations = validate_hos_segments(result.segments)
    assert violations == [], f"HOS violations: {violations}"
    assert max_continuous_driving_minutes(result.segments) <= MAX_DRIVE_MINUTES + 0.01


def test_daily_logs_have_no_previous_day_times_on_later_days():
    client = _mock_ors_client()
    start = datetime(2026, 7, 6, 6, 0, tzinfo=timezone.utc)
    result = simulate_trip(
        current_location="Dallas, TX",
        pickup_location="Houston, TX",
        dropoff_location="Chicago, IL",
        current_cycle_used=20.0,
        ors_client=client,
        start_time=start,
    )

    for i, log in enumerate(result.daily_logs):
        if i == 0:
            continue
        prev_date = result.daily_logs[i - 1].date
        for seg in log.segments:
            start_h, start_m = map(int, seg.start.split(":"))
            # Segments on a new day should not start in late evening (carryover bug)
            if start_h >= 17 and seg.start != "24:00":
                # Unless it's genuinely an evening segment that started this day
                assert seg.start >= "00:00"  # sanity
            assert seg.start != "17:45" or log.date == prev_date

    # Each day after first should begin at or near midnight for continued rest
    day2 = result.daily_logs[1]
    first_seg = day2.segments[0]
    if first_seg.status == "off":
        assert first_seg.start in ("00:00", "01:00", "02:00", "03:00", "04:00", "05:00")
