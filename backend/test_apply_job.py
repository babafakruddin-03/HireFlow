import getpass
import requests

BASE_URL = "http://127.0.0.1:8000"

token = getpass.getpass("Enter your job seeker token: ").strip()

headers = {
    "Authorization": f"Token {token}",
    "Content-Type": "application/json",
}

application_data = {
    "job": 1,
    "resume_link": "https://example.com/my-resume",
    "cover_letter": (
        "I am interested in this Python Full Stack Developer role. "
        "I have knowledge of Python, Django, REST APIs, React, and SQL."
    ),
}

try:
    response = requests.post(
        f"{BASE_URL}/api/applications/apply/",
        json=application_data,
        headers=headers,
        timeout=15,
    )

    print("HTTP Status:", response.status_code)
    print("Response:", response.text)

except requests.RequestException as error:
    print("Request failed:", error)