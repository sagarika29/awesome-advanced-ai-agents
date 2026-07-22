from __future__ import annotations

import asyncio
from collections.abc import AsyncIterator

from agents.core.events import EventType, ShellEvent


def _status(session_id: str, persona_id: str, state: str, label: str) -> ShellEvent:
    return ShellEvent(
        type=EventType.STATUS,
        session_id=session_id,
        persona_id=persona_id,
        payload={"state": state, "label": label},
    )


def _card(
    session_id: str,
    persona_id: str,
    card_type: str,
    title: str,
    body: list[str] | str,
) -> ShellEvent:
    return ShellEvent(
        type=EventType.CARD,
        session_id=session_id,
        persona_id=persona_id,
        payload={"card_type": card_type, "title": title, "body": body},
    )


def _actions(session_id: str, persona_id: str, items: list[dict[str, str]]) -> ShellEvent:
    return ShellEvent(
        type=EventType.ACTIONS,
        session_id=session_id,
        persona_id=persona_id,
        payload={"items": items},
    )


def _message_delta(session_id: str, persona_id: str, text: str) -> ShellEvent:
    return ShellEvent(
        type=EventType.MESSAGE_DELTA,
        session_id=session_id,
        persona_id=persona_id,
        payload={"text": text},
    )


def _done(session_id: str, persona_id: str) -> ShellEvent:
    return ShellEvent(
        type=EventType.DONE,
        session_id=session_id,
        persona_id=persona_id,
        payload={},
    )


def _build_scope_cards(message: str) -> list[ShellEvent]:
    topic = message.strip().rstrip("?.!") or "your idea"
    return [
        _card(
            "",
            "founder_og",
            "mvp_scope",
            "MVP scope",
            [
                f"Narrow {topic} to one painful workflow.",
                "Solve it for one user type in one channel.",
                "Defer integrations, admin panels, and polish.",
            ],
        ),
        _card(
            "",
            "founder_og",
            "next_steps",
            "Next 3 moves",
            [
                "Write a one-paragraph problem statement.",
                "List the smallest demo that proves value.",
                "Talk to 5 target users this week.",
            ],
        ),
        _card(
            "",
            "founder_og",
            "trade_offs",
            "Trade-offs to accept",
            [
                "Speed over completeness.",
                "Learning over perfect architecture.",
                "Manual ops over automation in v1.",
            ],
        ),
    ]


def _build_action_cards(action_id: str) -> list[ShellEvent]:
    if action_id == "trim_mvp":
        return [
            _card(
                "",
                "founder_og",
                "mvp_scope",
                "Trimmed MVP",
                [
                    "Keep one core user journey.",
                    "Remove anything that does not change a yes/no decision.",
                    "Target a 1-week build, not a 1-month roadmap.",
                ],
            )
        ]
    if action_id == "estimate_effort":
        return [
            _card(
                "",
                "founder_og",
                "metric_snapshot",
                "Rough effort view",
                [
                    "Prototype: 3-5 days with existing tools.",
                    "Pilot with users: 1-2 weeks.",
                    "Production hardening: defer until signal is clear.",
                ],
            )
        ]
    if action_id == "launch_steps":
        return [
            _card(
                "",
                "founder_og",
                "checklist",
                "Launch checklist",
                [
                    "Define success metric for week one.",
                    "Prepare a 3-minute demo script.",
                    "Collect feedback in a single shared doc.",
                ],
            )
        ]
    return [
        _card(
            "",
            "founder_og",
            "summary",
            "Founder OG says",
            ["Tell me more about the user and the pain point you want to solve first."],
        )
    ]


async def run_founder_scope_workflow(
    session_id: str,
    persona_id: str,
    message: str,
    action_id: str | None = None,
) -> AsyncIterator[ShellEvent]:
    yield _status(session_id, persona_id, "thinking", "Founder OG is scoping your MVP")
    await asyncio.sleep(0.35)

    if action_id:
        intro = "Refining based on your follow-up."
        cards = _build_action_cards(action_id)
    else:
        intro = "Here is a tight founder-style plan to get you moving."
        cards = _build_scope_cards(message)

    yield _message_delta(session_id, persona_id, intro)
    await asyncio.sleep(0.2)

    for card in cards:
        card.session_id = session_id
        card.persona_id = persona_id
        yield card
        await asyncio.sleep(0.15)

    yield _actions(
        session_id,
        persona_id,
        [
            {"id": "trim_mvp", "label": "Trim to MVP"},
            {"id": "estimate_effort", "label": "Estimate effort"},
            {"id": "launch_steps", "label": "Draft launch steps"},
        ],
    )
    yield _done(session_id, persona_id)
