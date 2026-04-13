from pydantic import BaseModel


class SearchRequest(BaseModel):
    query: str


class SearchResultOut(BaseModel):
    document_id: int
    page_number: int
    chunk_index: int
    chunk_text: str
    char_count: int

    model_config = {"from_attributes": True}


class EmbedDocumentResponse(BaseModel):
    message: str
    document_id: int
    embedded_chunks: int