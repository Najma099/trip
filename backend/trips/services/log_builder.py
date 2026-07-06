from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime, time

from trips.services.hos_engine import SegmentRecord


@dataclass
class DailyLogSegment:
    status: str
    start: str  # HH:MM
    end: str


@dataclass
class DailyLog:
    date: str  # YYYY-MM-DD
    segments: list[DailyLogSegment]
    total_driving_hours: float
    total_on_duty_hours: float


def _time_str(dt: datetime) -> str:
    return dt.strftime("%H:%M")


def _status_totals(segments: list[SegmentRecord], status: str) -> float:
    total = 0.0
    for seg in segments:
        if seg.status == status:
            total += (seg.end_time - seg.start_time).total_seconds() / 3600
    return round(total, 2)


def build_daily_logs(segments: list[SegmentRecord]) -> list[DailyLog]:
    if not segments:
        return []

    by_date: dict[str, list[SegmentRecord]] = defaultdict(list)
    for seg in segments:
        day = seg.start_time.date().isoformat()
        by_date[day].append(seg)

    # Include segments that span midnight on both days
    for seg in segments:
        if seg.start_time.date() != seg.end_time.date():
            end_day = seg.end_time.date().isoformat()
            if seg not in by_date[end_day]:
                by_date[end_day].append(seg)

    daily_logs: list[DailyLog] = []
    for date in sorted(by_date.keys()):
        day_segments = sorted(by_date[date], key=lambda s: s.start_time)
        log_segments: list[DailyLogSegment] = []

        for seg in day_segments:
            seg_start = seg.start_time
            seg_end = seg.end_time
            day_start = datetime.combine(seg_start.date(), time.min, tzinfo=seg_start.tzinfo)
            day_end = datetime.combine(seg_start.date(), time.max.replace(microsecond=0), tzinfo=seg_start.tzinfo)

            clip_start = max(seg_start, day_start)
            clip_end = min(seg_end, day_end.replace(hour=23, minute=59, second=59))

            if clip_start < clip_end:
                log_segments.append(
                    DailyLogSegment(
                        status=seg.status,
                        start=_time_str(clip_start),
                        end=_time_str(clip_end),
                    )
                )

        daily_logs.append(
            DailyLog(
                date=date,
                segments=log_segments,
                total_driving_hours=_status_totals(day_segments, "driving"),
                total_on_duty_hours=_status_totals(day_segments, "on"),
            )
        )

    return daily_logs
