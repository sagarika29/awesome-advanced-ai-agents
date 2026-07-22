from __future__ import annotations

import uuid
from dataclasses import dataclass, field


@dataclass
class Session:
    id: str
    persona_id: str
    messages: list[dict[str, str]] = field(default_factory=list)

    def add_message(self, role: str, content: str) -> None:
        self.messages.append({"role": role, "content": content})


class SessionStore:
    def __init__(self) -> None:
        self._sessions: dict[str, Session] = {}

    def create(self, persona_id: str) -> Session:
        session = Session(id=str(uuid.uuid4()), persona_id=persona_id)
        self._sessions[session.id] = session
        return session

    def get(self, session_id: str) -> Session | None:
        return self._sessions.get(session_id)

    def get_or_create(self, session_id: str | None, persona_id: str) -> Session:
        if session_id and session_id in self._sessions:
            return self._sessions[session_id]
        return self.create(persona_id)
