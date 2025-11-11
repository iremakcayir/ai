from fastapi import FastAPI

from .config import get_settings
from .routers import personas

app = FastAPI(title="AI Persona API")

app.include_router(personas.router)


@app.get("/health", tags=["system"])
def health_check():
    settings = get_settings()
    return {
        "status": "ok",
        "defaultPersonaId": settings.persona_default_id,
    }
