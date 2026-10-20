import getpass
import requests

BASE_URL = "http://127.0.0.1:8000"

# Enter the token privately when prompted.
token = getpass.getpass("Enter your recruiter token: ")

headers = {
    "Authorization": f"Token {token}",
    "Content-Type": "application/json",
}

job_data = {
    "title": "Python Full Stack Developer",
    "company_name": "HireFlow Demo",
    "description": (
        "We are looking for a Python Full Stack Developer "
        "to build and maintain web applications using Django, "
        "React, REST APIs, and SQL."
    ),
    "required_skills": (
        "Python, Django, REST API, React, JavaScript, SQL, Git"
    ),
    "location": "Bengaluru, India",
    "job_type": "full_time",
    "min_salary": "300000",
    "max_salary": "600000",
    "status": "published",
}

response = requests.post(
    f"{BASE_URL}/api/jobs/",
    json=job_data,
    headers=headers,
    timeout=15,
)

print("HTTP Status:", response.status_code)
print("Response:", response.text)