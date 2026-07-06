"""Validate FMCSA HOS rules against generated segment timelines."""

from datetime import datetime, timedelta

from trips.hos_constants import (
    BREAK_AFTER_DRIVE_MINUTES,
    BREAK_DURATION_MINUTES,
    DAILY_RESET_MINUTES,
    MAX_DRIVE_MINUTES,
    MAX_WINDOW_MINUTES,
)
from trips.services.hos_engine import SegmentRecord


def validate_hos_segments(segments: list[SegmentRecord]) -> list[str]:
    violations: list[str] = []

    if not segments:
        return violations

    # Check no single driving stretch exceeds 11 hours without reset
    driving_since_reset = 0.0
    window_used = 0.0
    driving_since_break = 0.0
    on_duty_in_window = False

    for seg in segments:
        duration_min = (seg.end_time - seg.start_time).total_seconds() / 60

        if seg.status in ("off", "sleeper"):
            if duration_min >= DAILY_RESET_MINUTES:
                driving_since_reset = 0.0
                window_used = 0.0
                driving_since_break = 0.0
                on_duty_in_window = False
            elif duration_min >= BREAK_DURATION_MINUTES:
                driving_since_break = 0.0
        elif seg.status == "on":
            if not on_duty_in_window:
                on_duty_in_window = True
                window_used = 0.0
            window_used += duration_min
            if window_used > MAX_WINDOW_MINUTES + 0.01:
                violations.append(
                    f"14-hour window exceeded: {window_used:.0f} min on-duty at {seg.start_time}"
                )
        elif seg.status == "driving":
            if not on_duty_in_window:
                on_duty_in_window = True
                window_used = 0.0
            driving_since_reset += duration_min
            window_used += duration_min
            driving_since_break += duration_min

            if driving_since_reset > MAX_DRIVE_MINUTES + 0.01:
                violations.append(
                    f"11-hour drive limit exceeded: {driving_since_reset:.0f} min at {seg.start_time}"
                )
            if window_used > MAX_WINDOW_MINUTES + 0.01:
                violations.append(
                    f"14-hour window exceeded during driving at {seg.start_time}"
                )
            if driving_since_break > BREAK_AFTER_DRIVE_MINUTES + 0.01:
                violations.append(
                    f"8-hour drive without break: {driving_since_break:.0f} min at {seg.start_time}"
                )

    return violations


def max_continuous_driving_minutes(segments: list[SegmentRecord]) -> float:
    """Max driving minutes between 10+ hour off-duty resets."""
    max_drive = 0.0
    current_drive = 0.0

    for seg in segments:
        duration_min = (seg.end_time - seg.start_time).total_seconds() / 60
        if seg.status == "driving":
            current_drive += duration_min
            max_drive = max(max_drive, current_drive)
        elif seg.status in ("off", "sleeper") and duration_min >= DAILY_RESET_MINUTES:
            current_drive = 0.0

    return max_drive
