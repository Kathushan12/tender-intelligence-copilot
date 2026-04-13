from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.models.tender import Tender


def semantic_search_chunks(
    db: Session,
    tender_id: int,
    owner_id: int,
    query_embedding: list[float],
    limit: int = 10,
):
    results = (
        db.query(DocumentChunk)
        .join(Document, DocumentChunk.document_id == Document.id)
        .join(Tender, Document.tender_id == Tender.id)
        .filter(
            Tender.id == tender_id,
            Tender.owner_id == owner_id,
            DocumentChunk.embedding.isnot(None),
        )
        .order_by(DocumentChunk.embedding.cosine_distance(query_embedding))
        .limit(limit)
        .all()
    )
    return results