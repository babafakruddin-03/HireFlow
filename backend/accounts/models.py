from django.conf import settings
from django.db import models


class UserProfile(models.Model):

    ROLE_CHOICES = [
        ("job_seeker", "Job Seeker"),
        ("recruiter", "Recruiter"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="job_seeker",
    )

    phone = models.CharField(
        max_length=15,
        blank=True,
    )

    resume = models.FileField(
        upload_to="resumes/",
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return f"{self.user.username} - {self.role}"