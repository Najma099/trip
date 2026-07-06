from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Literal

from trips.hos_constants import (
    BREAK_AFTER_DRIVE_MINUTES,
    BREAK_DURATION_MINUTES,
    CYCLE_RESTART_MINUTES,
    DAILY_RESET_MINUTES,
    MAX_CYCLE_HOURS,
    MAX_DRIVE_MINUTES,
    MAX_WINDOW_MINUTES,
)

DutyStatus = Literal["off", "sleeper", "driving", "on"]


@dataclass
class SegmentRecord:
    status: DutyStatus
    start_time: datetime
    end_time: datetime
    location_lat: float | None = None
    location_lng: float | None = None
    location_label: str = ""


@dataclass
class HOSEngineResult:
    segments: list[SegmentRecord] = field(default_factory=list)
    is_legal: bool = True
    not_legal_reason: str = ""
    cycle_used_at_end: float = 0.0


class HOSEngine:
    """Greedy HOS scheduler enforcing FMCSA property-carrying rules."""

    def __init__(self, current_cycle_used_hrs: float, start_time: datetime):
        self.remaining_drive = MAX_DRIVE_MINUTES
        self.remaining_window = MAX_WINDOW_MINUTES
        self.remaining_cycle = max(0.0, (MAX_CYCLE_HOURS - current_cycle_used_hrs) * 60)
        self.initial_cycle_used = current_cycle_used_hrs
        self.driving_since_break = 0
        self.clock = start_time
        self.segments: list[SegmentRecord] = []
        self.is_legal = True
        self.not_legal_reason = ""
        self._on_duty_since_window_start = False

    @property
    def cycle_used_at_end(self) -> float:
        cycle_minutes_used = (MAX_CYCLE_HOURS * 60) - self.remaining_cycle
        return round(cycle_minutes_used / 60, 2)

    def add_segment(
        self,
        status: DutyStatus,
        duration_minutes: float,
        lat: float | None = None,
        lng: float | None = None,
        location_label: str = "",
    ) -> bool:
        if duration_minutes <= 0:
            return True
        if not self.is_legal:
            return False

        end = self.clock + timedelta(minutes=duration_minutes)
        self.segments.append(
            SegmentRecord(
                status=status,
                start_time=self.clock,
                end_time=end,
                location_lat=lat,
                location_lng=lng,
                location_label=location_label,
            )
        )
        self.clock = end

        if status == "driving":
            self.remaining_drive -= duration_minutes
            self.remaining_window -= duration_minutes
            self.remaining_cycle -= duration_minutes
            self.driving_since_break += duration_minutes
        elif status == "on":
            self.remaining_window -= duration_minutes
            self.remaining_cycle -= duration_minutes
            if not self._on_duty_since_window_start:
                self._on_duty_since_window_start = True
        elif status in ("off", "sleeper"):
            if duration_minutes >= CYCLE_RESTART_MINUTES:
                self._apply_cycle_restart()
            elif duration_minutes >= DAILY_RESET_MINUTES:
                self._apply_daily_reset()

        return True

    def _apply_daily_reset(self) -> None:
        self.remaining_drive = MAX_DRIVE_MINUTES
        self.remaining_window = MAX_WINDOW_MINUTES
        self.driving_since_break = 0
        self._on_duty_since_window_start = False

    def _apply_cycle_restart(self) -> None:
        self._apply_daily_reset()
        self.remaining_cycle = MAX_CYCLE_HOURS * 60

    def _fail(self, reason: str) -> None:
        self.is_legal = False
        self.not_legal_reason = reason

    def _insert_daily_reset(
        self,
        lat: float | None = None,
        lng: float | None = None,
        location_label: str = "",
    ) -> bool:
        return self.add_segment("off", DAILY_RESET_MINUTES, lat, lng, location_label or "Rest stop")

    def _insert_break(
        self,
        lat: float | None = None,
        lng: float | None = None,
        location_label: str = "",
    ) -> bool:
        self.driving_since_break = 0
        return self.add_segment("off", BREAK_DURATION_MINUTES, lat, lng, location_label or "Break")

    def _insert_restart(
        self,
        lat: float | None = None,
        lng: float | None = None,
        location_label: str = "",
    ) -> bool:
        return self.add_segment("off", CYCLE_RESTART_MINUTES, lat, lng, location_label or "34-hour restart")

    def on_duty(
        self,
        duration_minutes: float,
        lat: float | None = None,
        lng: float | None = None,
        location_label: str = "",
    ) -> bool:
        if not self.is_legal:
            return False
        if self.remaining_cycle <= 0:
            if not self._insert_restart(lat, lng, location_label):
                return False
        return self.add_segment("on", duration_minutes, lat, lng, location_label)

    def drive(
        self,
        distance_miles: float,
        avg_speed_mph: float = 55,
        lat: float | None = None,
        lng: float | None = None,
        location_label: str = "",
    ) -> bool:
        if not self.is_legal:
            return False

        total_minutes = (distance_miles / avg_speed_mph) * 60

        while total_minutes > 0.01:
            if self.remaining_cycle <= 0:
                if not self._insert_restart(lat, lng, location_label):
                    return False

            if self.remaining_window <= 0 or self.remaining_drive <= 0:
                if not self._insert_daily_reset(lat, lng, location_label):
                    return False

            if self.driving_since_break >= BREAK_AFTER_DRIVE_MINUTES:
                if not self._insert_break(lat, lng, location_label):
                    return False

            chunk = min(
                total_minutes,
                self.remaining_drive,
                self.remaining_window,
                BREAK_AFTER_DRIVE_MINUTES - self.driving_since_break,
            )

            if chunk <= 0:
                self._fail(
                    "Trip cannot be completed within FMCSA hours-of-service limits "
                    f"(cycle remaining: {self.remaining_cycle / 60:.1f}h)."
                )
                return False

            if not self.add_segment("driving", chunk, lat, lng, location_label):
                return False
            total_minutes -= chunk

        return True

    def finish(self) -> HOSEngineResult:
        return HOSEngineResult(
            segments=self.segments,
            is_legal=self.is_legal,
            not_legal_reason=self.not_legal_reason,
            cycle_used_at_end=self.cycle_used_at_end,
        )
