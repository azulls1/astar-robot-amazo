"""Configuración de la aplicación. Variables vienen de entorno (.env)."""
from __future__ import annotations

from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


# Raíz del proyecto = .../astar_robot_amazon/
PROYECTO_DIR = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(PROYECTO_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # API
    api_title: str = "A* Robot Amazon API"
    api_version: str = "1.0.0"
    cors_origins: str = "http://localhost:4200,http://127.0.0.1:4200"

    # Celery / Redis
    redis_url: str = "redis://localhost:6379/0"
    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/1"

    # Rutas
    proyecto_dir: Path = PROYECTO_DIR
    salidas_dir: Path = PROYECTO_DIR / "salidas"
    memoria_dir: Path = PROYECTO_DIR / "memoria"
    entregables_dir: Path = PROYECTO_DIR / "entregables"
    requerimientos_dir: Path = PROYECTO_DIR.parent / "Requerimientos de la actividad"

    @property
    def origenes_cors(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
