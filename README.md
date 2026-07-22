# awesome-advanced-ai-agents

Production-grade building blocks for advanced AI agents, organized as a
**persona operating system** with a Siri-like mobile shell.

Meet the **OGs of Tech** — experienced operator personas like **Founder OG**
that shape how the system plans, responds, and guides you.

## Vision

This repository is designed as a persona OS:

- a shared Python agent kernel for planning, tools, memory, and evaluation
- **OGs of Tech** persona policy packs that change how the system behaves
- workflow modules that turn each OG into a repeatable operating model
- a React Native shell that feels lightweight, conversational, and Siri-like

## Current OG

- **Founder OG** — scopes MVPs, suggests next steps, and offers quick follow-ups

Coming soon: **Engineer OG**, **Researcher OG**

## Quickstart

### 1. Start the API

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r services/agent_api/requirements.txt
$env:PYTHONPATH = "."
uvicorn services.agent_api.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Start the mobile shell

```powershell
cd apps/mobile
npm install
npm run start
```

For Android emulator, the app defaults to `http://10.0.2.2:8000`.
Override with `EXPO_PUBLIC_API_URL` if needed.

### 3. Try Founder OG in the browser

Open [http://localhost:8000](http://localhost:8000) and ask:

> Help me build an AI scheduling app for busy founders.

You should see streamed status updates, compact cards, and quick actions like
**Trim to MVP** and **Estimate effort**.

### Optional: Expo mobile / web shell

```powershell
cd apps/mobile
npm install --legacy-peer-deps
$env:EXPO_PUBLIC_API_URL = "http://localhost:8000"
npm run web
```

## Repository Shape

```text
awesome-advanced-ai-agents/
  apps/mobile/              React Native shell
  services/agent_api/       FastAPI streaming service
  agents/
    core/                   kernel runtime
    personas/               OG configs (founder_og.json)
    workflows/              persona workflows
  shared/contracts/         JSON schemas
  tests/
```

## Docs

- `docs/architecture-hld.md` - high-level architecture + technology stack
- `docs/architecture-lld.md` - low-level modules, APIs, sequences, contracts
- `docs/architecture.md` - original blueprint / layer overview
- `docs/personas.md` - OGs of Tech definitions and workflows
- `docs/ui-shell.md` - Siri-like mobile experience and event contract
- `docs/roadmap.md` - phased execution plan

## Status

Minimum working slice is live for **Founder OG**.
