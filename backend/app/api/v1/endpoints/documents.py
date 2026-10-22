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

@router.get("/documents/samples/list", tags=["Documents"])
def list_sample_documents():
    """
    Dynamically discover all sample files available on the server without hardcoded filenames.
    """
    sample_dir = BASE_DIR / "sample_documents"
    if not sample_dir.exists():
        return {"total": 0, "items": []}
    
    files = []
    for f in sample_dir.iterdir():
        if f.is_file():
            files.append({
                "filename": f.name,
                "file_type": f.suffix.replace(".", "").lower(),
                "size_bytes": f.stat().st_size,
                "download_url": f"/api/v1/documents/sample/{f.name}/download"
            })
    return {"total": len(files), "items": files}

@router.post("/projects/{project_id}/documents/load-sample", response_model=DocumentMetadataResponse, tags=["Documents"])
async def load_sample_document(
    project_id: str,
    sample_type: Optional[str] = None,
    filename: Optional[str] = None,
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Dynamically loads any sample document from sample_documents into the target project.
    Accepts specific filename or auto-resolves from available files.
    """
    project_service.get_project(project_id)
    sample_dir = BASE_DIR / "sample_documents"
    if not sample_dir.exists():
        raise HTTPException(status_code=404, detail="Sample documents directory not found")

    target_path = None
    target_filename = None

    if filename and filename.strip():
        safe_name = Path(filename).name
        candidate = sample_dir / safe_name
        if candidate.exists() and candidate.is_file():
            target_path = candidate
            target_filename = safe_name

    if not target_path:
        # Dynamically search directory matching sample_type extension
        desired_ext = ".csv" if (sample_type and "csv" in sample_type.lower()) else None
        available_files = [f for f in sample_dir.iterdir() if f.is_file()]
        
        if desired_ext:
            for f in available_files:
                if f.suffix.lower() == desired_ext:
                    target_path = f
                    target_filename = f.name
                    break
        
        if not target_path and available_files:
            target_path = available_files[0]
            target_filename = available_files[0].name

    if not target_path or not target_path.exists():
        raise HTTPException(status_code=404, detail="No matching sample document found in sample_documents directory")

    with open(target_path, "rb") as f:
        saved_path, checksum, file_size = storage_service.save_file(
            project_id=project_id,
            filename=target_filename,
            file_obj=f
        )

    extracted_text, parse_meta = document_parser.extract_text(saved_path, target_filename)
    doc_id = f"doc_{uuid.uuid4().hex[:12]}"
    now = datetime.utcnow().isoformat()
    ext = target_path.suffix.replace(".", "").lower()

    doc_record = {
        "id": doc_id,
        "project_id": project_id,
        "filename": target_filename,
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
        filename=target_filename,
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

@router.get("/documents/sample/{filename}/download", tags=["Documents"])
def download_sample_document(filename: str):
    """
    Dynamically stream any file present in sample_documents directory without hardcoded lists.
    """
    from fastapi.responses import FileResponse
    safe_filename = Path(filename).name
    sample_dir = (BASE_DIR / "sample_documents").resolve()
    file_path = (sample_dir / safe_filename).resolve()

    # Prevent directory traversal attacks
    if not str(file_path).startswith(str(sample_dir)) or not file_path.is_file():
        raise HTTPException(status_code=404, detail=f"Sample file '{safe_filename}' not found")
    
    return FileResponse(
        path=str(file_path),
        filename=safe_filename,
        media_type="application/octet-stream"
    )

