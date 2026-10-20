import getpass
import requests

BASE_URL = "http://127.0.0.1:8000"

token = getpass.getpass("Enter your job seeker token: ").strip()

headers = {
    "Authorization": f"Token {token}"
}

response = requests.get(
    f"{BASE_URL}/api/applications/my-applications/",
    headers=headers,
    timeout=15
)

print("HTTP Status:", response.status_code)
print("Response:", response.text)