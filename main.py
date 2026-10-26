"""FastAPI app: a pure JSON API under /api, plus the built React app if frontend/dist exists."""
import logging
from pathlib import Path
from typing import List

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

import crud
import llm
import models
import schemas
from database import Base, engine, get_db

logging.basicConfig(level=logging.INFO)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Neuro-Haven API", version="1.0.0")

# The Vite proxy normally makes CORS unnecessary; this is insurance if the UI calls port 8000 directly.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "llm": llm.active_provider() or "fallback-only"}


@app.post("/api/tasks", response_model=schemas.TaskOut)
def create_task(payload: schemas.TaskCreate, db: Session = Depends(get_db)):
    title, steps = llm.generate_breakdown(payload.prompt)
    return crud.create_task_with_subtasks(db, payload.prompt, title, steps)


@app.get("/api/tasks", response_model=List[schemas.TaskOut])
def list_tasks(db: Session = Depends(get_db)):
    return crud.list_tasks(db)


@app.patch("/api/subtasks/{subtask_id}", response_model=schemas.SubtaskOut)
def update_subtask(subtask_id: int, payload: schemas.SubtaskUpdate, db: Session = Depends(get_db)):
    subtask = crud.get_subtask(db, subtask_id)
    if subtask is None:
        raise HTTPException(status_code=404, detail="Subtask not found")
    return crud.set_subtask_completed(db, subtask, payload.is_completed)


@app.post("/api/communicate", response_model=schemas.CommunicateResponse)
def communicate(payload: schemas.CommunicateRequest):
    return {"rewritten": llm.rewrite_message(payload.text, payload.tone)}


@app.post("/api/focus-sessions", response_model=schemas.FocusSessionOut)
def log_focus_session(payload: schemas.FocusSessionCreate, db: Session = Depends(get_db)):
    return crud.create_focus_session(db, payload.subtask_id, payload.minutes)


# Serve the production build of the React app (npm run build) if it is there.
# Mounted last so it never shadows /api or /health. HashRouter means no SPA fallback is needed.
_DIST = Path(__file__).parent / "frontend" / "dist"
if _DIST.is_dir():
    app.mount("/", StaticFiles(directory=_DIST, html=True), name="frontend")
