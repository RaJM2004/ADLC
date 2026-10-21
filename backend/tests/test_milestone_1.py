import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path

# Add backend to sys.path
backend_path = Path(__file__).resolve().parent.parent
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from app.main import app

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_root_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["app_name"] == "GENQUANTAA_ADLC"
    assert "database" in data
    assert "storage" in data

def test_system_status_and_capabilities(client):
    res_status = client.get("/api/v1/system/status")
    assert res_status.status_code == 200
    status_data = res_status.json()
    assert status_data["status"] == "operational"

    res_caps = client.get("/api/v1/system/capabilities")
    assert res_caps.status_code == 200
    caps_data = res_caps.json()
    assert caps_data["stages_count"] == 8
    assert caps_data["agents_registered"] == 11
    assert caps_data["active_mvp_agents"] == 4

def test_project_crud_and_demo_seed(client):
    # 1. Seed demo project
    res_seed = client.post("/api/v1/projects/seed-demo")
    assert res_seed.status_code == 200
    demo_prj = res_seed.json()
    assert "End-to-End CSV Copilot for GxP ADLC" in demo_prj["name"]
    assert demo_prj["is_demo"] is True
    assert demo_prj["current_stage"] == "discovery_intake"
    assert len(demo_prj["stages"]) == 8

    project_id = demo_prj["id"]

    # 2. Get by ID
    res_get = client.get(f"/api/v1/projects/{project_id}")
    assert res_get.status_code == 200
    assert res_get.json()["id"] == project_id

    # 3. List projects
    res_list = client.get("/api/v1/projects")
    assert res_list.status_code == 200
    assert res_list.json()["total"] >= 1

    # 4. Create a custom project
    new_payload = {
        "name": "Custom Toxicity Classifier ADLC",
        "description": "Small molecule toxicity evaluation model",
        "intended_use": "Preliminary drug candidate filtering",
        "domain": "Cheminformatics",
        "risk_tier": "Medium",
        "owner": "Discovery Chemistry"
    }
    res_create = client.post("/api/v1/projects", json=new_payload)
    assert res_create.status_code == 201
    created = res_create.json()
    assert created["name"] == new_payload["name"]
    assert created["current_stage"] == "discovery_intake"

    # 5. Transition stage
    trans_payload = {
        "target_stage": "requirements_planning",
        "reviewer_name": "Lead System Architect",
        "comments": "Intake completed with pilot requirements"
    }
    res_trans = client.post(f"/api/v1/projects/{created['id']}/lifecycle/transition", json=trans_payload)
    assert res_trans.status_code == 200
    transferred = res_trans.json()
    assert transferred["current_stage"] == "requirements_planning"
    assert transferred["stages"]["discovery_intake"]["status"] == "completed"
    assert transferred["stages"]["requirements_planning"]["status"] == "running"
