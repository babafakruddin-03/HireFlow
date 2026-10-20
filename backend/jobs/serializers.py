from rest_framework import serializers

from .models import Job


class JobSerializer(serializers.ModelSerializer):
    recruiter_username = serializers.CharField(
        source="recruiter.username",
        read_only=True,
    )

    class Meta:
        model = Job
        fields = [
            "id",
            "recruiter",
            "recruiter_username",
            "title",
            "company_name",
            "description",
            "required_skills",
            "location",
            "job_type",
            "min_salary",
            "max_salary",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "recruiter",
            "recruiter_username",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        min_salary = attrs.get("min_salary")
        max_salary = attrs.get("max_salary")

        if (
            min_salary is not None
            and max_salary is not None
            and min_salary > max_salary
        ):
            raise serializers.ValidationError(
                "Minimum salary cannot exceed maximum salary."
            )

        return attrs