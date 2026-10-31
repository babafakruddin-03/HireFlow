
from django.contrib import admin
from .models import Job


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "company_name",
        "location",
        "job_type",
        "status",
        "recruiter",
        "created_at",
    )

    list_filter = ("status", "job_type", "created_at")
    search_fields = ("title", "company_name", "location")
    ordering = ("-created_at",)
