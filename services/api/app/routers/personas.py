from fastapi import APIRouter, HTTPException

from ..personas import get_repository

router = APIRouter(prefix="/personas", tags=["personas"])


@router.get("/")
def list_personas():
    repo = get_repository()
    return {
        "defaultPersonaId": repo.default_persona_id,
        "personas": repo.personas,
    }


@router.get("/{persona_id}")
def get_persona(persona_id: str):
    repo = get_repository()
    persona = repo.get_persona(persona_id)
    if persona is None:
        raise HTTPException(status_code=404, detail="Persona not found")
    return persona
