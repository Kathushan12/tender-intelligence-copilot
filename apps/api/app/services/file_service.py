import os
import shutil
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile

from app.core.config import settings


def save_uploaded_file(upload_file: UploadFile, tender_id: int) -> tuple[str, str, int]:
    if not upload_file.filename:
        raise HTTPException(status_code=400, detail="File must have a name")

    file_extension = Path(upload_file.filename).suffix.lower()
    if file_extension != ".pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    base_upload_dir = Path(__file__).resolve().parent / settings.UPLOAD_DIR
    tender_dir = base_upload_dir / f"tender_{tender_id}"
    tender_dir.mkdir(parents=True, exist_ok=True)

    stored_filename = f"{uuid.uuid4().hex}{file_extension}"
    file_path = tender_dir / stored_filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

    file_size = os.path.getsize(file_path)

    return stored_filename, str(file_path), file_size