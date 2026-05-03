"""Estado del problema A* del robot Amazon.

Modela el mundo en un instante: posición del robot, qué inventario carga
(si carga alguno) y dónde están los tres inventarios. Inmutable y hasheable
para vivir en una lista cerrada implementada como `set`.

Convenciones (alineadas con `01_especificacion_problema.md`):
- Matriz 4x4. Paredes en (0,1) y (1,1).
- Tres inventarios fijos: M1, M2, M3 en ese orden canónico.
- Si el robot está cargando un inventario, el inventario "viaja con él":
  su posición coincide con la del robot y la celda original queda libre.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Final


# ============================================================
# Constantes del problema (spec 01)
# ============================================================

FILAS: Final[int] = 4
COLUMNAS: Final[int] = 4

PAREDES: Final[frozenset[tuple[int, int]]] = frozenset({(0, 1), (1, 1)})

NOMBRES_INV: Final[tuple[str, str, str]] = ("M1", "M2", "M3")


Posicion = tuple[int, int]


# ============================================================
# Estado
# ============================================================

@dataclass(frozen=True, slots=True)
class Estado:
    """Estado del mundo en un instante de la búsqueda.

    Atributos:
        robot:        coordenada (fila, columna) del robot.
        cargando:     índice del inventario cargado (0=M1, 1=M2, 2=M3) o None.
        inventarios:  posiciones de M1, M2, M3 en ese orden. Si un inventario
                      está cargado, su entrada apunta a la posición del robot.
    """

    robot: Posicion
    cargando: int | None
    inventarios: tuple[Posicion, Posicion, Posicion]

    def nombre_cargando(self) -> str | None:
        return None if self.cargando is None else NOMBRES_INV[self.cargando]

    def inventario_en(self, p: Posicion) -> int | None:
        """Índice del inventario que físicamente ocupa `p`.

        El inventario cargado no ocupa celda física: viaja con el robot.
        """
        for i, q in enumerate(self.inventarios):
            if i == self.cargando:
                continue
            if q == p:
                return i
        return None


# ============================================================
# Predicados de tablero
# ============================================================

def en_pared(p: Posicion) -> bool:
    return p in PAREDES


def dentro_tablero(p: Posicion) -> bool:
    f, c = p
    return 0 <= f < FILAS and 0 <= c < COLUMNAS


# ============================================================
# Estado inicial y objetivo (spec 01)
# ============================================================

ESTADO_INICIAL: Final[Estado] = Estado(
    robot=(2, 2),
    cargando=None,
    inventarios=((0, 0), (2, 0), (0, 3)),
)

POS_OBJETIVO: Final[tuple[Posicion, Posicion, Posicion]] = (
    (3, 3),  # M1
    (3, 2),  # M2
    (3, 1),  # M3
)


def es_objetivo(estado: Estado) -> bool:
    """True si los 3 inventarios están en su posición objetivo y el robot
    no carga nada."""
    return estado.cargando is None and estado.inventarios == POS_OBJETIVO
