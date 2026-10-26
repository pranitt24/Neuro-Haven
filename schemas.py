"""Pydantic models: request validation and response shapes (the API contract)."""
from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class TaskCreate(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=500)

    @field_validator("prompt")
    @classmethod
    def not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("prompt must not be empty")
        return v


class SubtaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    task_id: int
    step_number: int
    description: str
    estimated_minutes: int
    is_completed: bool


class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    original_prompt: str
    is_completed: bool
    created_at: datetime
    subtasks: List[SubtaskOut] = []


class SubtaskUpdate(BaseModel):
    is_completed: bool


class CommunicateRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)
    tone: Literal["polite", "professional", "direct"]

    @field_validator("text")
    @classmethod
    def not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("text must not be empty")
        return v


class CommunicateResponse(BaseModel):
    rewritten: str


class FocusSessionCreate(BaseModel):
    subtask_id: Optional[int] = None
    minutes: int = Field(..., gt=0, le=240)


class FocusSessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    subtask_id: Optional[int] = None
    minutes: int
    completed_at: datetime
