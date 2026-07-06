from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from trips.serializers import TripCreateSerializer, TripDetailSerializer, TripListSerializer
from trips.services.routing import ORSClient, RoutingError
from trips.services.trip_builder import create_and_simulate_trip
from trips.models import Trip


class TripListCreateView(APIView):
    def get(self, request):
        guest_id = request.query_params.get("guest_id")
        if not guest_id:
            return Response({"detail": "guest_id query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)
        trips = Trip.objects.filter(guest_id=guest_id)
        serializer = TripListSerializer(trips, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TripCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            trip, _ = create_and_simulate_trip(
                guest_id=data.get("guest_id") or None,
                current_location=data["current_location"],
                pickup_location=data["pickup_location"],
                dropoff_location=data["dropoff_location"],
                current_cycle_used=data["current_cycle_used"],
            )
        except RoutingError as exc:
            return Response(
                {
                    "detail": str(exc),
                    "upstream_status": exc.upstream_status,
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(TripDetailSerializer(trip).data, status=status.HTTP_201_CREATED)


class TripDetailView(APIView):
    def get(self, request, trip_id: int):
        try:
            trip = Trip.objects.prefetch_related("stops", "segments").get(pk=trip_id)
        except Trip.DoesNotExist:
            return Response({"detail": "Trip not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(TripDetailSerializer(trip).data)


class GeocodeView(APIView):
    def get(self, request):
        text = request.query_params.get("text", "").strip()
        if len(text) < 2:
            return Response([])
        try:
            client = ORSClient()
            suggestions = client.geocode_suggestions(text)
        except RoutingError as exc:
            return Response(
                {"detail": str(exc), "upstream_status": exc.upstream_status},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        return Response(suggestions)
