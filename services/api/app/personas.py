from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional

from .config import get_settings


class PersonaRepository:
    def __init__(self, registry_path: Path) -> None:
        self._registry_path = registry_path
        self._data = self._load_registry()

    def _load_registry(self) -> Dict[str, Any]:
        with self._registry_path.open("r", encoding="utf-8") as fp:
            return json.load(fp)

    @property
    def personas(self) -> List[Dict[str, Any]]:
        return list(self._data.get("personas", []))

    @property
    def default_persona_id(self) -> str:
        return str(self._data.get("defaultPersonaId"))

    def get_persona(self, persona_id: str) -> Optional[Dict[str, Any]]:
        return next((p for p in self.personas if p.get("id") == persona_id), None)


_repository: PersonaRepository | None = None


def get_repository() -> PersonaRepository:
    global _repository
    if _repository is None:
        settings = get_settings()
        _repository = PersonaRepository(settings.persona_registry_path)
    return _repository
