import requests

BASE_URL = "http://127.0.0.1:8000"

# Get a recruiter token
token = input("Enter your recruiter token: ").strip()

headers = {
    "Authorization": f"Token {token}",
    "Content-Type": "application/json",
}

# Update job ID 1
job_id = 1

updated_data = {
    "title": "Python Full Stack Developer - Updated",
    "description": (
        "We are looking for a Python Full Stack Developer "
        "with Django, React, REST API, and SQL skills."
    ),
}

response = requests.patch(
    f"{BASE_URL}/api/jobs/{job_id}/",
    json=updated_data,
    headers=headers,
    timeout=15,
)

print("HTTP Status:", response.status_code)
print("Response:", response.text)