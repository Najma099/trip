from unittest.mock import MagicMock, patch

import pytest

from trips.services.routing import GeoPoint, ORSClient, RouteLeg, RoutingError, haversine_km


def test_haversine_same_point():
    assert haversine_km(32.7767, -96.7970, 32.7767, -96.7970) == 0.0


def test_haversine_dallas_houston_approx():
    # Dallas to Houston ~362 km
    km = haversine_km(32.7767, -96.7970, 29.7604, -95.3698)
    assert 350 < km < 400


@patch("trips.services.routing.requests.Session")
def test_geocode_returns_point(mock_session_cls):
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "features": [
            {
                "geometry": {"coordinates": [-96.797, 32.7767]},
                "properties": {"label": "Dallas, TX, USA"},
            }
        ]
    }
    mock_session_cls.return_value.get.return_value = mock_resp

    client = ORSClient(api_key="test-key")
    point = client.geocode("Dallas, TX")
    assert point.lat == pytest.approx(32.7767)
    assert point.lng == pytest.approx(-96.797)
    assert "Dallas" in point.label


@patch("trips.services.routing.requests.Session")
def test_route_hgv_returns_leg(mock_session_cls):
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "features": [
            {
                "properties": {"summary": {"distance": 386000, "duration": 14400}},
                "geometry": {
                    "coordinates": [[-96.797, 32.7767], [-95.3698, 29.7604]]
                },
            }
        ]
    }
    mock_session_cls.return_value.post.return_value = mock_resp

    client = ORSClient(api_key="test-key")
    start = GeoPoint(32.7767, -96.797, "Dallas, TX")
    end = GeoPoint(29.7604, -95.3698, "Houston, TX")
    leg = client.route_hgv(start, end)

    assert leg.distance_miles == pytest.approx(239.8, rel=0.01)
    assert leg.duration_hours == pytest.approx(4.0, rel=0.01)
    assert len(leg.geometry) == 2
    assert leg.geometry[0] == [32.7767, -96.797]


def test_geocode_without_api_key_raises():
    client = ORSClient(api_key="")
    with pytest.raises(RoutingError, match="ORS_API_KEY"):
        client.geocode("Dallas, TX")
