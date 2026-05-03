"""Lista abierta de A* implementada como cola de prioridad.

Criterio de desempate (de mayor a menor prioridad):
1. Menor `f`.
2. Menor `h` (preferimos nodos cercanos al objetivo).
3. Orden FIFO: el insertado primero se expande primero.

`heapq` no permite empates ricos por sí solo, así que cada elemento se guarda
como tupla `(f, h, contador, nodo)` donde `contador` es un entero monótono
único por inserción que rompe empates de forma estable.
"""
from __future__ import annotations

import heapq
from itertools import count
from typing import Iterator

from .nodo import Nodo


class Frontera:
    """Cola de prioridad de nodos para A*. No deduplica por estado: la
    deduplicación se gestiona en `astar.py` consultando la lista cerrada.
    """

    def __init__(self) -> None:
        self._heap: list[tuple[int, int, int, Nodo]] = []
        self._contador = count()

    def __len__(self) -> int:
        return len(self._heap)

    def push(self, nodo: Nodo) -> None:
        heapq.heappush(self._heap, (nodo.f, nodo.h, next(self._contador), nodo))

    def pop(self) -> Nodo:
        return heapq.heappop(self._heap)[3]

    def vacia(self) -> bool:
        return not self._heap

    def snapshot_ordenado(self) -> list[Nodo]:
        """Lista de nodos pendientes ordenados como saldrían de la cola.
        Útil solo para imprimir la traza; no modifica la frontera.
        """
        return [item[3] for item in sorted(self._heap)]

    def __iter__(self) -> Iterator[Nodo]:
        return iter(self.snapshot_ordenado())
