from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import UserProfile


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)

    password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
        style={"input_type": "password"},
    )

    password2 = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )

    phone = serializers.CharField(
        max_length=15,
        required=False,
        allow_blank=True,
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "password2",
            "phone",
        ]

    def validate_email(self, value):
        value = value.lower().strip()

        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({
                "password2": "The passwords do not match."
            })

        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        password = validated_data.pop("password")
        phone = validated_data.pop("phone", "")

        user = User.objects.create_user(
            password=password,
            **validated_data,
        )

        UserProfile.objects.create(
            user=user,
            role="job_seeker",
            phone=phone,
        )

        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()

    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

    def validate(self, attrs):
        from django.contrib.auth import authenticate

        username = attrs.get("username")
        password = attrs.get("password")

        user = authenticate(
            request=self.context.get("request"),
            username=username,
            password=password,
        )

        if user is None:
            raise serializers.ValidationError(
                "Invalid username or password."
            )

        if not user.is_active:
            raise serializers.ValidationError(
                "This account is inactive."
            )

        attrs["user"] = user
        return attrs


class ResumeUploadSerializer(serializers.ModelSerializer):
    resume = serializers.FileField(required=True)

    class Meta:
        model = UserProfile
        fields = ["resume"]

    def validate_resume(self, value):
        max_size = 5 * 1024 * 1024

        if value.size > max_size:
            raise serializers.ValidationError(
                "Resume must be 5 MB or smaller."
            )

        if not value.name.lower().endswith(".pdf"):
            raise serializers.ValidationError(
                "Only PDF resumes are allowed."
            )

        return value