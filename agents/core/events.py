from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class EventType(str, Enum):
    STATUS = "status"
    MESSAGE_DELTA = "message_delta"
    CARD = "card"
    ACTIONS = "actions"
    TOOL_ACTIVITY = "tool_activity"
    CITATION = "citation"
    ERROR = "error"
    DONE = "done"


class ShellEvent(BaseModel):
    type: EventType
    session_id: str
    persona_id: str
    payload: dict[str, Any] = Field(default_factory=dict)

    def to_sse(self) -> str:
        return f"data: {self.model_dump_json()}\n\n"


class PersonaOG(BaseModel):
    id: str
    name: str
    tagline: str
    description: str
    tone: str = "practical"
    default_workflow: str
    enabled_workflows: list[str] = Field(default_factory=list)
    card_preferences: list[str] = Field(default_factory=list)


class ChatRequest(BaseModel):
    session_id: str | None = None
    persona_id: str = "founder_og"
    message: str
    action_id: str | None = None


class ChatResponse(BaseModel):
    session_id: str
    persona_id: str
