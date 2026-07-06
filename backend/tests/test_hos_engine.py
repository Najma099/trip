from datetime import datetime, timezone

import pytest

from trips.hos_constants import (
    BREAK_DURATION_MINUTES,
    DAILY_RESET_MINUTES,
    MAX_DRIVE_MINUTES,
    MAX_WINDOW_MINUTES,
)
from trips.services.hos_engine import HOSEngine


def _start() -> datetime:
    return datetime(2026, 7, 6, 6, 0, tzinfo=timezone.utc)


def test_daily_reset_restores_drive_and_window():
    engine = HOSEngine(current_cycle_used_hrs=0, start_time=_start())
    engine.drive(200, avg_speed_mph=50)  # ~4 hours
    # Split berth: 8h sleeper then 2h off completes the 10-hour reset
    engine._insert_daily_reset()
    engine._insert_daily_reset()
    assert engine.remaining_drive == MAX_DRIVE_MINUTES
    assert engine.remaining_window == MAX_WINDOW_MINUTES
    assert engine.driving_since_break == 0


def test_break_inserted_after_eight_hours_driving():
    engine = HOSEngine(current_cycle_used_hrs=0, start_time=_start())
    engine.drive(480, avg_speed_mph=60)  # exactly 8 hours at 60 mph
    assert engine.driving_since_break == 480
    engine.drive(10, avg_speed_mph=60)
    break_segments = [s for s in engine.segments if s.status == "off" and (s.end_time - s.start_time).total_seconds() == BREAK_DURATION_MINUTES * 60]
    assert len(break_segments) >= 1


def test_cycle_restart_restores_seventy_hours():
    engine = HOSEngine(current_cycle_used_hrs=65, start_time=_start())
    engine.drive(300, avg_speed_mph=55)
    assert engine.remaining_cycle < 60
    engine._insert_restart()
    assert engine.remaining_cycle == 70 * 60


def test_on_duty_consumes_window_and_cycle():
    engine = HOSEngine(current_cycle_used_hrs=0, start_time=_start())
    engine.on_duty(60)
    assert engine.remaining_window == MAX_WINDOW_MINUTES - 60
    assert engine.remaining_cycle == 70 * 60 - 60


def test_illegal_when_cycle_exhausted_without_restart_option():
    engine = HOSEngine(current_cycle_used_hrs=70, start_time=_start())
    ok = engine.drive(10, avg_speed_mph=55)
    assert ok is True  # should trigger 34hr restart first
    restart_segments = [s for s in engine.segments if (s.end_time - s.start_time).total_seconds() >= 34 * 3600]
    assert len(restart_segments) >= 1


def test_long_haul_multi_day_simulation():
    """Simulate Dallas→Houston→Chicago distances without routing API."""
    engine = HOSEngine(current_cycle_used_hrs=20, start_time=_start())

    # Pre-trip inspection
    engine.on_duty(15, location_label="Dallas, TX")

    # Deadhead Dallas → Houston (~240 mi)
    engine.drive(240, location_label="En route to Houston, TX")

    # Pickup
    engine.on_duty(60, location_label="Houston, TX")

    # Loaded Houston → Chicago (~1080 mi) with fuel stop at 1000 mi
    engine.drive(1000, location_label="En route to Chicago, IL")
    engine.on_duty(30, location_label="Fuel stop")
    engine.drive(80, location_label="En route to Chicago, IL")

    # Dropoff
    engine.on_duty(60, location_label="Chicago, IL")

    result = engine.finish()
    assert result.is_legal is True
    assert result.not_legal_reason == ""
    assert len(result.segments) > 5

    driving_hours = sum(
        (s.end_time - s.start_time).total_seconds() / 3600
        for s in result.segments
        if s.status == "driving"
    )
    assert driving_hours > 20  # ~1320 miles at 55 mph ≈ 24 drive hours

    rest_segments = [
        s for s in result.segments
        if s.status == "sleeper"
        and (s.end_time - s.start_time).total_seconds() >= 8 * 3600
    ]
    assert len(rest_segments) >= 1  # multi-day trip requires sleeper-berth resets

    assert result.cycle_used_at_end <= 70
