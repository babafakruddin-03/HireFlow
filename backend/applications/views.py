from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from .models import JobApplication
from .serializers import JobApplicationSerializer


class IsJobSeeker(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and hasattr(request.user, "profile")
            and request.user.profile.role == "job_seeker"
        )


class ApplyForJobAPIView(generics.CreateAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated, IsJobSeeker]

    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user)


class MyApplicationsAPIView(generics.ListAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return JobApplication.objects.filter(
            applicant=self.request.user
        ).select_related("job", "applicant")


class RecruiterApplicationsAPIView(generics.ListAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if not hasattr(user, "profile") or user.profile.role != "recruiter":
            raise PermissionDenied(
                "Only recruiters can view applications."
            )

        return JobApplication.objects.filter(
            job__recruiter=user
        ).select_related("job", "applicant")

class UpdateApplicationStatusAPIView(generics.UpdateAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["patch", "options", "head"]

    def get_queryset(self):
        user = self.request.user

        if (
            not hasattr(user, "profile")
            or user.profile.role != "recruiter"
        ):
            raise PermissionDenied(
                "Only recruiters can update application status."
            )

        return JobApplication.objects.filter(
            job__recruiter=user
        ).select_related("job", "applicant")

    def partial_update(self, request, *args, **kwargs):
        application = self.get_object()
        new_status = request.data.get("status")

        allowed_statuses = [
            "pending",
            "shortlisted",
            "rejected",
            "hired",
        ]

        if new_status not in allowed_statuses:
            return Response(
                {"status": "Choose pending, shortlisted, rejected, or hired."},
                status=400,
            )

        application.status = new_status
        application.save(update_fields=["status", "updated_at"])

        serializer = self.get_serializer(application)

        return Response(serializer.data)