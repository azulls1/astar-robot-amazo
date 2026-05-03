"""Heurística admisible — Distancia de Manhattan.

`h(n)` se define en `01_especificacion_problema.md §5`. Resumen:

    h(n) = Σ manhattan(pos_actual(Mi), pos_objetivo(Mi))     (i = 1, 2, 3)
         + ajuste si el robot está libre y aún hay inventarios pendientes:
              max(0, manhattan(robot, inv_pendiente_más_cercano) - 1)

El término principal subestima el coste real porque:
- ignora paredes,
- ignora que cargar y descargar consumen una acción cada uno,
- ignora que la mecánica de carga/descarga obliga a estar adyacente.

El ajuste cuando el robot está libre captura que, aún sin paredes ni cargas,
el robot necesita acercarse al siguiente inventario antes de poder moverlo.
Restamos 1 porque cargar es desde celda adyacente, no sobre la celda.
"""
from __future__ import annotations

from .estado import Estado, POS_OBJETIVO, Posicion


def manhattan(p1: Posicion, p2: Posicion) -> int:
    return abs(p1[0] - p2[0]) + abs(p1[1] - p2[1])


def heuristica(estado: Estado) -> int:
    """`h(n)` admisible para el estado completo del problema."""
    h = 0
    for i in range(3):
        h += manhattan(estado.inventarios[i], POS_OBJETIVO[i])

    if estado.cargando is None:
        pendientes = [i for i in range(3) if estado.inventarios[i] != POS_OBJETIVO[i]]
        if pendientes:
            d_min = min(manhattan(estado.robot, estado.inventarios[i]) for i in pendientes)
            h += max(0, d_min - 1)

    return h
