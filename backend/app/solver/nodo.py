"""Nodo del árbol de búsqueda de A*.

Cada `Nodo` referencia su padre, formando una cadena que permite reconstruir
el camino de acciones desde la raíz hasta cualquier nodo expandido.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from .acciones import Accion
from .estado import Estado


@dataclass(frozen=True, slots=True)
class Nodo:
    estado: Estado
    padre: Optional["Nodo"]
    accion: Accion | None  # None solo para la raíz
    g: int
    h: int

    @property
    def f(self) -> int:
        return self.g + self.h


def reconstruir_camino(nodo: Nodo) -> list[Accion]:
    """Lista de acciones desde la raíz hasta `nodo` (sin incluir la raíz)."""
    acciones: list[Accion] = []
    actual: Nodo | None = nodo
    while actual is not None and actual.accion is not None:
        acciones.append(actual.accion)
        actual = actual.padre
    acciones.reverse()
    return acciones
