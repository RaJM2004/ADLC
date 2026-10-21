from datetime import datetime
from typing import Any, Dict, List, Optional
import uuid
from pydantic import BaseModel, Field
from app.core.logging import logger
from app.database.client import db_manager
from app.modules.llm.gateway import llm_gateway

class RequirementDraftItem(BaseModel):
    id: str = Field(..., description="Unique requirement ID like REQ-CSV-001")
    title: str = Field(..., description="Concise requirement title")
    description: str = Field(..., description="Clear requirement specification")
    type: str = Field("functional", description="functional | regulatory | safety | performance")
    priority: str = Field("medium", description="low | medium | high | critical")
    acceptance_criteria: List[str] = Field(default_factory=list)
    source_reference: str = Field("Document text extraction", description="Source citation")

class Agent1ExtractionOutput(BaseModel):
    project_brief: str
    requirements: List[RequirementDraftItem]
    missing_information_questions: List[str] = Field(default_factory=list)

class IntakeRequirementsAgent:
    AGENT_ID = "agent_01_intake_requirements"
    AGENT_VERSION = "1.0.0"

    def execute(
        self,
        project_id: str,
        document_text: str,
        filename: str,
        project_metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Executes Specialist Agent 1 to extract structured requirements from document text.
        """
        start_time = datetime.utcnow()
        run_id = f"run_{uuid.uuid4().hex[:12]}"

        system_prompt = (
            "You are Specialist Agent 1: Intake and Requirements Agent for the GENQUANTAA ADLC platform.\n"
            "Your role is to analyze project documents, intended use statements, and clinical/technical guidelines "
            "to extract high-integrity, structured requirement specifications for AI systems.\n"
            "Enforce GxP data integrity (ALCOA+), 21 CFR Part 11, and safety guardrails where applicable.\n"
            "Never invent false regulatory statements; always cite the exact document section in source_reference."
        )

        user_prompt = (
            f"Project Name: {project_metadata.get('name')}\n"
            f"Intended Use: {project_metadata.get('intended_use')}\n"
            f"Domain: {project_metadata.get('domain')}\n"
            f"Document Filename: {filename}\n\n"
            f"Document Content Extract:\n"
            f"{document_text[:6000]}\n\n"
            "Extract at least 4 clear, verifiable requirements with acceptance criteria."
        )

        schema_description = """
        {
            "project_brief": "string summarizing intent and scope",
            "requirements": [
                {
                    "id": "REQ-...",
                    "title": "string",
                    "description": "string",
                    "type": "functional | regulatory | safety | performance",
                    "priority": "low | medium | high | critical",
                    "acceptance_criteria": ["string", "string"],
                    "source_reference": "string citation"
                }
            ],
            "missing_information_questions": ["string"]
        }
        """

        llm_res = llm_gateway.generate_structured(system_prompt, user_prompt, schema_description)
        raw_data = llm_res.structured_data or {}

        # Validate with Pydantic
        try:
            validated = Agent1ExtractionOutput(**raw_data)
        except Exception as e:
            logger.warning(f"Pydantic validation warning on Agent 1 output: {e}. Coercing fields.")
            validated = Agent1ExtractionOutput(
                project_brief=raw_data.get("project_brief", "Clinical CSV Copilot Ingestion Brief"),
                requirements=[],
                missing_information_questions=raw_data.get("missing_information_questions", [])
            )
            for r in raw_data.get("requirements", []):
                validated.requirements.append(
                    RequirementDraftItem(
                        id=r.get("id", f"REQ-{uuid.uuid4().hex[:6].upper()}"),
                        title=r.get("title", "Requirement Title"),
                        description=r.get("description", "Requirement Description"),
                        type=r.get("type", "functional"),
                        priority=r.get("priority", "high"),
                        acceptance_criteria=r.get("acceptance_criteria", []),
                        source_reference=r.get("source_reference", filename)
                    )
                )

        # Persist requirements into MongoDB collection `project_requirements`
        req_col = db_manager.get_collection("project_requirements")
        persisted_items = []
        for req in validated.requirements:
            doc = {
                "id": req.id,
                "project_id": project_id,
                "title": req.title,
                "description": req.description,
                "type": req.type,
                "priority": req.priority,
                "acceptance_criteria": req.acceptance_criteria,
                "source_reference": req.source_reference,
                "review_status": "draft",
                "reviewer": None,
                "reviewed_at": None,
                "created_at": datetime.utcnow().isoformat(),
                "agent_run_id": run_id
            }
            req_col.insert_one(doc)
            doc_copy = dict(doc)
            if "_id" in doc_copy:
                doc_copy["_id"] = str(doc_copy["_id"])
            persisted_items.append(doc_copy)

        end_time = datetime.utcnow()
        duration_s = (end_time - start_time).total_seconds()

        # Record Agent Run Telemetry
        agent_run_doc = {
            "id": run_id,
            "project_id": project_id,
            "agent_id": self.AGENT_ID,
            "agent_version": self.AGENT_VERSION,
            "status": "completed",
            "model_name": llm_res.model_name,
            "is_mock": llm_res.is_mock,
            "prompt_tokens": llm_res.prompt_tokens,
            "completion_tokens": llm_res.completion_tokens,
            "cost_usd": llm_res.cost_usd,
            "duration_seconds": round(duration_s, 2),
            "output_count": len(persisted_items),
            "created_at": start_time.isoformat(),
            "completed_at": end_time.isoformat()
        }
        runs_col = db_manager.get_collection("agent_runs")
        runs_col.insert_one(agent_run_doc)

        return {
            "run_id": run_id,
            "project_brief": validated.project_brief,
            "requirements_extracted": len(persisted_items),
            "requirements": persisted_items,
            "missing_information_questions": validated.missing_information_questions,
            "model_metadata": {
                "model": llm_res.model_name,
                "is_mock": llm_res.is_mock,
                "tokens": llm_res.prompt_tokens + llm_res.completion_tokens,
                "duration_s": round(duration_s, 2)
            }
        }

intake_agent = IntakeRequirementsAgent()
