from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles

from agents.core.events import ChatRequest
from agents.core.personas import list_personas, load_persona
from agents.core.runtime import handle_chat

STATIC_DIR = Path(__file__).resolve().parent / "static"

app = FastAPI(title="Awesome Advanced AI Agents API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/")
async def web_shell() -> FileResponse:
    index = STATIC_DIR / "index.html"
    if not index.exists():
        raise HTTPException(status_code=404, detail="Web shell not found")
    return FileResponse(index)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/personas")
async def get_personas() -> list[dict]:
    return [persona.model_dump() for persona in list_personas()]


@app.get("/personas/{persona_id}")
async def get_persona(persona_id: str) -> dict:
    try:
        return load_persona(persona_id).model_dump()
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.post("/chat")
async def chat(request: ChatRequest) -> StreamingResponse:
    if not request.message and not request.action_id:
        raise HTTPException(status_code=400, detail="message or action_id is required")

    try:
        session, events = await handle_chat(
            session_id=request.session_id,
            persona_id=request.persona_id,
            message=request.message,
            action_id=request.action_id,
        )
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    async def event_stream():
        yield f"event: session\ndata: {session.id}\n\n"
        async for event in events:
            yield event.to_sse()

    return StreamingResponse(event_stream(), media_type="text/event-stream")
