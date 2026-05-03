"""Tarea Celery que ejecuta el solver A* en background.

Pensada para experimentos con configuraciones distintas o para no bloquear
el hilo HTTP en variantes futuras del problema (matrices mayores, más
inventarios). Para la corrida estándar el solver tarda <1 s y no requiere
worker; este módulo deja la pieza lista.
"""
from __future__ import annotations

from ..celery_app import celery_app
from ..solver import ESTADO_INICIAL, a_estrella, es_objetivo


@celery_app.task(name="solver.run_astar")
def run_astar() -> dict:
    resultado = a_estrella(ESTADO_INICIAL, es_objetivo=es_objetivo, salida=None)
    return {
        "encontrado": resultado.encontrado,
        "iteraciones": resultado.iteraciones,
        "nodos_generados": resultado.nodos_generados,
        "coste_total": resultado.nodo_objetivo.g if resultado.encontrado else None,
        "secuencia": [str(a) for a in resultado.camino],
    }
