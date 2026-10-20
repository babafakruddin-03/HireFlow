from rest_framework import serializers
from .models import JobApplication


class JobApplicationSerializer(serializers.ModelSerializer):
    applicant_username = serializers.CharField(
        source="applicant.username",
        read_only=True
    )

    applicant_email = serializers.EmailField(
        source="applicant.email",
        read_only=True
    )

    applicant_phone = serializers.SerializerMethodField()

    applicant_resume = serializers.SerializerMethodField()

    job_title = serializers.CharField(
        source="job.title",
        read_only=True
    )

    company_name = serializers.CharField(
        source="job.company_name",
        read_only=True
    )

    class Meta:
        model = JobApplication

        fields = [
            "id",
            "job",
            "job_title",
            "company_name",
            "applicant",
            "applicant_username",
            "applicant_email",
            "applicant_phone",
            "resume_link",
            "applicant_resume",
            "cover_letter",
            "status",
            "applied_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "applicant",
            "status",
            "applied_at",
            "updated_at",
            "applicant_email",
            "applicant_phone",
            "applicant_resume",
        ]

    def get_applicant_phone(self, obj):
        profile = getattr(obj.applicant, "profile", None)

        if profile:
            return profile.phone or ""

        return ""

    def get_applicant_resume(self, obj):
        profile = getattr(obj.applicant, "profile", None)

        if profile and profile.resume:
            request = self.context.get("request")
            resume_url = profile.resume.url

            if request:
                return request.build_absolute_uri(resume_url)

            return resume_url

        return None

    def validate_job(self, job):
        if job.status != "published":
            raise serializers.ValidationError(
                "You can only apply for published jobs."
            )

        return job

    def validate(self, attrs):
        request = self.context.get("request")

        if request and request.user.is_authenticated:
            job = attrs.get("job")

            if job and JobApplication.objects.filter(
                job=job,
                applicant=request.user
            ).exists():
                raise serializers.ValidationError(
                    "You have already applied for this job."
                )

        return attrs