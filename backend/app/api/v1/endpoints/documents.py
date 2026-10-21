from datetime import datetime
from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel
from app.core.config import settings, BASE_DIR
from app.core.security import CurrentUser, get_current_user
from app.database.client import db_manager
from app.modules.documents.storage import storage_service
from app.modules.documents.parser import document_parser
from app.services.project_service import project_service

router = APIRouter()

class DocumentMetadataResponse(BaseModel):
    id: str
    project_id: str
    filename: str
    file_type: str
    file_size_bytes: int
    sha256_checksum: str
    created_at: str
    extracted_text_preview: str

@router.post("/projects/{project_id}/documents", response_model=DocumentMetadataResponse, tags=["Documents"])
async def upload_project_document(
    project_id: str,
    file: UploadFile = File(...),
    current_user: CurrentUser = Depends(get_current_user)
):
    # Verify project exists
    project_service.get_project(project_id)

    # Validate size & extension
    filename = file.filename or "uploaded_file"
    ext = "." + filename.split(".")[-1].lower() if "." in filename else ""
    if ext not in document_parser.SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{ext}'. Supported: {', '.join(document_parser.SUPPORTED_EXTENSIONS)}"
        )

    # Save to storage abstraction
    saved_path, checksum, file_size = storage_service.save_file(
        project_id=project_id,
        filename=filename,
        file_obj=file.file
    )

    # Parse text
    try:
        extracted_text, parse_meta = document_parser.extract_text(saved_path, filename)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to extract text from document: {e}"
        )

    doc_id = f"doc_{uuid.uuid4().hex[:12]}"
    now = datetime.utcnow().isoformat()

    doc_record = {
        "id": doc_id,
        "project_id": project_id,
        "filename": filename,
        "file_type": ext.replace(".", ""),
        "file_size_bytes": file_size,
        "sha256_checksum": checksum,
        "storage_path": saved_path,
        "extracted_text": extracted_text,
        "parse_metadata": parse_meta,
        "uploaded_by": current_user.display_name,
        "created_at": now
    }

    col = db_manager.get_collection("project_documents")
    col.insert_one(doc_record)

    return DocumentMetadataResponse(
        id=doc_id,
        project_id=project_id,
        filename=filename,
        file_type=ext.replace(".", ""),
        file_size_bytes=file_size,
        sha256_checksum=checksum,
        created_at=now,
        extracted_text_preview=extracted_text[:300] + ("..." if len(extracted_text) > 300 else "")
    )

from pathlib import Path

@router.get("/projects/{project_id}/documents", tags=["Documents"])
def list_project_documents(
    project_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    col = db_manager.get_collection("project_documents")
    items = col.find({"project_id": project_id})
    return {"total": len(items), "items": items}

@router.post("/projects/{project_id}/documents/load-sample", response_model=DocumentMetadataResponse, tags=["Documents"])
async def load_sample_document(
    project_id: str,
    sample_type: str = "spec",
    current_user: CurrentUser = Depends(get_current_user)
):
    # Verify project exists
    project_service.get_project(project_id)

    # Locate sample file in sample_documents directory
    base_dir = BASE_DIR
    if sample_type == "csv":
        sample_path = base_dir / "sample_documents" / "clinical_trial_lab_data.csv"
        filename = "clinical_trial_lab_data.csv"
    else:
        sample_path = base_dir / "sample_documents" / "GxP_Clinical_Protocol_Specification.txt"
        filename = "GxP_Clinical_Protocol_Specification.txt"

    if not sample_path.exists():
        raise HTTPException(status_code=404, detail=f"Sample document file not found at {sample_path}")

    with open(sample_path, "rb") as f:
        saved_path, checksum, file_size = storage_service.save_file(
            project_id=project_id,
            filename=filename,
            file_obj=f
        )

    extracted_text, parse_meta = document_parser.extract_text(saved_path, filename)
    doc_id = f"doc_{uuid.uuid4().hex[:12]}"
    now = datetime.utcnow().isoformat()
    ext = sample_path.suffix.replace(".", "")

    doc_record = {
        "id": doc_id,
        "project_id": project_id,
        "filename": filename,
        "file_type": ext,
        "file_size_bytes": file_size,
        "sha256_checksum": checksum,
        "storage_path": saved_path,
        "extracted_text": extracted_text,
        "parse_metadata": parse_meta,
        "uploaded_by": current_user.display_name,
        "created_at": now
    }

    col = db_manager.get_collection("project_documents")
    col.insert_one(doc_record)

    return DocumentMetadataResponse(
        id=doc_id,
        project_id=project_id,
        filename=filename,
        file_type=ext,
        file_size_bytes=file_size,
        sha256_checksum=checksum,
        created_at=now,
        extracted_text_preview=extracted_text[:300] + ("..." if len(extracted_text) > 300 else "")
    )

@router.get("/documents/{document_id}", tags=["Documents"])
def get_document(
    document_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    col = db_manager.get_collection("project_documents")
    doc = col.find_one({"id": document_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

