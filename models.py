"""SQLAlchemy table definitions."""
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    original_prompt = Column(Text, nullable=False)
    is_completed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.now, nullable=False)

    subtasks = relationship(
        "Subtask",
        back_populates="task",
        cascade="all, delete-orphan",
        order_by="Subtask.step_number",
    )


class Subtask(Base):
    __tablename__ = "subtasks"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    step_number = Column(Integer, nullable=False)
    description = Column(Text, nullable=False)
    estimated_minutes = Column(Integer, nullable=False)
    is_completed = Column(Boolean, default=False, nullable=False)

    task = relationship("Task", back_populates="subtasks")


class FocusSession(Base):
    """Optional: a finished Pomodoro, linked to the step it was for."""

    __tablename__ = "focus_sessions"

    id = Column(Integer, primary_key=True, index=True)
    subtask_id = Column(Integer, ForeignKey("subtasks.id", ondelete="SET NULL"), nullable=True)
    minutes = Column(Integer, nullable=False)
    completed_at = Column(DateTime, default=datetime.now, nullable=False)
