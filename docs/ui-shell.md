# UI Shell

## Goal

The mobile shell should feel like a lightweight Siri-style assistant while
running on top of a structured persona operating system.

This means the interface should be:

- conversational
- compact
- interruptible
- action-oriented
- visually calm

The shell should not expose backend complexity directly. It should translate
agent activity into a clean, mobile-first experience.

## Interaction Model

The shell experience should center on a single conversation thread with transient
states and compact result cards.

Primary states:

- idle
- listening
- thinking
- responding
- waiting for user action
- error

The shell can feel Siri-like without imitating Siri literally. The design goal
is low-friction, voice-adjacent, and concise.

## Core UI Elements

### Conversation Thread

- user messages
- assistant messages
- streamed partial output
- compact summaries instead of long paragraphs by default

### Persona Switcher

- lets the user switch between Engineer, Founder, and Researcher
- should clearly indicate the current mode
- may optionally explain how the mode changes behavior

### Status Layer

Use ephemeral statuses such as:

- Listening
- Thinking
- Checking tools
- Verifying result

These statuses should disappear once the final card set is rendered.

### Result Cards

Instead of always returning plain text, the shell should render typed cards.

Suggested card types:

- plan
- checklist
- summary
- risks
- comparison
- next_steps
- metric_snapshot
- error

### Quick Actions

Each response should optionally include persona-aware follow-up actions.

Examples:

- Refine plan
- Trim to MVP
- Run baseline
- Add tests

## Backend Event Contract

The Python backend should stream shell-friendly events instead of raw internal
state.

Suggested event envelope:

```json
{
  "type": "card",
  "session_id": "abc123",
  "persona_id": "founder",
  "payload": {}
}
```

Suggested event types:

- `status`
- `message_delta`
- `card`
- `actions`
- `tool_activity`
- `citation`
- `error`
- `done`

## Example Events

### Status Event

```json
{
  "type": "status",
  "session_id": "abc123",
  "persona_id": "engineer",
  "payload": {
    "state": "thinking",
    "label": "Reviewing architecture"
  }
}
```

### Card Event

```json
{
  "type": "card",
  "session_id": "abc123",
  "persona_id": "founder",
  "payload": {
    "card_type": "next_steps",
    "title": "Recommended next steps",
    "body": [
      "Define one narrow MVP workflow",
      "Test with five users",
      "Measure response latency and drop-off"
    ]
  }
}
```

### Actions Event

```json
{
  "type": "actions",
  "session_id": "abc123",
  "persona_id": "researcher",
  "payload": {
    "items": [
      { "id": "run_baseline", "label": "Run baseline" },
      { "id": "compare_variants", "label": "Compare variants" }
    ]
  }
}
```

## API Surface

Suggested minimal API:

- `POST /sessions`
- `POST /chat`
- `GET /personas`

Optional later additions:

- `POST /actions`
- `GET /history/:session_id`
- `POST /voice/transcribe`

## Design Rules

1. Default to concise responses.
2. Use cards for structured output.
3. Keep long explanations collapsible.
4. Make follow-up actions easy to trigger.
5. Render uncertainty clearly when the backend is not confident.
6. Preserve the same shell while letting personas change content and behavior.

## First Mobile Slice

For v1, the app only needs:

- one chat screen
- one persona switcher
- status indicator
- three card types
- one quick action row
- streaming text support

That is enough to validate the shell concept before investing in richer motion,
voice, or native platform polish.
