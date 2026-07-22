# Low-Level Architecture Design

## 1. Purpose

This document details module boundaries, data models, APIs, sequence flows, and
technology-specific implementation choices for the current Founder OG vertical
slice.

## 2. Repository Topology

```text
awesome-advanced-ai-agents/
├── apps/mobile/                      # Expo React Native shell
│   ├── App.tsx
│   └── src/
│       ├── api/client.ts             # SSE client
│       ├── components/               # StatusPill, CardView, ActionRow
│       ├── screens/ChatScreen.tsx
│       └── types/contracts.ts
├── services/agent_api/
│   ├── main.py                       # FastAPI app
│   └── requirements.txt
├── agents/
│   ├── core/
│   │   ├── events.py                 # Pydantic models
│   │   ├── personas.py               # persona loader
│   │   ├── session.py                # in-memory sessions
│   │   └── runtime.py                # chat orchestration
│   ├── personas/
│   │   └── founder_og.json
│   └── workflows/
│       └── founder_scope.py
├── shared/contracts/
│   ├── events.schema.json
│   └── persona.schema.json
└── tests/
    ├── test_api.py
    └── test_founder_og.py
```

## 3. Technology Details by Module

### 3.1 Mobile shell

| Concern | Choice |
| --- | --- |
| Runtime | Expo SDK ~52 |
| UI framework | React Native 0.76 |
| Language | TypeScript (strict) |
| Entry | `App.tsx` → `ChatScreen` |
| Networking | `fetch` + SSE parsing |
| Config | `EXPO_PUBLIC_API_URL` |
| Default API host | iOS/web: `localhost:8000`; Android emulator: `10.0.2.2:8000` |

Key files:

- `src/api/client.ts`
  - `fetchPersonas()`
  - `streamChat()` with ReadableStream path + `response.text()` fallback
- `src/screens/ChatScreen.tsx`
  - local React state for messages, status, session, errors
  - maps SSE events into assistant message cards/actions
- `src/components/*`
  - presentational UI only

### 3.2 Agent API

| Concern | Choice |
| --- | --- |
| Framework | FastAPI |
| Server | Uvicorn (`uvicorn[standard]`) |
| Validation | Pydantic v2 models |
| Streaming | `StreamingResponse` + SSE framing |
| CORS | permissive (`*`) for local Expo |
| Port | `8000` |

Endpoints:

| Method | Path | Behavior |
| --- | --- | --- |
| `GET` | `/health` | liveness |
| `GET` | `/personas` | list OG packs |
| `GET` | `/personas/{persona_id}` | single OG pack |
| `POST` | `/chat` | stream Founder OG workflow events |

### 3.3 Kernel

| Concern | Choice |
| --- | --- |
| Language | Python 3.11+ |
| Async model | `async` generators for event streams |
| Models | Pydantic `BaseModel` / `Enum` |
| Persona storage | filesystem JSON |
| Session storage | process-local dict (`SessionStore`) |
| Workflow dispatch | string registry `persona:workflow` |

## 4. Core Data Models

### 4.1 `ShellEvent`

Python: `agents/core/events.py`  
Schema: `shared/contracts/events.schema.json`

```text
ShellEvent
├── type: status | message_delta | card | actions | tool_activity | citation | error | done
├── session_id: string
├── persona_id: string
└── payload: object
```

SSE serialization:

```text
data: {"type":"card","session_id":"...","persona_id":"founder_og","payload":{...}}\n\n
```

### 4.2 `ChatRequest`

```text
ChatRequest
├── session_id?: string
├── persona_id: string = "founder_og"
├── message: string
└── action_id?: string
```

### 4.3 `PersonaOG`

Loaded from `agents/personas/*.json`.

Founder OG fields used now:

- `id`, `name`, `tagline`, `description`
- `tone`
- `default_workflow`
- `enabled_workflows`
- `card_preferences`

### 4.4 `Session`

```text
Session
├── id: uuid4 string
├── persona_id: string
└── messages: [{role, content}]
```

`SessionStore` is in-memory and non-durable across process restarts.

## 5. Component Collaboration

```text
ChatScreen
   │ uses
   ▼
api/client.streamChat()
   │ HTTP POST /chat
   ▼
services.agent_api.main.chat()
   │ calls
   ▼
agents.core.runtime.handle_chat()
   ├── personas.load_persona()
   ├── session_store.get_or_create()
   └── WORKFLOW_RUNNERS["founder_og:scope"]
            │
            ▼
     founder_scope.run_founder_scope_workflow()
            │ yields ShellEvent
            ▼
     StreamingResponse (SSE)
```

## 6. Sequence Design

### 6.1 First chat turn

```text
Mobile                         API                         Kernel/Workflow
  |                             |                               |
  | POST /chat                  |                               |
  | {persona_id, message}       |                               |
  |---------------------------->|                               |
  |                             | handle_chat()                 |
  |                             |------------------------------>|
  |                             | create session + run workflow |
  | event: session              |<------------------------------|
  |<----------------------------|                               |
  | data: status                |                               |
  | data: message_delta         |                               |
  | data: card (xN)             |                               |
  | data: actions               |                               |
  | data: done                  |                               |
  |<----------------------------|                               |
```

### 6.2 Quick-action follow-up

```text
Mobile                         API                         Workflow
  |                             |                               |
  | POST /chat                  |                               |
  | {session_id, action_id}     |                               |
  |---------------------------->| run_founder_scope_workflow()  |
  |                             |------------------------------>|
  | cards for trim/estimate/... |                               |
  |<----------------------------|<------------------------------|
```

Supported `action_id` values today:

- `trim_mvp`
- `estimate_effort`
- `launch_steps`

## 7. Workflow Internals (Founder OG Scope)

File: `agents/workflows/founder_scope.py`

Execution steps:

1. Emit `status` (`thinking`)
2. Short async delay (UX pacing)
3. If `action_id` present → build action-specific cards
4. Else → build default MVP scope cards from message text
5. Emit `message_delta`
6. Emit one or more `card` events
7. Emit `actions`
8. Emit `done`

Card types currently produced:

- `mvp_scope`
- `next_steps`
- `trade_offs`
- `metric_snapshot`
- `checklist`
- `summary`

## 8. API Event Contract (Wire Format)

### Status

```json
{
  "type": "status",
  "session_id": "uuid",
  "persona_id": "founder_og",
  "payload": { "state": "thinking", "label": "Founder OG is scoping your MVP" }
}
```

### Card

```json
{
  "type": "card",
  "session_id": "uuid",
  "persona_id": "founder_og",
  "payload": {
    "card_type": "next_steps",
    "title": "Next 3 moves",
    "body": ["...", "...", "..."]
  }
}
```

### Actions

```json
{
  "type": "actions",
  "session_id": "uuid",
  "persona_id": "founder_og",
  "payload": {
    "items": [
      { "id": "trim_mvp", "label": "Trim to MVP" },
      { "id": "estimate_effort", "label": "Estimate effort" },
      { "id": "launch_steps", "label": "Draft launch steps" }
    ]
  }
}
```

## 9. Error Handling

| Layer | Behavior |
| --- | --- |
| API validation | HTTP 400 if neither `message` nor `action_id` |
| Unknown persona | HTTP 404 from persona loader |
| Unregistered workflow | HTTP 400 (`ValueError`) |
| Mobile network/API failure | UI error text in `ChatScreen` |
| Missing stream reader | Mobile falls back to full-body SSE parse |

## 10. Testing Architecture

| Test file | Scope | Tech |
| --- | --- | --- |
| `tests/test_founder_og.py` | persona load + workflow event sequence | pytest-asyncio |
| `tests/test_api.py` | `/health`, `/personas`, `/chat` SSE body | httpx ASGITransport |

Pytest config (`pytest.ini`):

- `asyncio_mode = auto`
- `pythonpath = .`

## 11. Runtime Deployment View (Local Dev)

```text
Developer Machine
├── Terminal A
│   └── uvicorn services.agent_api.main:app --reload --port 8000
└── Terminal B
    └── expo start (apps/mobile)
         ├── iOS simulator → localhost:8000
         ├── Android emulator → 10.0.2.2:8000
         └── device → EXPO_PUBLIC_API_URL=http://<lan-ip>:8000
```

Process characteristics:

- single API process
- no external DB
- no message broker
- no auth middleware
- no LLM network dependency yet

## 12. Extension Points (Low-Level)

To add a new OG with minimal churn:

1. Add `agents/personas/<og_id>.json`
2. Implement `agents/workflows/<workflow>.py` as async event generator
3. Register in `agents/core/runtime.py` under `"<og_id>:<workflow>"`
4. Reuse existing `/chat` and mobile event renderer
5. Add pytest coverage for pack + workflow + API path

To introduce a real LLM later:

1. Keep `ShellEvent` contract unchanged
2. Replace deterministic card builders with planner/tool loop inside workflow
3. Emit the same `status/card/actions/done` events
4. Add provider adapters under `agents/tools/` or `agents/core/providers/`

## 13. Non-Goals for Current LLD

- durable session persistence
- multi-tenant auth
- production observability stack
- multi-agent orchestration
- voice I/O pipeline

These are intentionally out of scope for the Founder OG minimum slice.
