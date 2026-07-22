import pytest

from agents.core.personas import load_persona
from agents.workflows.founder_scope import run_founder_scope_workflow


@pytest.mark.asyncio
async def test_founder_og_persona_config():
    persona = load_persona("founder_og")
    assert persona.name == "Founder OG"
    assert persona.default_workflow == "scope"


@pytest.mark.asyncio
async def test_founder_scope_workflow_emits_cards():
    events = []
    async for event in run_founder_scope_workflow(
        session_id="test-session",
        persona_id="founder_og",
        message="Help me build an AI app",
    ):
        events.append(event)

    event_types = [event.type.value for event in events]
    assert "status" in event_types
    assert "card" in event_types
    assert "actions" in event_types
    assert event_types[-1] == "done"
