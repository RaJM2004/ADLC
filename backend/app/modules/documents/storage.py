import hashlib
import os
import shutil
from pathlib import Path
from typing import BinaryIO, Dict, Tuple
from app.core.config import settings

class StorageService:
    def __init__(self):
        self.upload_dir = Path(settings.LOCAL_STORAGE_PATH)
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def compute_sha256(self, file_obj: BinaryIO) -> str:
        """Compute SHA-256 checksum of file stream without reading all into memory."""
        hasher = hashlib.sha256()
        file_obj.seek(0)
        while chunk := file_obj.read(65536):
            hasher.update(chunk)
        file_obj.seek(0)
        return hasher.hexdigest()

    def save_file(self, project_id: str, filename: str, file_obj: BinaryIO) -> Tuple[str, str, int]:
        """
        Saves uploaded file securely into project storage directory.
        Returns: (relative_storage_path, sha256_checksum, file_size_bytes)
        """
        project_dir = self.upload_dir / project_id
        project_dir.mkdir(parents=True, exist_ok=True)

        # Sanitize filename
        safe_name = "".join(c for c in filename if c.isalnum() or c in "._- ")
        dest_path = project_dir / safe_name

        checksum = self.compute_sha256(file_obj)

        with open(dest_path, "wb") as buffer:
            file_obj.seek(0)
            shutil.copyfileobj(file_obj, buffer)

        file_size = dest_path.stat().st_size
        return str(dest_path), checksum, file_size

storage_service = StorageService()
