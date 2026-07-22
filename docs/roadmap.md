# Roadmap

## Guiding Principle

Build one strong vertical slice before expanding breadth.

The first milestone should prove:

- the persona operating system model
- the Python kernel boundary
- the React Native shell contract
- at least one compelling end-to-end user flow

## Phase 0: Definition

Goal:

- align the repo around a clear product shape

Outputs:

- rewritten README
- architecture blueprint
- persona definitions
- shell interaction contract
- staged roadmap

Success criteria:

- repo direction is understandable without tribal knowledge
- contributors can see where code should live

## Phase 1: Core Skeleton

Goal:

- establish the minimum code architecture

Outputs:

- `agents/core/` skeleton
- `agents/personas/` starter configs
- `agents/workflows/` initial workflow interfaces
- `services/agent_api/` starter service
- `shared/contracts/` initial schemas
- `apps/mobile/` React Native app scaffold

Success criteria:

- mobile shell can send one request and receive one structured response
- one persona can be selected explicitly

## Phase 2: First Vertical Slice

Goal:

- prove the system with one persona and one workflow

Recommended initial slice:

- **Founder** persona
- **scope/prototype** workflow

Why:

- fastest path to demonstrating product value
- easiest to show in a mobile shell
- can later be hardened for Engineer and extended for Researcher

Outputs:

- one complete backend request path
- one mobile conversation screen
- thinking status + compact cards
- quick follow-up actions

Success criteria:

- user can ask for help and receive persona-shaped cards
- one follow-up action can chain into a second response

## Phase 3: Reliability Layer

Goal:

- make the system trustworthy and maintainable

Outputs:

- basic tests
- evaluation harness
- logging/tracing
- config management
- error handling and retry behavior

Success criteria:

- outputs are measurable
- regressions can be detected
- failures are inspectable

## Phase 4: Multi-Persona Expansion

Goal:

- add depth without rewriting the kernel

Outputs:

- Engineer persona
- Researcher persona
- reusable workflow composition
- role-specific card templates

Success criteria:

- personas share infrastructure but differ in behavior
- shell can switch personas cleanly

## Phase 5: Advanced Capabilities

Goal:

- evolve from a structured assistant into an extensible agent platform

Possible additions:

- long-term memory backends
- benchmark suites
- multi-agent coordination
- voice input/output
- personalization
- deployment examples
- dashboard or web companion

## Recommended Order of Work

1. Finalize repo docs and structure.
2. Scaffold backend, contracts, and mobile shell.
3. Implement one persona and one workflow.
4. Add tests and evals before multiplying demos.
5. Expand personas and capabilities after the first slice is stable.

## Non-Goals for v1

Avoid these too early:

- too many personas
- too many demos
- full marketplace/plugin systems
- deep memory infrastructure before workflows are proven
- overbuilt authentication/admin layers before the core UX is validated
