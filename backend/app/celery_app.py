"""Celery app — broker Redis. Ejecutar worker:

    celery -A backend.app.celery_app worker --loglevel=info
"""
from __future__ import annotations

from celery import Celery

from .core.config import settings


celery_app = Celery(
    "astar_robot_amazon",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=["backend.app.tasks.solver_task"],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="America/Mexico_City",
    enable_utc=True,
    task_track_started=True,
    result_expires=3600,
)
