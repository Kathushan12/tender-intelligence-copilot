from datetime import datetime

from pydantic import BaseModel


class DocumentPageOut(BaseModel):
    id: int
    document_id: int
    page_number: int
    extracted_text: str
    created_at: datetime

    model_config = {"from_attributes": True}