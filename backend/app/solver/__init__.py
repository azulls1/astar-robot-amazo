"""Solver A* para el problema del robot Amazon.

Núcleo del algoritmo, sin dependencias fuera de la stdlib.
La spec que manda aquí es `Requerimientos de la actividad/01_especificacion_problema.md`
y el contrato técnico es `05_stack_tecnologico.md`.
"""
from .acciones import Accion, TipoAccion, aplicar, sucesores
from .astar import Resultado, a_estrella
from .estado import (
    ESTADO_INICIAL,
    NOMBRES_INV,
    PAREDES,
    POS_OBJETIVO,
    Estado,
    Posicion,
    dentro_tablero,
    en_pared,
    es_objetivo,
)
from .frontera import Frontera
from .heuristica import heuristica, manhattan
from .nodo import Nodo, reconstruir_camino

__all__ = [
    "Accion",
    "ESTADO_INICIAL",
    "Estado",
    "Frontera",
    "NOMBRES_INV",
    "Nodo",
    "PAREDES",
    "POS_OBJETIVO",
    "Posicion",
    "Resultado",
    "TipoAccion",
    "a_estrella",
    "aplicar",
    "dentro_tablero",
    "en_pared",
    "es_objetivo",
    "heuristica",
    "manhattan",
    "reconstruir_camino",
    "sucesores",
]
