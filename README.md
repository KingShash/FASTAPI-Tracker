# FASTAPI-Tracker

A full-stack item tracker built with **FastAPI**, **PostgreSQL**, and **React**.

## Features

- ✅ Create, read, update and delete tracked items
- 🏷️ Priority levels: low, medium, high
- ☑️ Mark items as completed
- 🔍 Filter by status (pending / completed) and priority
- 🐳 Docker Compose for one-command startup

---

## Tech Stack

| Layer    | Technology                    |
|----------|-------------------------------|
| Frontend | React 19 + Vite               |
| Backend  | FastAPI (Python 3.12)         |
| Database | PostgreSQL 16                 |
| ORM      | SQLAlchemy 2                  |
| Styling  | Plain CSS (no framework)      |
| Deploy   | Docker + Docker Compose       |

---

## Quick Start (Docker)

```bash
# Clone the repo
git clone https://github.com/KingShash/FASTAPI-Tracker.git
cd FASTAPI-Tracker

# Start all services
docker compose up --build
```

| Service  | URL                      |
|----------|--------------------------|
| Frontend | http://localhost:3000    |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

---

## Local Development

### Backend

```bash
cd backend
pip install -r requirements.txt

# Create a .env file (copy .env.example and set your DB URL)
cp .env.example .env

# Start the API server
uvicorn main:app --reload
```

Run backend tests:

```bash
pytest test_main.py -v
```

> Tests use SQLite so no PostgreSQL instance is needed.

### Frontend

```bash
cd frontend
npm install

# Copy and configure environment
cp .env.example .env.local  # Set VITE_API_URL if needed

npm run dev
```

The React app will be available at http://localhost:5173.

---

## API Reference

| Method | Endpoint          | Description          |
|--------|-------------------|----------------------|
| GET    | `/items`          | List all items       |
| POST   | `/items`          | Create a new item    |
| GET    | `/items/{id}`     | Get a single item    |
| PUT    | `/items/{id}`     | Update an item       |
| DELETE | `/items/{id}`     | Delete an item       |

Query parameters for `GET /items`:
- `completed=true|false` — filter by completion status
- `priority=low|medium|high` — filter by priority
- `skip` / `limit` — pagination

Interactive API docs: http://localhost:8000/docs

---

## Project Structure

```
.
├── backend/
│   ├── main.py          # FastAPI app & routes
│   ├── models.py        # SQLAlchemy ORM models
│   ├── schemas.py       # Pydantic request/response schemas
│   ├── crud.py          # Database CRUD helpers
│   ├── database.py      # DB connection & session
│   ├── test_main.py     # API tests (pytest)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Root component & state
│   │   ├── api.js           # Fetch wrapper
│   │   └── components/
│   │       ├── ItemCard.jsx  # Single item display & edit
│   │       └── ItemForm.jsx  # Add / edit form
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```
