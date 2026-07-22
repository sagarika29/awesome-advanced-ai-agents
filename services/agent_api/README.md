# Agent API

FastAPI service that streams shell-friendly events for OGs of Tech personas.

## Setup

From the repository root:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r services/agent_api/requirements.txt
```

## Run

```bash
set PYTHONPATH=.
uvicorn services.agent_api.main:app --reload --host 0.0.0.0 --port 8000
```

On PowerShell:

```powershell
$env:PYTHONPATH = "."
uvicorn services.agent_api.main:app --reload --host 0.0.0.0 --port 8000
```

## Endpoints

- `GET /health`
- `GET /personas`
- `GET /personas/founder_og`
- `POST /chat` (SSE stream)

### Example chat request

```bash
curl -N -X POST http://localhost:8000/chat ^
  -H "Content-Type: application/json" ^
  -d "{\"persona_id\":\"founder_og\",\"message\":\"Help me build an AI scheduling app\"}"
```
