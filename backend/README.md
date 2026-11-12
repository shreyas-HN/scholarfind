# ScholarFind – FastAPI Python Backend

FastAPI REST backend with SQLite / PostgreSQL, SQLAlchemy ORM, and deterministic Python rule engine for Indian scholarship discovery.

## Tech Stack
- **Framework**: FastAPI (v0.110+)
- **Server**: Uvicorn
- **Validation**: Pydantic v2
- **ORM & DB**: SQLAlchemy 2.0 with SQLite (`scholarfind.db`) or PostgreSQL via `DATABASE_URL`

## Database Architecture
The backend maintains 5 distinct tables:
1. `students`: Stores comprehensive student profile records across 5 steps (personal, educational, caste category, financial income, and accommodation).
2. `scholarships`: Stores verified schemes (NSP, Karnataka SSP, AICTE, MoE, MoSJE) with official URLs, verification dates, and deadlines.
3. `eligibility_criteria`: Relational criteria linked to each scholarship with income limits, percentiles, categories, genders, and domiciles.
4. `saved_scholarships`: Many-to-many relationship tracking student bookmarks.
5. `applications`: Application status tracking (`Interested`, `Applied`, `Not Applied`), reference numbers, and notes.

## Installation & Setup

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Start the FastAPI server
uvicorn backend.main:app --port 8000 --host 0.0.0.0 --reload
```

## API Route Endpoints

### Health Check
- `GET /api/health`: Service health check and timestamp

### Student Profiles
- `POST /api/students`: Register student and persist profile
- `GET /api/students/{student_id}`: Retrieve student profile
- `PUT /api/students/{student_id}`: Update student profile details

### Scholarships Directory
- `GET /api/scholarships`: Search & filter scholarships by keyword, provider, or scheme type
- `GET /api/scholarships/{scholarship_id}`: Retrieve single scholarship details

### Deterministic Rule Engine
- `POST /api/students/{student_id}/match`: Run Python rule engine for a registered student profile
- `POST /api/match`: Run Python rule engine for transient profile payload (no DB save required)

### Bookmarks & Application Tracker
- `GET /api/students/{student_id}/bookmarks`: Retrieve student bookmarked IDs
- `POST /api/students/{student_id}/bookmarks`: Bookmark a scholarship
- `DELETE /api/students/{student_id}/bookmarks/{scholarship_id}`: Remove bookmark
- `GET /api/students/{student_id}/applications`: Retrieve application tracking records
- `POST /api/students/{student_id}/applications`: Create or update application tracking state
- `PUT /api/students/{student_id}/applications/{scholarship_id}`: Update reference number and notes
