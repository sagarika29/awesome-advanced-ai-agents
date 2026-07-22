# High-Level Architecture Design

## 1. Purpose

This document describes the system architecture of **awesome-advanced-ai-agents**
as a **persona operating system** with:

- a Python agent kernel
- **OGs of Tech** persona policy packs
- workflow-driven execution
- a Siri-like React Native mobile shell

The first implemented slice is **Founder OG**.

## 2. System Context

```text
┌──────────────────────┐         HTTPS / SSE          ┌──────────────────────────┐
│  Mobile Shell        │ ───────────────────────────► │  Agent API               │
│  Expo + React Native │ ◄─────────────────────────── │  FastAPI + Uvicorn       │
│  (Siri-like UX)      │     ShellEvent stream        │  (Python 3.11+)          │
└──────────────────────┘                              └────────────┬─────────────┘
                                                                   │
                                                                   ▼
                                                      ┌──────────────────────────┐
                                                      │  Persona OS Kernel       │
                                                      │  agents/core + workflows │
                                                      │  + OGs of Tech packs     │
                                                      └──────────────────────────┘
```

### Actors

| Actor | Role |
| --- | --- |
| End user | Interacts with Founder OG through the mobile shell |
| Founder OG | Persona policy that shapes tone, cards, and follow-ups |
| Agent API | HTTP/SSE boundary between UI and kernel |
| Kernel | Shared runtime for sessions, persona loading, workflow routing |

## 3. Technology Stack

| Layer | Technology | Why |
| --- | --- | --- |
| Mobile shell | **Expo ~52 + React Native 0.76 + TypeScript** | Cross-platform Siri-like UI with fast iteration |
| API gateway | **FastAPI + Uvicorn** | Async HTTP, OpenAPI docs, native SSE streaming |
| Contracts | **Pydantic v2 + JSON Schema** | Typed request/response and shared event envelopes |
| Kernel runtime | **Python 3.11+ asyncio** | Natural fit for agent orchestration and evals |
| Persona packs | **JSON configs** | Data-driven OGs without hardcoding UI logic |
| Testing | **pytest + pytest-asyncio + httpx** | Async API and workflow regression coverage |
| Transport | **Server-Sent Events (SSE)** | Lightweight streaming of status/cards/actions |
| Local packaging | **venv + pip / npm** | Simple monorepo developer setup |

### Deliberately deferred (future)

| Capability | Likely technology |
| --- | --- |
| LLM provider | OpenAI / Anthropic / local model adapter |
| Persistent memory | Postgres + vector store (e.g. pgvector) |
| Auth | JWT / OAuth2 |
| Observability | OpenTelemetry + structured logs |
| CI | GitHub Actions |

## 4. Architectural Style

The system uses a **layered + event-driven** style:

1. **Presentation layer** — React Native shell
2. **API layer** — FastAPI service
3. **Domain/kernel layer** — persona OS runtime
4. **Policy/config layer** — OG persona JSON packs
5. **Workflow layer** — executable operating modes
6. **Contract layer** — shared schemas between backend and UI

Key architectural choices:

- **Persona OS metaphor:** one kernel, many OG policy packs
- **Shell/event contract:** UI never depends on internal agent steps
- **Workflow registry:** personas map to named runners
- **Streaming-first UX:** status and cards arrive incrementally

## 5. Logical Building Blocks

### 5.1 Mobile Shell (`apps/mobile`)

Responsibilities:

- render conversation thread
- show Founder OG branding and status
- parse SSE events into cards and quick actions
- send chat messages and follow-up `action_id`s

Primary tech:

- Expo / React Native
- TypeScript contracts in `src/types/contracts.ts`
- Fetch + ReadableStream SSE client with text fallback

### 5.2 Agent API (`services/agent_api`)

Responsibilities:

- expose `/health`, `/personas`, `/chat`
- validate requests with Pydantic
- stream `ShellEvent` objects as SSE
- keep CORS open for local Expo clients

Primary tech:

- FastAPI
- Uvicorn ASGI server
- `StreamingResponse(media_type="text/event-stream")`

### 5.3 Kernel (`agents/core`)

Responsibilities:

- load OG persona configs
- create/reuse sessions
- route to workflow runners
- define typed event models

Primary modules:

- `events.py` — `ShellEvent`, `ChatRequest`, `PersonaOG`
- `personas.py` — load/list JSON personas
- `session.py` — in-memory session store
- `runtime.py` — chat orchestration entrypoint

### 5.4 OGs of Tech (`agents/personas`)

Current pack:

- `founder_og.json`

Each OG defines:

- identity and tagline
- default workflow
- enabled workflows
- preferred card types
- tone/policy metadata

### 5.5 Workflows (`agents/workflows`)

Current workflow:

- `founder_scope.py` → key `founder_og:scope`

Emits:

- `status`
- `message_delta`
- `card`
- `actions`
- `done`

### 5.6 Shared Contracts (`shared/contracts`)

Source of truth for cross-language shapes:

- `events.schema.json`
- `persona.schema.json`

Mirrored in:

- Python: `agents/core/events.py`
- TypeScript: `apps/mobile/src/types/contracts.ts`

## 6. High-Level Request Flow

```text
User message
   │
   ▼
React Native ChatScreen
   │  POST /chat { persona_id, message, session_id? }
   ▼
FastAPI chat endpoint
   │
   ▼
runtime.handle_chat()
   │  load Founder OG
   │  get/create Session
   │  resolve workflow key founder_og:scope
   ▼
run_founder_scope_workflow()
   │  yield ShellEvents
   ▼
SSE stream to mobile
   │
   ▼
UI renders status → text → cards → actions
```

## 7. Quality Attributes

| Attribute | Current approach |
| --- | --- |
| Extensibility | Add OG JSON + workflow runner without rewriting shell |
| Decoupling | UI consumes events, not agent internals |
| Testability | Kernel and API covered by pytest |
| Latency UX | Streaming statuses/cards reduce perceived wait |
| Portability | Expo targets iOS/Android/web |
| Simplicity (v1) | In-memory sessions, deterministic Founder OG workflow |

## 8. Current vs Target State

### Current (v0.1)

- Founder OG only
- Deterministic scope workflow (no live LLM yet)
- In-memory sessions
- Expo chat shell with cards + actions
- SSE chat endpoint

### Target

- Engineer OG / Researcher OG
- Real LLM-backed planning/tool use
- Persistent memory and eval gates
- Auth, tracing, CI, deployment profiles

## 9. Related Documents

- `docs/architecture-lld.md` — low-level design
- `docs/personas.md` — OG definitions
- `docs/ui-shell.md` — shell interaction model
- `docs/roadmap.md` — phased delivery plan
