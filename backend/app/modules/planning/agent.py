from datetime import datetime
from typing import Any, Dict, List, Optional
import uuid
from pydantic import BaseModel, Field
from app.core.logging import logger
from app.database.client import db_manager
from app.modules.llm.gateway import llm_gateway

class GeneratedTask(BaseModel):
    id: str = Field(default_factory=lambda: f"tsk_{uuid.uuid4().hex[:8]}")
    requirement_id: str
    title: str
    description: str
    role: str  # "Backend Engineer" | "Clinical Data Manager" | "QA Validator" | "DevOps"
    estimated_hours: int = 8
    priority: str = "High"  # "Critical" | "High" | "Medium" | "Low"
    status: str = "todo"  # "todo" | "in_progress" | "review" | "done"
    definition_of_done: List[str] = Field(default_factory=list)
    dependencies: List[str] = Field(default_factory=list)

class GeneratedTestCase(BaseModel):
    id: str = Field(default_factory=lambda: f"tc_{uuid.uuid4().hex[:8]}")
    requirement_id: str
    title: str
    category: str = "Functional"  # "Functional" | "Integrity" | "Safety" | "Regulatory"
    preconditions: str
    test_steps: List[str]
    expected_result: str
    is_automated: bool = True
    status: str = "ready"  # "ready" | "passed" | "failed" | "blocked"

class PlanningAgent:
    """Specialist Agent 2: Work Breakdown Structure, Engineering Tasks & QA Test Generation."""

    def __init__(self):
        self.agent_id = "agent_2_planning"
        self.agent_name = "Agent 2: Planning & Tasks Breakdown"

    def generate_plan(self, project_id: str, approved_requirements: List[Dict[str, Any]]) -> Dict[str, Any]:
        logger.info(f"Specialist Agent 2 generating task breakdown for project {project_id} ({len(approved_requirements)} requirements)")

        if not approved_requirements:
            return {"tasks": [], "test_cases": [], "message": "No approved requirements to plan from."}

        # Format requirements context for AI prompt
        req_summaries = []
        for r in approved_requirements:
            crits = "; ".join(r.get("acceptance_criteria", []))
            req_summaries.append(
                f"- [{r.get('id')}] {r.get('title')} ({r.get('type')}, Priority: {r.get('priority')})\n"
                f"  Description: {r.get('description')}\n"
                f"  Acceptance Criteria: {crits}"
            )
        req_context = "\n\n".join(req_summaries)

        system_instruction = (
            "You are Specialist Agent 2 (Work Breakdown Structure & QA Planning) in the GENQUANTAA ADLC platform.\n"
            "Your job is to read approved GxP requirements for a Clinical Trial CSV Copilot and generate:\n"
            "1. Actionable Engineering Implementation Tasks with assigned roles, DoD checklists, and hour estimates.\n"
            "2. Deterministic QA Test Cases with pre-conditions, step-by-step verification, and expected results."
        )

        schema_description = """
        {
          "tasks": [
            {
              "requirement_id": "string",
              "title": "string",
              "description": "string",
              "role": "Backend Engineer | Clinical Data Manager | QA Validator | DevOps",
              "estimated_hours": 8,
              "priority": "Critical | High | Medium | Low",
              "definition_of_done": ["string"],
              "dependencies": ["string"]
            }
          ],
          "test_cases": [
            {
              "requirement_id": "string",
              "title": "string",
              "category": "Functional | Integrity | Safety | Regulatory",
              "preconditions": "string",
              "test_steps": ["string"],
              "expected_result": "string",
              "is_automated": true
            }
          ]
        }
        """

        user_prompt = f"APPROVED GXP REQUIREMENTS FOR CLINICAL CSV COPILOT:\n\n{req_context}\n\nGenerate engineering tasks and test cases for all requirements."

        try:
            llm_res = llm_gateway.generate_structured(system_instruction, user_prompt, schema_description)
            result = llm_res.structured_data or {}
        except Exception as e:
            logger.warning(f"Agent 2 LLM generation fallback ({e})")
            result = {}

        raw_tasks = result.get("tasks", [])
        raw_test_cases = result.get("test_cases", [])

        # Fallback if LLM output was sparse
        if not raw_tasks:
            raw_tasks = self._deterministic_fallback_tasks(approved_requirements)
        if not raw_test_cases:
            raw_test_cases = self._deterministic_fallback_tests(approved_requirements)

        now = datetime.utcnow().isoformat()
        tasks_col = db_manager.get_collection("project_tasks")
        tests_col = db_manager.get_collection("project_test_cases")

        saved_tasks = []
        for t in raw_tasks:
            task_doc = {
                "id": f"tsk_{uuid.uuid4().hex[:8]}",
                "project_id": project_id,
                "requirement_id": t.get("requirement_id", "REQ-CSV-001"),
                "title": t.get("title", "Engineering Task"),
                "description": t.get("description", ""),
                "role": t.get("role", "Backend Engineer"),
                "estimated_hours": t.get("estimated_hours", 8),
                "priority": t.get("priority", "High"),
                "status": "todo",
                "definition_of_done": t.get("definition_of_done", ["Unit tests pass", "Code reviewed", "Evidence logged"]),
                "dependencies": t.get("dependencies", []),
                "created_at": now,
                "updated_at": now,
            }
            tasks_col.insert_one(task_doc)
            saved_tasks.append(task_doc)

        saved_tests = []
        for tc in raw_test_cases:
            test_doc = {
                "id": f"tc_{uuid.uuid4().hex[:8]}",
                "project_id": project_id,
                "requirement_id": tc.get("requirement_id", "REQ-CSV-001"),
                "title": tc.get("title", "Verification Test Case"),
                "category": tc.get("category", "Functional"),
                "preconditions": tc.get("preconditions", "Valid test dataset in sample_documents/"),
                "test_steps": tc.get("test_steps", ["Execute validation check", "Inspect exit code", "Verify audit record"]),
                "expected_result": tc.get("expected_result", "Pass with zero deviation"),
                "is_automated": tc.get("is_automated", True),
                "status": "ready",
                "created_at": now,
            }
            tests_col.insert_one(test_doc)
            saved_tests.append(test_doc)

        return {
            "project_id": project_id,
            "tasks_count": len(saved_tasks),
            "test_cases_count": len(saved_tests),
            "tasks": saved_tasks,
            "test_cases": saved_tests,
            "agent": self.agent_name
        }

    def _deterministic_fallback_tasks(self, requirements: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return [
            {
                "requirement_id": "REQ-CSV-001",
                "title": "Implement Stream Parser & SHA-256 Ingestion Service",
                "description": "Ingest comma-delimited CSV up to 25MB with cryptographic checksum validation prior to persistence.",
                "role": "Backend Engineer",
                "estimated_hours": 12,
                "priority": "Critical",
                "definition_of_done": ["SHA-256 checksum calculated before DB insert", "Chunked streaming implemented", "Malformed delimiters trigger line errors"],
                "dependencies": []
            },
            {
                "requirement_id": "REQ-CSV-002",
                "title": "Build Clinical Subject ID Quarantine Logic",
                "description": "Inspect USUBJID and VISITNUM columns. Immediately isolate row into deviation quarantine if null.",
                "role": "Clinical Data Manager",
                "estimated_hours": 8,
                "priority": "Critical",
                "definition_of_done": ["Null USUBJID quarantined with reason", "Audit alert emitted to study monitor", "Dataset promotion halted"],
                "dependencies": ["Implement Stream Parser & SHA-256 Ingestion Service"]
            },
            {
                "requirement_id": "REQ-CSV-003",
                "title": "Develop 3x ULN Safety Outlier & Missingness Detector",
                "description": "Calculate column-wise missingness and evaluate ALT/AST liver injury thresholds against normal ranges.",
                "role": "Data Scientist",
                "estimated_hours": 10,
                "priority": "High",
                "definition_of_done": ["Missing AST flags row with MISSING_VALUE", "3x ULN flags DILI alert", "Summary statistics generated"],
                "dependencies": ["Build Clinical Subject ID Quarantine Logic"]
            },
            {
                "requirement_id": "REQ-CSV-004",
                "title": "Implement 21 CFR Part 11 Electronic Audit Trail",
                "description": "Record immutable, timestamped operator logs with SHA-256 input checksums for all human approvals and agent inferences.",
                "role": "QA Validator",
                "estimated_hours": 14,
                "priority": "Critical",
                "definition_of_done": ["Audit events saved to MongoDB", "Operator name and UTC timestamp captured", "Immutable read-only query API"],
                "dependencies": []
            }
        ]

    def _deterministic_fallback_tests(self, requirements: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return [
            {
                "requirement_id": "REQ-CSV-001",
                "title": "TC-01: UTF-8 & Delimiter Integrity Verification",
                "category": "Functional",
                "preconditions": "clinical_trial_lab_data.csv present in storage",
                "test_steps": ["Read file header", "Validate comma separator", "Verify UTF-8 encoding without BOM"],
                "expected_result": "Header matches 11 standard CDISC columns: USUBJID, VISITNUM, LBTESTCD, etc.",
                "is_automated": True
            },
            {
                "requirement_id": "REQ-CSV-002",
                "title": "TC-02: Null Patient ID Quarantine & Deviation Assertion",
                "category": "Integrity",
                "preconditions": "Row 17 contains null USUBJID",
                "test_steps": ["Execute integrity check", "Assert row 17 quarantine status", "Verify deviation flag COMPLIANCE_ERROR_NULL_USUBJID"],
                "expected_result": "Dataset quarantined, non-promotable, audit log written",
                "is_automated": True
            },
            {
                "requirement_id": "REQ-CSV-003",
                "title": "TC-03: Missing AST & 3x ULN Liver Safety Outlier Alert",
                "category": "Safety",
                "preconditions": "Row 12 missing AST, Rows 9-10 ALT=185, AST=140",
                "test_steps": ["Run safety outlier check", "Verify row 12 flagged as MISSING_VALUE", "Assert ALT 185 > 3x ULN triggers DILI alert"],
                "expected_result": "Safety signals logged and study lead alerted",
                "is_automated": True
            },
            {
                "requirement_id": "REQ-CSV-004",
                "title": "TC-04: 21 CFR Part 11 Audit Trail Immutability Verification",
                "category": "Regulatory",
                "preconditions": "Approval event recorded in database",
                "test_steps": ["Query audit log entry", "Verify operator ID and timestamp", "Assert SHA-256 hash matches original document"],
                "expected_result": "ALCOA+ attributable and verifiable audit record",
                "is_automated": True
            }
        ]

planning_agent = PlanningAgent()
