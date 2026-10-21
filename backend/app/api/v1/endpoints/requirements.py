from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from app.core.security import CurrentUser, get_current_user
from app.database.client import db_manager
from app.modules.requirements.agent import intake_agent
from app.services.project_service import project_service

router = APIRouter()

class ExtractRequirementsRequest(BaseModel):
    document_id: Optional[str] = None
    document_ids: Optional[List[str]] = None
    custom_prompt: Optional[str] = None

class ReviewRequirementRequest(BaseModel):
    decision: str = Field(..., description="'approved' | 'rejected'")
    reviewer_comments: Optional[str] = None

class UpdateRequirementRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    type: Optional[str] = None
    acceptance_criteria: Optional[List[str]] = None

@router.post("/projects/{project_id}/requirements/extract", tags=["Requirements"])
def extract_requirements_with_agent_1(
    project_id: str,
    req: ExtractRequirementsRequest,
    current_user: CurrentUser = Depends(get_current_user)
):
    project = project_service.get_project(project_id)
    doc_col = db_manager.get_collection("project_documents")

    document_text = ""
    filename = "Project Prompt"

    # Multi-document support
    target_doc_ids = []
    if req.document_ids:
        target_doc_ids.extend(req.document_ids)
    elif req.document_id:
        target_doc_ids.append(req.document_id)

    if target_doc_ids:
        doc_records = doc_col.find({"id": {"$in": target_doc_ids}})
        text_snippets = []
        filenames = []
        for d in doc_records:
            t = d.get("extracted_text", "").strip()
            fn = d.get("filename", "Doc")
            if t:
                text_snippets.append(f"--- DOCUMENT: {fn} ---\n{t}")
                filenames.append(fn)
        if text_snippets:
            document_text = "\n\n".join(text_snippets)
            filename = ", ".join(filenames)
    else:
        # Check if project already has documents uploaded
        existing_docs = doc_col.find({"project_id": project_id})
        if existing_docs:
            text_snippets = []
            filenames = []
            for d in existing_docs:
                t = d.get("extracted_text", "").strip()
                fn = d.get("filename", "Doc")
                if t:
                    text_snippets.append(f"--- DOCUMENT: {fn} ---\n{t}")
                    filenames.append(fn)
            if text_snippets:
                document_text = "\n\n".join(text_snippets)
                filename = ", ".join(filenames)

    if not document_text and req.custom_prompt:
        document_text = req.custom_prompt

    if not document_text:
        # Default pilot document text if none provided
        document_text = (
            "CLINICAL TRIAL PROTOCOL SPECIFICATION (GxP COPILOT PILOT):\n"
            "1. Ingestion: System must ingest multi-center clinical lab CSV datasets up to 25MB.\n"
            "2. Data Integrity: Enforce 21 CFR Part 11 requirements including electronic audit logs.\n"
            "3. Subject ID: Missing USUBJID or VISITNUM must halt data promotion with severe compliance flags.\n"
            "4. Statistical Outliers: Flag laboratory parameters exceeding 3 standard deviations from reference range.\n"
            "5. Traceability: Every requirement must map bidirectionally to test verification suites."
        )
        filename = "GxP_Clinical_Protocol_Baseline.pdf"

    result = intake_agent.execute(
        project_id=project_id,
        document_text=document_text,
        filename=filename,
        project_metadata=project
    )

    return result

@router.get("/projects/{project_id}/requirements", tags=["Requirements"])
def list_requirements(
    project_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    col = db_manager.get_collection("project_requirements")
    items = col.find({"project_id": project_id})
    return {"total": len(items), "items": items}

@router.patch("/requirements/{requirement_id}", tags=["Requirements"])
def update_requirement(
    requirement_id: str,
    data: UpdateRequirementRequest,
    current_user: CurrentUser = Depends(get_current_user)
):
    col = db_manager.get_collection("project_requirements")
    req = col.find_one({"id": requirement_id})
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found")

    update_fields = {k: v for k, v in data.dict(exclude_unset=True).items() if v is not None}
    update_fields["updated_at"] = datetime.utcnow().isoformat()
    col.update_one({"id": requirement_id}, {"$set": update_fields})
    return col.find_one({"id": requirement_id})

@router.post("/requirements/{requirement_id}/review", tags=["Requirements"])
def review_requirement(
    requirement_id: str,
    review: ReviewRequirementRequest,
    current_user: CurrentUser = Depends(get_current_user)
):
    decision = review.decision.lower()
    if decision not in {"approved", "rejected"}:
        raise HTTPException(status_code=400, detail="Decision must be 'approved' or 'rejected'")

    col = db_manager.get_collection("project_requirements")
    req = col.find_one({"id": requirement_id})
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found")

    update_fields = {
        "review_status": decision,
        "reviewer": current_user.display_name,
        "reviewer_comments": review.reviewer_comments,
        "reviewed_at": datetime.utcnow().isoformat()
    }
    col.update_one({"id": requirement_id}, {"$set": update_fields})

    # Also log an audit event in MongoDB collection `audit_events`
    audit_col = db_manager.get_collection("audit_events")
    audit_col.insert_one({
        "event_type": "REQUIREMENT_REVIEW",
        "requirement_id": requirement_id,
        "project_id": req.get("project_id"),
        "decision": decision,
        "reviewer": current_user.display_name,
        "timestamp": datetime.utcnow().isoformat()
    })

    return col.find_one({"id": requirement_id})
