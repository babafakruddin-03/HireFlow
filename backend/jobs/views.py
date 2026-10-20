from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import BasePermission

from .models import Job
from .serializers import JobSerializer


class IsRecruiter(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and hasattr(request.user, "profile")
            and request.user.profile.role == "recruiter"
        )


class JobListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = JobSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), IsRecruiter()]

        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = Job.objects.select_related("recruiter")

        if self.request.user.is_authenticated:
            if (
                hasattr(self.request.user, "profile")
                and self.request.user.profile.role == "recruiter"
            ):
                return queryset.filter(status="published") | queryset.filter(
                    recruiter=self.request.user
                )

        return queryset.filter(status="published")

    def perform_create(self, serializer):
        serializer.save(recruiter=self.request.user)


class JobDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = JobSerializer
    queryset = Job.objects.select_related("recruiter")

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [permissions.IsAuthenticated(), IsRecruiter()]

        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = Job.objects.select_related("recruiter")

        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return queryset.filter(recruiter=self.request.user)

        if self.request.user.is_authenticated:
            if (
                hasattr(self.request.user, "profile")
                and self.request.user.profile.role == "recruiter"
            ):
                return queryset.filter(status="published") | queryset.filter(
                    recruiter=self.request.user
                )

        return queryset.filter(status="published")