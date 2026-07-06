from django.db import models


class Trip(models.Model):
    guest_id = models.CharField(max_length=64, null=True, blank=True, db_index=True)
    current_location = models.CharField(max_length=255)
    pickup_location = models.CharField(max_length=255)
    dropoff_location = models.CharField(max_length=255)
    current_cycle_used = models.FloatField()
    start_at = models.DateTimeField(null=True, blank=True)
    end_at = models.DateTimeField(null=True, blank=True)
    total_miles = models.FloatField(null=True, blank=True)
    total_drive_hours = models.FloatField(null=True, blank=True)
    is_legal = models.BooleanField(default=True)
    cycle_used_at_end = models.FloatField(null=True, blank=True)
    not_legal_reason = models.TextField(blank=True, default="")
    route_geometry = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Trip {self.id}: {self.current_location} → {self.dropoff_location}"


class RouteStop(models.Model):
    STOP_TYPES = [
        ("fuel", "Fuel"),
        ("rest", "Rest"),
        ("pickup", "Pickup"),
        ("dropoff", "Dropoff"),
        ("break", "Break"),
        ("deadhead", "Deadhead"),
    ]

    trip = models.ForeignKey(Trip, related_name="stops", on_delete=models.CASCADE)
    stop_type = models.CharField(max_length=20, choices=STOP_TYPES)
    lat = models.FloatField()
    lng = models.FloatField()
    location_label = models.CharField(max_length=255, blank=True, default="")
    arrival_time = models.DateTimeField()
    departure_time = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["arrival_time"]

    def __str__(self):
        return f"{self.stop_type} @ {self.arrival_time}"


class DutyStatusSegment(models.Model):
    STATUS_CHOICES = [
        ("off", "Off Duty"),
        ("sleeper", "Sleeper Berth"),
        ("driving", "Driving"),
        ("on", "On Duty Not Driving"),
    ]

    trip = models.ForeignKey(Trip, related_name="segments", on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    location_lat = models.FloatField(null=True, blank=True)
    location_lng = models.FloatField(null=True, blank=True)
    location_label = models.CharField(max_length=255, blank=True, default="")

    class Meta:
        ordering = ["start_time"]

    def __str__(self):
        return f"{self.status} {self.start_time}–{self.end_time}"
