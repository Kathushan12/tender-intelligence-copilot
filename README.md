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
## How the System Works
### Main Workflow
1. User logs in
2. User creates a tender workspace
3. User uploads tender PDF documents
4. Backend stores the file and metadata
5. Document is parsed into page-level text
6. Extracted text is split into chunks
7. Chunks are stored in PostgreSQL
8. Embeddings are generated and stored in pgvector
9. User performs keyword or semantic search over tender content

## Prerequisites
### Before running the project, install:

- Node.js
- Python 3.11+ or compatible version
- Docker Desktop
- Git

## Local Setup Guide
1. Clone the repository
```
git clone <YOUR_GITHUB_REPO_URL>
cd tender-intelligence-copilot
```
2. Start PostgreSQL with Docker
```
docker compose up -d
```
3. Backend setup
```
cd apps/api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```
Create backend .env file from the example values:
```
APP_NAME=Tender Intelligence Copilot API
APP_ENV=development
POSTGRES_SERVER=127.0.0.1
POSTGRES_PORT=5433
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=tender_copilot

SECRET_KEY=change_this_to_a_random_secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

OPENAI_API_KEY=your_openai_api_key_here
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_EMBEDDING_DIMENSIONS=1536

UPLOAD_DIR=../../uploads
```
Run the backend:
```
uvicorn app.main:app --reload
```
Backend runs at:
```
http://127.0.0.1:8000
```
Swagger docs:
```
http://127.0.0.1:8000/docs
```
4. Frontend setup
Open a new terminal and go to frontend:
```
cd apps/web
npm install
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
npm run dev
http://localhost:3000
```

## How to Use the Application
1. Register a user
Use Swagger or the frontend login flow.

2. Login
Use the same account consistently during testing.

3. Create a tender
Go to dashboard and create a new tender.

4. Upload a PDF
Open the tender documents page and upload a PDF.

5. Parse the document
Click Parse Document.

6. Embed the document
Click Embed Document.

7. Search
Go to the search page and test:
  - Keyword Search
  - Semantic Search

### Important Development Note
Use one account consistently while testing the full pipeline:

- login
- tender creation
- upload
- parse
- embed
- search
  
Mixing multiple test accounts can cause confusion because tenders and documents are tied to the logged-in user.






















