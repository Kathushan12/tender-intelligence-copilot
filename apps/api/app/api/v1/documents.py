from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from app.services.embedding_service import embed_texts
from app.api.deps import get_db
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.models.document_page import DocumentPage
from app.models.tender import Tender
from app.models.user import User
from app.schemas.document import DocumentOut
from app.schemas.document_chunk import DocumentChunkOut
from app.schemas.document_page import DocumentPageOut
from app.services.auth_service import get_current_user
from app.services.chunking_service import split_text_into_chunks
from app.services.file_service import save_uploaded_file
from app.services.parser_service import parse_pdf_pages

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/tenders/{tender_id}/upload", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
def upload_document(
    tender_id: int,
    file: UploadFile = File(...),
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

    stored_filename, file_path, file_size = save_uploaded_file(file, tender_id)

    document = Document(
        tender_id=tender_id,
        original_filename=file.filename,
        stored_filename=stored_filename,
        file_path=file_path,
        file_type="pdf",
        file_size=file_size,
    )

    db.add(document)
    db.commit()
    db.refresh(document)
    return document


@router.get("/tenders/{tender_id}", response_model=list[DocumentOut])
def list_documents(
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

    documents = (
        db.query(Document)
        .filter(Document.tender_id == tender_id)
        .order_by(Document.created_at.desc())
        .all()
    )
    return documents


@router.post("/{document_id}/parse")
def parse_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = (
        db.query(Document)
        .join(Tender, Document.tender_id == Tender.id)
        .filter(Document.id == document_id, Tender.owner_id == current_user.id)
        .first()
    )
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    db.query(DocumentChunk).filter(DocumentChunk.document_id == document_id).delete()
    db.query(DocumentPage).filter(DocumentPage.document_id == document_id).delete()
    db.commit()

    parsed_pages = parse_pdf_pages(document.file_path)

    total_chunks = 0

    for page_data in parsed_pages:
        page = DocumentPage(
            document_id=document_id,
            page_number=page_data["page_number"],
            extracted_text=page_data["extracted_text"],
        )
        db.add(page)

        page_chunks = split_text_into_chunks(page_data["extracted_text"])

        for idx, chunk_text in enumerate(page_chunks, start=1):
            chunk = DocumentChunk(
                document_id=document_id,
                page_number=page_data["page_number"],
                chunk_index=idx,
                chunk_text=chunk_text,
                char_count=len(chunk_text),
            )
            db.add(chunk)
            total_chunks += 1

    db.commit()

    return {
        "message": "Document parsed successfully",
        "document_id": document_id,
        "pages_count": len(parsed_pages),
        "chunks_count": total_chunks,
    }


@router.get("/{document_id}/pages", response_model=list[DocumentPageOut])
def list_document_pages(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = (
        db.query(Document)
        .join(Tender, Document.tender_id == Tender.id)
        .filter(Document.id == document_id, Tender.owner_id == current_user.id)
        .first()
    )
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    pages = (
        db.query(DocumentPage)
        .filter(DocumentPage.document_id == document_id)
        .order_by(DocumentPage.page_number.asc())
        .all()
    )
    return pages


@router.get("/{document_id}/chunks", response_model=list[DocumentChunkOut])
def list_document_chunks(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = (
        db.query(Document)
        .join(Tender, Document.tender_id == Tender.id)
        .filter(Document.id == document_id, Tender.owner_id == current_user.id)
        .first()
    )
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    chunks = (
        db.query(DocumentChunk)
        .filter(DocumentChunk.document_id == document_id)
        .order_by(DocumentChunk.page_number.asc(), DocumentChunk.chunk_index.asc())
        .all()
    )
    return chunks

@router.post("/{document_id}/embed")
def embed_document_chunks(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = (
        db.query(Document)
        .join(Tender, Document.tender_id == Tender.id)
        .filter(Document.id == document_id, Tender.owner_id == current_user.id)
        .first()
    )
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    chunks = (
        db.query(DocumentChunk)
        .filter(DocumentChunk.document_id == document_id)
        .order_by(DocumentChunk.page_number.asc(), DocumentChunk.chunk_index.asc())
        .all()
    )

    if not chunks:
        raise HTTPException(status_code=400, detail="No chunks found. Parse the document first.")

    texts = [chunk.chunk_text for chunk in chunks]
    embeddings = embed_texts(texts)

    for chunk, embedding in zip(chunks, embeddings):
        chunk.embedding = embedding

    db.commit()

    return {
        "message": "Document embedded successfully",
        "document_id": document_id,
        "embedded_chunks": len(chunks),
    }