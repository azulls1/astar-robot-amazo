"""Acciones del robot y generación de sucesores.

Reglas (según `01_especificacion_problema.md`):
- 4 movimientos cardinales, coste 1.
- El robot no puede entrar a paredes, salir del tablero ni pisar una celda
  ocupada por un inventario que no esté cargando.
- Cargar y descargar se hacen desde celda **adyacente** al inventario
  (decisión del equipo, registrada también en la memoria). El robot no pisa
  la celda del inventario.
- En la notación del enunciado, "fila{f} columna{c}" se refiere a:
    * MOVER     → nueva celda del robot.
    * CARGAR    → celda donde está el inventario que se va a tomar.
    * DESCARGAR → celda donde queda el inventario después de soltarlo.
"""
from __future__ import annotations

from dataclasses import dataclass
from enum import Enum

from .estado import (
    Estado,
    NOMBRES_INV,
    Posicion,
    dentro_tablero,
    en_pared,
)


# ============================================================
# Tipos de acción
# ============================================================

class TipoAccion(Enum):
    MOVER = "mover"
    CARGAR = "cargar"
    DESCARGAR = "descargar"


@dataclass(frozen=True, slots=True)
class Accion:
    """Acción ejecutable del robot.

    Atributos:
        tipo:        MOVER | CARGAR | DESCARGAR.
        destino:     Celda referida por la acción (ver docstring del módulo).
        inventario:  Índice del inventario (0=M1, 1=M2, 2=M3); None si MOVER.
    """

    tipo: TipoAccion
    destino: Posicion
    inventario: int | None = None

    def __str__(self) -> str:
        f, c = self.destino
        if self.tipo is TipoAccion.MOVER:
            return f"mover R fila{f} columna{c}"
        nombre = NOMBRES_INV[self.inventario]  # type: ignore[index]
        return f"{self.tipo.value} R {nombre} fila{f} columna{c}"


# Vecinos en orden fijo: arriba, abajo, izquierda, derecha. El orden afecta
# el orden de generación de sucesores y, por tanto, el desempate cuando A*
# explora; mantenerlo estable hace la traza reproducible.
DELTAS: tuple[Posicion, ...] = ((-1, 0), (1, 0), (0, -1), (0, 1))


# ============================================================
# Aplicación de acciones (transición de estado)
# ============================================================

def aplicar(estado: Estado, accion: Accion) -> Estado:
    """Devuelve el nuevo estado tras aplicar `accion`. No valida precondiciones:
    se asume que `accion` proviene de `sucesores(estado)`.
    """
    if accion.tipo is TipoAccion.MOVER:
        nuevo_robot = accion.destino
        # Si el robot carga un inventario, ese inventario lo acompaña.
        if estado.cargando is not None:
            inv = list(estado.inventarios)
            inv[estado.cargando] = nuevo_robot
            inventarios = (inv[0], inv[1], inv[2])
        else:
            inventarios = estado.inventarios
        return Estado(robot=nuevo_robot, cargando=estado.cargando, inventarios=inventarios)

    if accion.tipo is TipoAccion.CARGAR:
        i = accion.inventario  # type: ignore[assignment]
        inv = list(estado.inventarios)
        # Mientras el robot lo lleva, la posición del inventario coincide con la
        # del robot (convención fijada en estado.py).
        inv[i] = estado.robot
        return Estado(
            robot=estado.robot,
            cargando=i,
            inventarios=(inv[0], inv[1], inv[2]),
        )

    # DESCARGAR
    i = accion.inventario  # type: ignore[assignment]
    inv = list(estado.inventarios)
    inv[i] = accion.destino
    return Estado(
        robot=estado.robot,
        cargando=None,
        inventarios=(inv[0], inv[1], inv[2]),
    )


# ============================================================
# Generación de sucesores
# ============================================================

def _es_adyacente(a: Posicion, b: Posicion) -> bool:
    return abs(a[0] - b[0]) + abs(a[1] - b[1]) == 1


def sucesores(estado: Estado) -> list[tuple[Accion, Estado]]:
    """Pares (acción, estado_resultante) de todas las transiciones legales
    desde `estado`. Orden fijo: MOVER (arriba/abajo/izq/der) → CARGAR → DESCARGAR.
    """
    salida: list[tuple[Accion, Estado]] = []

    # 1) MOVER en 4 direcciones.
    f_r, c_r = estado.robot
    for df, dc in DELTAS:
        destino = (f_r + df, c_r + dc)
        if not dentro_tablero(destino):
            continue
        if en_pared(destino):
            continue
        # No puede pisar celda con un inventario que no carga.
        if estado.inventario_en(destino) is not None:
            continue
        a = Accion(TipoAccion.MOVER, destino=destino)
        salida.append((a, aplicar(estado, a)))

    # 2) CARGAR un inventario adyacente (solo si no lleva nada).
    if estado.cargando is None:
        for i, pos_inv in enumerate(estado.inventarios):
            if _es_adyacente(estado.robot, pos_inv):
                a = Accion(TipoAccion.CARGAR, destino=pos_inv, inventario=i)
                salida.append((a, aplicar(estado, a)))

    # 3) DESCARGAR el inventario cargado en una celda adyacente libre.
    else:
        for df, dc in DELTAS:
            destino = (f_r + df, c_r + dc)
            if not dentro_tablero(destino):
                continue
            if en_pared(destino):
                continue
            if estado.inventario_en(destino) is not None:
                continue
            a = Accion(TipoAccion.DESCARGAR, destino=destino, inventario=estado.cargando)
            salida.append((a, aplicar(estado, a)))

    return salida
