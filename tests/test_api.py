import pytest
from httpx import ASGITransport, AsyncClient

from services.agent_api.main import app


@pytest.mark.asyncio
async def test_health():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_list_personas_includes_founder_og():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/personas")
    assert response.status_code == 200
    personas = response.json()
    assert any(persona["id"] == "founder_og" for persona in personas)


@pytest.mark.asyncio
async def test_chat_streams_cards_for_founder_og():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/chat",
            json={
                "persona_id": "founder_og",
                "message": "Help me build an AI scheduling app",
            },
        )

    assert response.status_code == 200
    body = response.text
    assert "event: session" in body
    assert '"type":"card"' in body
    assert "mvp_scope" in body
    assert '"type":"done"' in body
