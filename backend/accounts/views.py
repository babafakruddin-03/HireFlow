from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .models import UserProfile
from .serializers import (
    LoginSerializer,
    RegisterSerializer,
    ResumeUploadSerializer,
)


class RegisterAPIView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response(
            {
                "message": "Account created successfully.",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.profile.role,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class LoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        token, created = Token.objects.get_or_create(user=user)

        return Response(
            {
                "message": "Login successful.",
                "token": token.key,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.profile.role,
                },
            },
            status=status.HTTP_200_OK,
        )


class CurrentUserAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.profile.role,
                "phone": user.profile.phone,
                "resume": (
                    request.build_absolute_uri(user.profile.resume.url)
                    if user.profile.resume
                    else None
                ),
            },
            status=status.HTTP_200_OK,
        )


class ResumeUploadAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        profile = request.user.profile

        if profile.role != "job_seeker":
            return Response(
                {"error": "Only job seekers can upload resumes."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ResumeUploadSerializer(
            profile,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {
                "message": "Resume uploaded successfully.",
                "resume": request.build_absolute_uri(
                    profile.resume.url
                ),
            },
            status=status.HTTP_200_OK,
        )