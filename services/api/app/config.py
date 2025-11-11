from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    api_port: int = 8000
    persona_default_id: str = "strategist"
    persona_registry_path: Path = (
        Path(__file__).resolve().parents[3]
        / "packages"
        / "persona-config"
        / "personas"
        / "default.json"
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()
