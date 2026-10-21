import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

print("1. Checking Health...")
h = requests.get("http://localhost:8000/health").json()
print("   Status:", h["status"], "| DB Mode:", h["database"]["mode"])

print("\n2. Seeding GxP Pilot Project...")
p = requests.post(f"{BASE_URL}/projects/seed-demo").json()
proj_id = p["id"]
print("   Project:", p["name"])
print("   Project ID:", proj_id)

print("\n3. Invoking Specialist Agent 1 (Intake & Requirements Agent)...")
extract_res = requests.post(f"{BASE_URL}/projects/{proj_id}/requirements/extract", json={}).json()
print("   Extraction Run ID:", extract_res["run_id"])
print("   Model:", extract_res["model_metadata"]["model"], "| Is Mock:", extract_res["model_metadata"]["is_mock"])
print("   Requirements Extracted:", extract_res["requirements_extracted"])

for req in extract_res.get("requirements", []):
    print(f"   * [{req['id']}] {req['title']} ({req['priority'].upper()})")
    print(f"     Source: {req['source_reference']}")

if extract_res.get("requirements"):
    first_id = extract_res["requirements"][0]["id"]
    print(f"\n4. Performing Human Review Gate on {first_id}...")
    rev_res = requests.post(
        f"{BASE_URL}/requirements/{first_id}/review",
        json={"decision": "approved", "reviewer_comments": "Verified against 21 CFR Part 11 requirements."}
    ).json()
    print("   Review Status:", rev_res["review_status"], "| Reviewer:", rev_res["reviewer"])

print("\nSUCCESS: Milestone 1 & 2 Workflow Verified!")
