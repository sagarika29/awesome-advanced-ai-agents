# Architecture Blueprint

> For the full design pack, see:
>
> - `docs/architecture-hld.md` — high-level architecture and technology choices
> - `docs/architecture-lld.md` — low-level modules, APIs, sequences, and contracts

## Overview

The repository is organized as a persona operating system:

- a shared **kernel** for agent execution
- persona-specific **policy packs**
- reusable **workflow modules**
- a mobile **shell** that presents results in a Siri-like interaction model

This keeps core execution logic stable while allowing personas and user
experiences to evolve independently.

## High-Level Layers

### 1. Kernel

The kernel is the shared runtime for every persona.

Responsibilities:

- manage request lifecycle
- run plan -> execute -> verify loops
- coordinate tool calls
- expose memory read/write interfaces
- emit trace and UI events
- attach evaluation gates before final output

Suggested location:

```text
agents/core/
```

Core modules:

- `runtime.py` - main execution loop
- `session.py` - conversation/session state
- `planner.py` - planning interface
- `executor.py` - tool/task execution
- `events.py` - event envelope definitions
- `guards.py` - safety and policy enforcement

### 2. Personas

Personas define how the kernel behaves for a given user mode.

Responsibilities:

- system instructions and tone
- enabled workflows
- tool access rules
- clarification strategy
- output card preferences
- evaluation thresholds

Suggested location:

```text
agents/personas/
```

Each persona should be mostly configuration-driven to reduce branching logic in
the runtime.

### 3. Workflows

Workflows are reusable operating modes that a persona can invoke.

Examples:

- plan
- research
- build
- review
- compare
- summarize

Suggested location:

```text
agents/workflows/
```

Each workflow should implement a consistent contract:

- input schema
- preconditions
- execution steps
- success criteria
- UI output mapping

### 4. Tools

Tools are capabilities invoked by workflows through the kernel.

Responsibilities:

- define a stable tool interface
- validate input/output
- isolate side effects
- emit structured execution logs

Suggested location:

```text
agents/tools/
```

### 5. Memory

Memory should be abstracted from the start so the repo can evolve without
rewriting workflow logic.

Memory layers may include:

- short-term conversation memory
- summarized working memory
- long-term persona or project memory
- retrieval-backed knowledge memory

Suggested location:

```text
agents/memory/
```

### 6. Evaluations

Evaluations are first-class. This is required if the repo is intended to be
production-grade.

Responsibilities:

- define outcome quality checks
- measure tool correctness
- track latency and cost
- compare outputs over time
- block or flag low-confidence results

Suggested location:

```text
agents/evals/
```

## Service Boundary

The Python backend should expose a thin service layer between the kernel and the
mobile app.

Suggested location:

```text
services/agent_api/
```

Responsibilities:

- receive user input
- select persona + workflow
- manage auth/session boundaries later
- stream UI-friendly events
- convert internal results into shell-ready response cards

Recommended first implementation:

- a simple HTTP API
- streaming response support
- one endpoint for message handling
- one endpoint for persona metadata

## Mobile Shell Boundary

The React Native app should not know agent internals. It should consume
structured events and render the shell.

Suggested location:

```text
apps/mobile/
```

Responsibilities:

- conversation thread
- persona switching
- transient listening/thinking states
- compact cards and follow-up actions
- streaming partial output

## Shared Contracts

To avoid drift between backend and shell, define shared contracts early.

Suggested location:

```text
shared/contracts/
```

Recommended contracts:

- persona metadata
- message request envelope
- event envelope
- card schema
- quick action schema
- error schema

## Design Principles

1. Keep personas data-driven where possible.
2. Keep workflows reusable across personas.
3. Keep the shell decoupled from execution internals.
4. Treat evaluations as part of the execution path, not as optional extras.
5. Prefer modular contracts over persona-specific branching in the kernel.
