from datetime import datetime

from pydantic import BaseModel


class DocumentChunkOut(BaseModel):
    id: int
    document_id: int
    page_number: int
    chunk_index: int
    chunk_text: str
    char_count: int
    created_at: datetime

    model_config = {"from_attributes": True}