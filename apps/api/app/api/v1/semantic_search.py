from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.tender import Tender
from app.models.user import User
from app.schemas.search import SearchRequest, SearchResultOut
from app.services.auth_service import get_current_user
from app.services.embedding_service import embed_text
from app.services.semantic_retrieval_service import semantic_search_chunks

router = APIRouter(prefix="/semantic-search", tags=["semantic-search"])


@router.post("/tenders/{tender_id}", response_model=list[SearchResultOut])
def semantic_search_tender(
    tender_id: int,
    payload: SearchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tender = (
        db.query(Tender)
        .filter(Tender.id == tender_id, Tender.owner_id == current_user.id)
        .first()
    )
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    query_embedding = embed_text(payload.query)

    results = semantic_search_chunks(
        db=db,
        tender_id=tender_id,
        owner_id=current_user.id,
        query_embedding=query_embedding,
        limit=10,
    )
    return results