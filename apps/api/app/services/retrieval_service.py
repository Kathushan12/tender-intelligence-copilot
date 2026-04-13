from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.models.tender import Tender


def search_document_chunks(
    db: Session,
    tender_id: int,
    owner_id: int,
    query: str,
    limit: int = 10,
):
    query = query.strip()
    if not query:
        return []

    results = (
        db.query(DocumentChunk)
        .join(Document, DocumentChunk.document_id == Document.id)
        .join(Tender, Document.tender_id == Tender.id)
        .filter(
            Tender.id == tender_id,
            Tender.owner_id == owner_id,
            or_(
                DocumentChunk.chunk_text.ilike(f"%{query}%"),
            ),
        )
        .order_by(DocumentChunk.page_number.asc(), DocumentChunk.chunk_index.asc())
        .limit(limit)
        .all()
    )

    return results