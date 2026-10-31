
from django.conf import settings
from django.db import models


class Job(models.Model):
    JOB_TYPE_CHOICES = [
        ("full_time", "Full Time"),
        ("part_time", "Part Time"),
        ("internship", "Internship"),
        ("contract", "Contract"),
    ]

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("published", "Published"),
        ("closed", "Closed"),
    ]

    recruiter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="posted_jobs",
    )
    title = models.CharField(max_length=150)
    company_name = models.CharField(max_length=150)
    description = models.TextField()
    required_skills = models.TextField()
    location = models.CharField(max_length=150)
    job_type = models.CharField(
        max_length=20,
        choices=JOB_TYPE_CHOICES,
        default="full_time",
    )
    min_salary = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    max_salary = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="draft",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.company_name}"