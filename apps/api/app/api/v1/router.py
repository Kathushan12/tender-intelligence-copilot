from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.documents import router as documents_router
from app.api.v1.search import router as search_router
from app.api.v1.semantic_search import router as semantic_search_router
from app.api.v1.tenders import router as tenders_router

router = APIRouter()

router.include_router(auth_router)
router.include_router(tenders_router)
router.include_router(documents_router)
router.include_router(search_router)
router.include_router(semantic_search_router)


@router.get("/ping")
def ping():
    return {"message": "pong"}