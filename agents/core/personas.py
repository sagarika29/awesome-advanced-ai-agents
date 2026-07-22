from __future__ import annotations

import json
from pathlib import Path

from agents.core.events import PersonaOG

PERSONAS_DIR = Path(__file__).resolve().parent.parent / "personas"


def load_persona(persona_id: str) -> PersonaOG:
    path = PERSONAS_DIR / f"{persona_id}.json"
    if not path.exists():
        raise KeyError(f"Persona not found: {persona_id}")

    data = json.loads(path.read_text(encoding="utf-8"))
    return PersonaOG.model_validate(data)


def list_personas() -> list[PersonaOG]:
    personas: list[PersonaOG] = []
    for path in sorted(PERSONAS_DIR.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        personas.append(PersonaOG.model_validate(data))
    return personas
