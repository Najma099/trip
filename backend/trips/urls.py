from django.urls import path

from trips.views import GeocodeView, TripDetailView, TripListCreateView

urlpatterns = [
    path("trips/", TripListCreateView.as_view(), name="trip-list-create"),
    path("trips/<int:trip_id>/", TripDetailView.as_view(), name="trip-detail"),
    path("geocode/", GeocodeView.as_view(), name="geocode"),
]
