from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.tender import Tender
from app.models.user import User
from app.schemas.tender import TenderCreate, TenderOut, TenderUpdate
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/tenders", tags=["tenders"])


@router.post("", response_model=TenderOut, status_code=status.HTTP_201_CREATED)
def create_tender(
    payload: TenderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tender = Tender(
        title=payload.title,
        tender_number=payload.tender_number,
        issuing_authority=payload.issuing_authority,
        description=payload.description,
        status=payload.status,
        owner_id=current_user.id,
    )
    db.add(tender)
    db.commit()
    db.refresh(tender)
    return tender


@router.get("", response_model=list[TenderOut])
def list_my_tenders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tenders = (
        db.query(Tender)
        .filter(Tender.owner_id == current_user.id)
        .order_by(Tender.created_at.desc())
        .all()
    )
    return tenders


@router.get("/{tender_id}", response_model=TenderOut)
def get_tender(
    tender_id: int,
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
    return tender


@router.patch("/{tender_id}", response_model=TenderOut)
def update_tender(
    tender_id: int,
    payload: TenderUpdate,
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

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tender, field, value)

    db.commit()
    db.refresh(tender)
    return tender


@router.delete("/{tender_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tender(
    tender_id: int,
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

    db.delete(tender)
    db.commit()