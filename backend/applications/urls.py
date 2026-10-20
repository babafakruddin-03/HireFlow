from django.urls import path
from .views import (
    ApplyForJobAPIView,
    MyApplicationsAPIView,
    RecruiterApplicationsAPIView,
    UpdateApplicationStatusAPIView,
)

urlpatterns = [
    path("apply/", ApplyForJobAPIView.as_view(), name="apply-for-job"),
    path("my-applications/", MyApplicationsAPIView.as_view(), name="my-applications"),
    path("recruiter-applications/", RecruiterApplicationsAPIView.as_view(), name="recruiter-applications"),
    path(
    "<int:pk>/update-status/",
    UpdateApplicationStatusAPIView.as_view(),
    name="update-application-status",
),
]