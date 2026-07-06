from datetime import datetime, timezone

import pytest

from trips.services.log_builder import build_daily_logs
from trips.services.hos_engine import SegmentRecord


def test_cross_midnight_rest_splits_on_correct_days():
    tz = timezone.utc
    segments = [
        SegmentRecord(
            "off",
            datetime(2026, 7, 6, 17, 45, tzinfo=tz),
            datetime(2026, 7, 7, 3, 45, tzinfo=tz),
            location_label="Rest stop",
        ),
    ]
    logs = build_daily_logs(segments)

    assert len(logs) == 2
    day1, day2 = logs[0], logs[1]

    assert day1.date == "2026-07-06"
    assert day1.segments[0].start == "17:45"
    assert day1.segments[0].end == "24:00"
    assert day1.total_off_duty_hours == pytest.approx(6.25, abs=0.02)

    assert day2.date == "2026-07-07"
    assert day2.segments[0].start == "00:00"
    assert day2.segments[0].end == "03:45"
    assert day2.total_off_duty_hours == pytest.approx(3.75, abs=0.02)

    # Must NOT show previous-day times on day 2
    for seg in day2.segments:
        assert seg.start != "17:45"
        assert seg.end != "23:59"


def test_daily_totals_use_clipped_hours_not_full_segment():
    tz = timezone.utc
    segments = [
        SegmentRecord(
            "driving",
            datetime(2026, 7, 6, 20, 0, tzinfo=tz),
            datetime(2026, 7, 7, 4, 0, tzinfo=tz),
        ),
    ]
    logs = build_daily_logs(segments)

    assert logs[0].total_driving_hours == pytest.approx(4.0, abs=0.02)
    assert logs[1].total_driving_hours == pytest.approx(4.0, abs=0.02)


def test_remarks_include_rest_and_fuel_context():
    tz = timezone.utc
    segments = [
        SegmentRecord(
            "off",
            datetime(2026, 7, 6, 18, 0, tzinfo=tz),
            datetime(2026, 7, 7, 4, 0, tzinfo=tz),
            location_label="I-40 rest area",
        ),
        SegmentRecord(
            "on",
            datetime(2026, 7, 7, 10, 0, tzinfo=tz),
            datetime(2026, 7, 7, 10, 30, tzinfo=tz),
            location_label="Fuel stop — Oklahoma City, OK",
        ),
    ]
    logs = build_daily_logs(segments)
    rest_remark = logs[0].segments[0].remark
    assert "10-hour rest" in rest_remark
    assert "I-40" in rest_remark

    fuel_log = next(l for l in logs if l.date == "2026-07-07")
    fuel_seg = next(s for s in fuel_log.segments if s.status == "on")
    assert "Fuel" in fuel_seg.remark
