"""Database operations / business logic. No HTTP and no LLM code in here."""
from typing import Dict, List, Optional

from sqlalchemy.orm import Session

import models


def create_task_with_subtasks(db: Session, prompt: str, title: str, steps: List[Dict]) -> models.Task:
    """Create a task and all its subtasks in a single transaction."""
    task = models.Task(title=title, original_prompt=prompt)
    for number, step in enumerate(steps, start=1):
        task.subtasks.append(
            models.Subtask(
                step_number=number,
                description=step["description"],
                estimated_minutes=step["estimated_minutes"],
            )
        )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def list_tasks(db: Session) -> List[models.Task]:
    """All tasks, newest first."""
    return db.query(models.Task).order_by(models.Task.created_at.desc(), models.Task.id.desc()).all()


def get_subtask(db: Session, subtask_id: int) -> Optional[models.Subtask]:
    return db.get(models.Subtask, subtask_id)


def set_subtask_completed(db: Session, subtask: models.Subtask, is_completed: bool) -> models.Subtask:
    """Tick/untick a step, and keep the parent task's completed flag in sync."""
    subtask.is_completed = is_completed
    task = subtask.task
    task.is_completed = all(s.is_completed for s in task.subtasks)
    db.commit()
    db.refresh(subtask)
    return subtask


def create_focus_session(db: Session, subtask_id: Optional[int], minutes: int) -> models.FocusSession:
    # If the step no longer exists, still log the session instead of failing.
    if subtask_id is not None and db.get(models.Subtask, subtask_id) is None:
        subtask_id = None
    session = models.FocusSession(subtask_id=subtask_id, minutes=minutes)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session
