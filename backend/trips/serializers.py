from rest_framework import serializers

from trips.models import DutyStatusSegment, RouteStop, Trip


class TripCreateSerializer(serializers.Serializer):
    current_location = serializers.CharField(max_length=255)
    pickup_location = serializers.CharField(max_length=255)
    dropoff_location = serializers.CharField(max_length=255)
    current_cycle_used = serializers.FloatField(min_value=0, max_value=70)
    guest_id = serializers.CharField(max_length=64, required=False, allow_blank=True)


class RouteStopSerializer(serializers.ModelSerializer):
    type = serializers.CharField(source="stop_type")
    arrival = serializers.DateTimeField(source="arrival_time")
    departure = serializers.DateTimeField(source="departure_time")

    class Meta:
        model = RouteStop
        fields = ["type", "lat", "lng", "location_label", "arrival", "departure"]


class DailyLogSegmentSerializer(serializers.Serializer):
    status = serializers.CharField()
    start = serializers.CharField()
    end = serializers.CharField()


class DailyLogSerializer(serializers.Serializer):
    date = serializers.CharField()
    segments = DailyLogSegmentSerializer(many=True)
    total_driving_hours = serializers.FloatField()
    total_on_duty_hours = serializers.FloatField()


class DutySegmentSerializer(serializers.ModelSerializer):
    start = serializers.DateTimeField(source="start_time")
    end = serializers.DateTimeField(source="end_time")

    class Meta:
        model = DutyStatusSegment
        fields = ["status", "start", "end", "location_lat", "location_lng", "location_label"]


class TripListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = [
            "id",
            "current_location",
            "pickup_location",
            "dropoff_location",
            "current_cycle_used",
            "total_miles",
            "is_legal",
            "created_at",
        ]


class TripDetailSerializer(serializers.ModelSerializer):
    trip_id = serializers.IntegerField(source="id")
    route = serializers.SerializerMethodField()
    stops = RouteStopSerializer(many=True, read_only=True)
    daily_logs = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = [
            "trip_id",
            "current_location",
            "pickup_location",
            "dropoff_location",
            "current_cycle_used",
            "start_at",
            "end_at",
            "total_miles",
            "total_drive_hours",
            "is_legal",
            "cycle_used_at_end",
            "not_legal_reason",
            "route",
            "stops",
            "daily_logs",
            "created_at",
        ]

    def get_route(self, obj: Trip) -> dict:
        duration_hours = 0.0
        if obj.start_at and obj.end_at:
            duration_hours = round((obj.end_at - obj.start_at).total_seconds() / 3600, 2)
        return {
            "geometry": obj.route_geometry,
            "distance_miles": obj.total_miles,
            "duration_hours": duration_hours,
        }

    def get_daily_logs(self, obj: Trip) -> list[dict]:
        from trips.services.log_builder import build_daily_logs
        from trips.services.hos_engine import SegmentRecord

        if not obj.is_legal:
            return []

        segments = [
            SegmentRecord(
                status=seg.status,
                start_time=seg.start_time,
                end_time=seg.end_time,
                location_lat=seg.location_lat,
                location_lng=seg.location_lng,
                location_label=seg.location_label,
            )
            for seg in obj.segments.all()
        ]
        logs = build_daily_logs(segments)
        return [
            {
                "date": log.date,
                "segments": [
                    {
                        "status": s.status,
                        "start": s.start,
                        "end": s.end,
                        "location": s.location,
                        "remark": s.remark,
                    }
                    for s in log.segments
                ],
                "total_driving_hours": log.total_driving_hours,
                "total_on_duty_hours": log.total_on_duty_hours,
                "total_off_duty_hours": log.total_off_duty_hours,
            }
            for log in logs
        ]
