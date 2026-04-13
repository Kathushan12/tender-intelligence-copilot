from datetime import datetime

from pydantic import BaseModel


class TenderCreate(BaseModel):
    title: str
    tender_number: str | None = None
    issuing_authority: str | None = None
    description: str | None = None
    status: str = "draft"


class TenderUpdate(BaseModel):
    title: str | None = None
    tender_number: str | None = None
    issuing_authority: str | None = None
    description: str | None = None
    status: str | None = None


class TenderOut(BaseModel):
    id: int
    title: str
    tender_number: str | None
    issuing_authority: str | None
    description: str | None
    status: str
    owner_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}