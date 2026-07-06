from django.contrib import admin

from .models import DutyStatusSegment, RouteStop, Trip


class RouteStopInline(admin.TabularInline):
    model = RouteStop
    extra = 0


class DutyStatusSegmentInline(admin.TabularInline):
    model = DutyStatusSegment
    extra = 0


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ("id", "current_location", "dropoff_location", "guest_id", "is_legal", "created_at")
    list_filter = ("is_legal",)
    search_fields = ("guest_id", "current_location", "pickup_location", "dropoff_location")
    inlines = [RouteStopInline, DutyStatusSegmentInline]
