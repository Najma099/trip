from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, timedelta, time

from trips.services.hos_engine import SegmentRecord


@dataclass
class DailyLogSegment:
    status: str
    start: str  # HH:MM (24:00 allowed for end-of-day)
    end: str
    location: str = ""
    remark: str = ""


@dataclass
class DailyLog:
    date: str  # YYYY-MM-DD
    segments: list[DailyLogSegment]
    total_driving_hours: float
    total_on_duty_hours: float
    total_off_duty_hours: float


def _time_str(dt: datetime, end_of_day: bool = False) -> str:
    if end_of_day and dt.hour == 0 and dt.minute == 0 and dt.second == 0:
        return "24:00"
    return dt.strftime("%H:%M")


def _collect_log_dates(segments: list[SegmentRecord]) -> list[date]:
    dates: set[date] = set()
    for seg in segments:
        dates.add(seg.start_time.date())
        dates.add(seg.end_time.date())
    return sorted(dates)


def _clip_segment_to_day(
    seg: SegmentRecord, log_date: date, tzinfo
) -> tuple[datetime, datetime] | None:
    day_start = datetime.combine(log_date, time.min, tzinfo=tzinfo)
    day_end = day_start + timedelta(days=1)

    clip_start = max(seg.start_time, day_start)
    clip_end = min(seg.end_time, day_end)

    if clip_start >= clip_end:
        return None
    return clip_start, clip_end


def _remark_for_segment(seg: SegmentRecord) -> str:
    label = (seg.location_label or "").strip()
    if not label:
        return ""
    duration_min = (seg.end_time - seg.start_time).total_seconds() / 60
    if seg.status == "off":
        if duration_min >= 34 * 60:
            return f"34-hour restart — {label}"
        if duration_min >= 600:
            return f"10-hour rest — {label}"
        if "split berth completion" in label.lower():
            return f"2-hour off-duty (split berth) — {label}"
        if duration_min >= 30:
            return f"30-minute break — {label}"
    if seg.status == "sleeper":
        if duration_min >= 480:
            return f"8-hour sleeper berth — {label}"
        return label
    if seg.status == "on" and "Fuel" in label:
        return label
    if seg.status == "driving":
        return label
    return label


def build_daily_logs(segments: list[SegmentRecord]) -> list[DailyLog]:
    if not segments:
        return []

    tzinfo = segments[0].start_time.tzinfo
    daily_logs: list[DailyLog] = []

    for log_date in _collect_log_dates(segments):
        log_segments: list[DailyLogSegment] = []
        driving_total = 0.0
        on_total = 0.0
        off_total = 0.0

        for seg in segments:
            clipped = _clip_segment_to_day(seg, log_date, tzinfo)
            if not clipped:
                continue

            clip_start, clip_end = clipped
            duration_hours = (clip_end - clip_start).total_seconds() / 3600

            if seg.status == "driving":
                driving_total += duration_hours
            elif seg.status == "on":
                on_total += duration_hours
            elif seg.status in ("off", "sleeper"):
                off_total += duration_hours

            day_end = datetime.combine(log_date, time.min, tzinfo=tzinfo) + timedelta(days=1)
            end_is_midnight = clip_end == day_end

            log_segments.append(
                DailyLogSegment(
                    status=seg.status,
                    start=_time_str(clip_start),
                    end=_time_str(clip_end, end_of_day=end_is_midnight),
                    location=seg.location_label or "",
                    remark=_remark_for_segment(seg),
                )
            )

        daily_logs.append(
            DailyLog(
                date=log_date.isoformat(),
                segments=log_segments,
                total_driving_hours=round(driving_total, 2),
                total_on_duty_hours=round(on_total, 2),
                total_off_duty_hours=round(off_total, 2),
            )
        )

    return daily_logs
