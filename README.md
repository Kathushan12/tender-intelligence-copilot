# Tender Intelligence Copilot

Tender Intelligence Copilot is a full-stack AI-powered tender document analysis platform.  
It allows users to create tender workspaces, upload tender PDFs, parse document text, split content into chunks, and perform both keyword and semantic search over tender documents.

The project is built with a monorepo structure using:

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** FastAPI, Python
- **Database:** PostgreSQL + pgvector
- **AI:** OpenAI Embeddings
- **PDF Parsing:** pypdf
- **Containerization:** Docker

---

## Features

### Current Features

- User registration and login
- Tender workspace creation and listing
- PDF document upload per tender
- Document parsing into page-level text
- Text chunking for retrieval
- Keyword search over parsed chunks
- Semantic search using OpenAI embeddings + pgvector
- Frontend pages for dashboard, documents, and search

### Planned Features

- Grounded tender Q&A assistant
- Hybrid search ranking
- Risk clause identification
- Tender requirement extraction
- Compliance checklist generation
- Report export

---

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend

- FastAPI
- SQLAlchemy
- Psycopg
- Pydantic
- Pydantic Settings

### Database

- PostgreSQL
- pgvector

### AI / Retrieval

- OpenAI Embeddings
- Semantic Search
- Keyword Search

### Document Processing

- pypdf

### DevOps / Tooling

- Docker
- Git
- GitHub

---

## Project Structure

```text
tender-intelligence-copilot/
├── apps/
│   ├── api/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   └── v1/
│   │   │   ├── core/
│   │   │   ├── db/
│   │   │   ├── models/
│   │   │   ├── schemas/
│   │   │   ├── services/
│   │   │   └── main.py
│   │   ├── .env
│   │   └── requirements.txt
│   │
│   └── web/
│       ├── app/
│       ├── lib/
│       ├── components/
│       └── package.json
│
├── uploads/
├── docker-compose.yml
├── .gitignore
├── .env.example
└── README.md
```
