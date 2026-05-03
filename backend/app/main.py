"""Aplicación FastAPI principal.

Levantar:
    uvicorn backend.app.main:app --reload --port 8000
"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routers import entregables, info, solver
from .core.config import settings


app = FastAPI(title=settings.api_title, version=settings.api_version)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origenes_cors,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(solver.router)
app.include_router(entregables.router)
app.include_router(info.router)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "service": settings.api_title, "version": settings.api_version}


@app.get("/")
def raiz() -> dict:
    return {
        "service": settings.api_title,
        "endpoints": [
            "/api/health",
            "/api/solver/inicial",
            "/api/solver/solve",
            "/api/entregables",
            "/api/info/arquitectura",
            "/api/info/algoritmo",
            "/api/info/problema",
            "/api/info/entrega",
            "/docs",
        ],
    }
