from __future__ import annotations

from collections.abc import AsyncIterator

from agents.core.events import ShellEvent
from agents.core.personas import load_persona
from agents.core.session import Session, SessionStore
from agents.workflows.founder_scope import run_founder_scope_workflow

session_store = SessionStore()

WORKFLOW_RUNNERS = {
    "founder_og:scope": run_founder_scope_workflow,
}


async def handle_chat(
    session_id: str | None,
    persona_id: str,
    message: str,
    action_id: str | None = None,
) -> tuple[Session, AsyncIterator[ShellEvent]]:
    persona = load_persona(persona_id)
    session = session_store.get_or_create(session_id, persona_id)

    if message:
        session.add_message("user", message)

    workflow_key = f"{persona.id}:{persona.default_workflow}"
    runner = WORKFLOW_RUNNERS.get(workflow_key)
    if runner is None:
        raise ValueError(f"No workflow registered for {workflow_key}")

    events = runner(session.id, persona.id, message, action_id)
    return session, events
