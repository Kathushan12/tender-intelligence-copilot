from datetime import datetime

from pydantic import BaseModel


class DocumentOut(BaseModel):
    id: int
    tender_id: int
    original_filename: str
    stored_filename: str
    file_path: str
    file_type: str
    file_size: int
    created_at: datetime

    model_config = {"from_attributes": True}