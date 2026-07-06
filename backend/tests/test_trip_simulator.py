from datetime import datetime, timezone
from unittest.mock import MagicMock

import pytest

from trips.services.log_builder import build_daily_logs
from trips.services.hos_engine import SegmentRecord
from trips.services.routing import GeoPoint, RouteLeg
from trips.services.trip_simulator import simulate_trip


def test_build_daily_logs_groups_by_date():
    tz = timezone.utc
    segments = [
        SegmentRecord("on", datetime(2026, 7, 6, 6, 0, tzinfo=tz), datetime(2026, 7, 6, 7, 0, tzinfo=tz)),
        SegmentRecord("driving", datetime(2026, 7, 6, 7, 0, tzinfo=tz), datetime(2026, 7, 6, 18, 0, tzinfo=tz)),
        SegmentRecord("off", datetime(2026, 7, 6, 18, 0, tzinfo=tz), datetime(2026, 7, 7, 4, 0, tzinfo=tz)),
    ]
    logs = build_daily_logs(segments)
    assert len(logs) >= 2
    assert logs[0].date == "2026-07-06"
    assert any(s.status == "driving" for s in logs[0].segments)


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


def test_simulate_trip_dallas_scenario():
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

    assert result.is_legal is True
    assert result.distance_miles == pytest.approx(1320, rel=0.01)
    assert result.total_drive_hours > 20
    assert len(result.daily_logs) >= 2
    assert len(result.stops) >= 2

    stop_types = {s.stop_type for s in result.stops}
    assert "pickup" in stop_types
    assert "dropoff" in stop_types
