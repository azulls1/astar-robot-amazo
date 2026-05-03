"""Modelos Pydantic para la API."""
from __future__ import annotations

from typing import Literal
from pydantic import BaseModel, Field


class PosicionDTO(BaseModel):
    fila: int
    columna: int


class EstadoDTO(BaseModel):
    robot: PosicionDTO
    cargando: str | None = Field(None, description="M1, M2, M3 o None")
    inventarios: dict[str, PosicionDTO]


class AccionDTO(BaseModel):
    paso: int
    tipo: Literal["mover", "cargar", "descargar"]
    inventario: str | None = None
    destino: PosicionDTO
    descripcion: str


class IteracionDTO(BaseModel):
    n: int
    estado: EstadoDTO
    g: int
    h: int
    f: int
    abierta_size: int
    cerrada_size: int


class SolveResponse(BaseModel):
    encontrado: bool
    iteraciones: int
    nodos_generados: int
    coste_total: int
    h_inicial: int
    secuencia: list[AccionDTO]
    iteraciones_detalle: list[IteracionDTO]


class EntregableDTO(BaseModel):
    id: str
    nombre: str
    descripcion: str
    archivo: str
    tamano_bytes: int
    url_descarga: str
    tipo_mime: str


class ArquitecturaDTO(BaseModel):
    titulo: str
    descripcion: str
    capas: list[dict]
    flujo: list[str]
