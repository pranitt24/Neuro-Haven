# Neuro-Haven

Adaptive, cognitive-assistive web app for neurodivergent users: AI task breakdown with time estimates,
focus sessions with ambient sound, a calm companion, Calm Mode and a dyslexia-friendly font.

## Backend (FastAPI + SQLite)

```bash
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env               # Windows: copy .env.example .env
# open .env and paste ONE key (GROQ_API_KEY or GEMINI_API_KEY)

uvicorn main:app --reload
```

- API docs: http://127.0.0.1:8000/docs
- Health check (also shows which LLM is active): http://127.0.0.1:8000/health
  - `"llm": "groq"` or `"gemini"` means your key was picked up.
  - `"llm": "fallback-only"` means no key was found; the app still works with built-in logic.

## Frontend (React + Vite), in `frontend/`

```bash
cd frontend
npm install
npm run dev        # open http://localhost:5173  (it proxies /api to port 8000)
```

## Tests

```bash
pytest
```

## Layers

`main.py` (routes) → `schemas.py` (validation) → `crud.py` (DB logic) → `models.py` (tables) → `database.py` (engine).
`llm.py` holds all LLM calls plus a built-in fallback, so the app keeps working if the API is down.

## API

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/tasks` | `{prompt}` → task with 3-5 subtasks |
| GET | `/api/tasks` | all tasks, newest first |
| PATCH | `/api/subtasks/{id}` | `{is_completed}` |
| POST | `/api/communicate` | `{text, tone}` → `{rewritten}` |
| POST | `/api/focus-sessions` | `{subtask_id?, minutes}` |
