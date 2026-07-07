from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Any

import requests
from django.conf import settings


class RoutingError(Exception):
    def __init__(self, message: str, upstream_status: int | None = None):
        super().__init__(message)
        self.upstream_status = upstream_status


@dataclass
class GeoPoint:
    lat: float
    lng: float
    label: str


@dataclass
class RouteLeg:
    distance_miles: float
    duration_hours: float
    geometry: list[list[float]]  # [[lat, lng], ...]
    start: GeoPoint
    end: GeoPoint


ORS_BASE = "https://api.openrouteservice.org"


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlng / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def _meters_to_miles(meters: float) -> float:
    return meters / 1609.344


def _seconds_to_hours(seconds: float) -> float:
    return seconds / 3600


class ORSClient:
    def __init__(self, api_key: str | None = None, session: requests.Session | None = None):
        self.api_key = api_key or settings.ORS_API_KEY
        self.session = session or requests.Session()

    def _headers(self) -> dict[str, str]:
        return {"Authorization": self.api_key, "Content-Type": "application/json"}

    def geocode(self, text: str) -> GeoPoint:
        if not self.api_key:
            raise RoutingError("ORS_API_KEY is not configured")
        resp = self.session.get(
            f"{ORS_BASE}/geocode/search",
            params={
                "api_key": self.api_key,
                "text": text,
                "size": 1,
                "boundary.country": "USA",
            },
            timeout=30,
        )
        if resp.status_code != 200:
            raise RoutingError(
                f"Geocoding failed for '{text}'",
                upstream_status=resp.status_code,
            )
        data = resp.json()
        features = data.get("features") or []
        if not features:
            raise RoutingError(f"No results found for '{text}'")
        coords = features[0]["geometry"]["coordinates"]
        label = features[0].get("properties", {}).get("label", text)
        return GeoPoint(lat=coords[1], lng=coords[0], label=label)

    def geocode_suggestions(self, text: str, size: int = 5) -> list[dict[str, Any]]:
        if len(text.strip()) < 2:
            return []
        if not self.api_key:
            raise RoutingError("ORS_API_KEY is not configured")
        resp = self.session.get(
            f"{ORS_BASE}/geocode/search",
            params={
                "api_key": self.api_key,
                "text": text,
                "size": size,
                "boundary.country": "USA",
            },
            timeout=30,
        )
        if resp.status_code != 200:
            raise RoutingError("Geocode autocomplete failed", upstream_status=resp.status_code)
        features = resp.json().get("features") or []
        return [
            {
                "label": f.get("properties", {}).get("label", ""),
                "lat": f["geometry"]["coordinates"][1],
                "lng": f["geometry"]["coordinates"][0],
            }
            for f in features
        ]

    def route_hgv(self, start: GeoPoint, end: GeoPoint) -> RouteLeg:
        if not self.api_key:
            raise RoutingError("ORS_API_KEY is not configured")
        body = {
            "coordinates": [[start.lng, start.lat], [end.lng, end.lat]],
            "preference": "recommended",
        }
        resp = self.session.post(
            f"{ORS_BASE}/v2/directions/driving-hgv/geojson",
            json=body,
            headers=self._headers(),
            timeout=60,
        )
        if resp.status_code != 200:
            raise RoutingError(
                f"Routing failed from {start.label} to {end.label}",
                upstream_status=resp.status_code,
            )
        data = resp.json()
        features = data.get("features") or []
        if not features:
            raise RoutingError(f"No route found from {start.label} to {end.label}")
        feature = features[0]
        summary = feature["properties"]["summary"]
        coords = feature["geometry"]["coordinates"]
        geometry = [[c[1], c[0]] for c in coords]
        return RouteLeg(
            distance_miles=round(_meters_to_miles(summary["distance"]), 2),
            duration_hours=round(_seconds_to_hours(summary["duration"]), 2),
            geometry=geometry,
            start=start,
            end=end,
        )


def _geometry_segment_lengths_km(geometry: list[list[float]]) -> list[float]:
    if len(geometry) < 2:
        return []
    return [
        haversine_km(geometry[i][0], geometry[i][1], geometry[i + 1][0], geometry[i + 1][1])
        for i in range(len(geometry) - 1)
    ]


def interpolate_along_geometry(
    geometry: list[list[float]],
    distance_miles: float,
    total_miles: float,
) -> tuple[float, float]:
    """Return lat/lng at distance_miles along a route polyline.

    Uses road-distance scaling: haversine straight-line segments are scaled
    by road_total / haversine_total so the interpolation follows the actual
    road distance rather than the crow-flies distance.
    """
    if not geometry:
        return 0.0, 0.0
    if len(geometry) == 1 or total_miles <= 0:
        return geometry[0][0], geometry[0][1]

    segment_lengths = _geometry_segment_lengths_km(geometry)
    haversine_total = sum(segment_lengths)
    if haversine_total <= 0:
        return geometry[-1][0], geometry[-1][1]

    road_total_km = total_miles * 1.60934
    scale = road_total_km / haversine_total
    target_km = distance_miles * 1.60934

    covered = 0.0
    for index, seg_km in enumerate(segment_lengths):
        road_seg_km = seg_km * scale
        if covered + road_seg_km >= target_km:
            ratio = (target_km - covered) / road_seg_km if road_seg_km > 0 else 0.0
            lat1, lng1 = geometry[index]
            lat2, lng2 = geometry[index + 1]
            return lat1 + (lat2 - lat1) * ratio, lng1 + (lng2 - lng1) * ratio
        covered += road_seg_km

    end = geometry[-1]
    return end[0], end[1]


def en_route_label(distance_miles: float, total_miles: float, destination_label: str) -> str:
    if total_miles <= 0:
        return destination_label
    pct = int(min(100, max(0, (distance_miles / total_miles) * 100)))
    return f"En route ({pct}% toward {destination_label})"


@dataclass
class LegProgress:
    """Tracks miles driven along a route leg for stop-position interpolation."""

    geometry: list[list[float]]
    total_miles: float
    destination_label: str
    miles_completed: float = 0.0

    def current_point(self) -> GeoPoint:
        lat, lng = interpolate_along_geometry(self.geometry, self.miles_completed, self.total_miles)
        return GeoPoint(
            lat=lat,
            lng=lng,
            label=en_route_label(self.miles_completed, self.total_miles, self.destination_label),
        )

    def advance(self, miles: float) -> GeoPoint:
        self.miles_completed = min(self.miles_completed + miles, self.total_miles)
        return self.current_point()
