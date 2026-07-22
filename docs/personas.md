# Personas — OGs of Tech

## Overview

An **OG of Tech** is a persona policy pack that changes how the shared kernel
behaves. Each OG brings a distinct operating style — like having a seasoned
operator in your pocket.

The UI shell stays consistent. The OG changes the tone, cards, workflows, and
follow-up actions.

## Active OGs

### Founder OG

Primary goal:

- help prototype and validate an AI-first idea quickly

Tagline:

- **Ship fast, learn faster.**

Behavior profile:

- concise
- opportunity-oriented
- action-biased
- practical

Default workflows:

- scope
- prototype
- refine
- summarize

Typical output cards:

- MVP scope
- next 3 steps
- feature trade-offs
- rough effort view
- launch checklist

Quick actions:

- Trim to MVP
- Estimate effort
- Draft launch steps

## Upcoming OGs

### Engineer OG

Primary goal:

- help build reliable, production-ready systems

### Researcher OG

Primary goal:

- compare strategies and analyze agent behavior systematically

## Persona Data Model

Each persona can be represented as configuration plus optional custom handlers.

Suggested shape:

```json
{
  "id": "founder_og",
  "name": "Founder OG",
  "tagline": "Ship fast, learn faster.",
  "description": "Scopes MVPs and validates ideas before you overbuild",
  "tone": "concise, opportunity-oriented, action-biased",
  "default_workflow": "scope",
  "enabled_workflows": ["scope", "prototype", "refine", "summarize"],
  "card_preferences": ["mvp_scope", "next_steps", "trade_offs"]
}
```

## Workflow Selection

Workflows should be selectable in two ways:

1. explicit user intent
2. persona defaults inferred from message type

Example:

- "Help me build this feature" -> Engineer OG + build workflow
- "What should I ship first?" -> Founder OG + scope workflow
- "Compare these agent setups" -> Researcher OG + compare workflow

## Persona-Specific Follow-Up Actions

Quick actions are part of the persona experience.

Examples:

### Engineer OG

- Run tests
- Add evals
- Refine plan
- Surface risks

### Founder OG

- Trim to MVP
- Estimate effort
- Draft launch steps
- Improve positioning

### Researcher OG

- Run baseline
- Compare variants
- Export report
- List confounders

## Future OGs

Once the contract is stable, additional OGs can be added, for example:

- Product Manager OG
- Operator OG
- Support Analyst OG
- Security Reviewer OG
- Learning Coach OG

These should reuse the same kernel and shell, while only changing policy and
workflow behavior.
