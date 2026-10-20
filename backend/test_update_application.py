import getpass
import requests

BASE_URL = "http://127.0.0.1:8000"

token = getpass.getpass("Enter your recruiter token: ").strip()

headers = {
    "Authorization": f"Token {token}",
    "Content-Type": "application/json",
}

application_id = int(input("Enter application ID: "))

update_data = {
    "status": "shortlisted"
}

response = requests.patch(
    f"{BASE_URL}/api/applications/{application_id}/update-status/",
    json=update_data,
    headers=headers,
    timeout=15,
)

print("HTTP Status:", response.status_code)
print("Response:", response.text)