from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import pytest
from rest_framework.test import APIClient

from trips.services.routing import GeoPoint, RouteLeg
from trips.services.trip_simulator import TripSimulationResult, StopRecord
from trips.services.hos_engine import SegmentRecord
from trips.services.log_builder import build_daily_logs


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def mock_simulation():
    tz = timezone.utc
    start = datetime(2026, 7, 6, 6, 0, tzinfo=tz)
    segments = [
        SegmentRecord("on", start, datetime(2026, 7, 6, 6, 15, tzinfo=tz)),
        SegmentRecord("driving", datetime(2026, 7, 6, 6, 15, tzinfo=tz), datetime(2026, 7, 6, 10, 0, tzinfo=tz)),
    ]
    end = datetime(2026, 7, 6, 10, 0, tzinfo=tz)
    return TripSimulationResult(
        segments=segments,
        stops=[
            StopRecord("pickup", 29.76, -95.37, "Houston, TX", start, end),
        ],
        daily_logs=build_daily_logs(segments),
        route_geometry=[[32.77, -96.79], [29.76, -95.37]],
        distance_miles=240.0,
        duration_hours=4.0,
        total_drive_hours=3.75,
        start_at=start,
        end_at=end,
        is_legal=True,
        cycle_used_at_end=24.0,
    )


@pytest.mark.django_db
@patch("trips.services.trip_builder.simulate_trip")
def test_create_trip(mock_simulate, api_client, mock_simulation):
    mock_simulate.return_value = mock_simulation

    response = api_client.post(
        "/api/trips/",
        {
            "current_location": "Dallas, TX",
            "pickup_location": "Houston, TX",
            "dropoff_location": "Chicago, IL",
            "current_cycle_used": 20.0,
            "guest_id": "test-guest-123",
        },
        format="json",
    )

    assert response.status_code == 201
    data = response.json()
    assert data["trip_id"] is not None
    assert data["is_legal"] is True
    assert data["route"]["distance_miles"] == 240.0
    assert len(data["stops"]) >= 1
    assert len(data["daily_logs"]) >= 1


@pytest.mark.django_db
@patch("trips.services.trip_builder.simulate_trip")
def test_get_trip(mock_simulate, api_client, mock_simulation):
    mock_simulate.return_value = mock_simulation
    create_resp = api_client.post(
        "/api/trips/",
        {
            "current_location": "Dallas, TX",
            "pickup_location": "Houston, TX",
            "dropoff_location": "Chicago, IL",
            "current_cycle_used": 20.0,
        },
        format="json",
    )
    trip_id = create_resp.json()["trip_id"]
    response = api_client.get(f"/api/trips/{trip_id}/")
    assert response.status_code == 200
    assert response.json()["trip_id"] == trip_id


@pytest.mark.django_db
@patch("trips.services.trip_builder.simulate_trip")
def test_list_trips_by_guest_id(mock_simulate, api_client, mock_simulation):
    mock_simulate.return_value = mock_simulation
    api_client.post(
        "/api/trips/",
        {
            "current_location": "Dallas, TX",
            "pickup_location": "Houston, TX",
            "dropoff_location": "Chicago, IL",
            "current_cycle_used": 20.0,
            "guest_id": "guest-abc",
        },
        format="json",
    )
    response = api_client.get("/api/trips/?guest_id=guest-abc")
    assert response.status_code == 200
    assert len(response.json()) == 1


@pytest.mark.django_db
def test_create_trip_validation_error(api_client):
    response = api_client.post("/api/trips/", {"current_location": "Dallas, TX"}, format="json")
    assert response.status_code == 400


@pytest.mark.django_db
def test_get_trip_not_found(api_client):
    response = api_client.get("/api/trips/9999/")
    assert response.status_code == 404


@pytest.mark.django_db
@patch("trips.views.ORSClient")
def test_geocode_short_text(mock_client_cls, api_client):
    response = api_client.get("/api/geocode/?text=a")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.django_db
@patch("trips.views.ORSClient")
def test_geocode_suggestions(mock_client_cls, api_client):
    mock_client_cls.return_value.geocode_suggestions.return_value = [
        {"label": "Dallas, TX, USA", "lat": 32.77, "lng": -96.79}
    ]
    response = api_client.get("/api/geocode/?text=Dallas")
    assert response.status_code == 200
    assert len(response.json()) == 1
