"""Algoritmo A* (núcleo evaluado por la rúbrica).

Implementación:
- Lista abierta = cola de prioridad ordenada por `f` (ver `frontera.py`).
- Lista cerrada = `dict[Estado, int]` con el mejor `g` conocido para cada
  estado. Si llega un nodo a un estado ya cerrado con `g` peor o igual, se
  descarta. Si llega con `g` mejor (suele pasar cuando la heurística no es
  consistente, aunque la nuestra sí lo es), se reabre.
- En cada iteración se vuelca a `salida` la información de los criterios 2 y 3
  de la rúbrica: `g`, `h`, `f` del nodo expandido y contenido de ambas listas.

La función devuelve un `Resultado` con métricas para que `main.py` y los tests
puedan verificar optimalidad y reconstruir el camino sin reparsing.
"""
from __future__ import annotations

import sys
from dataclasses import dataclass, field
from typing import TextIO

from .acciones import Accion, sucesores
from .estado import Estado
from .frontera import Frontera
from .heuristica import heuristica
from .nodo import Nodo, reconstruir_camino
from .traza import imprimir_iteracion, imprimir_iteracion_resumen


@dataclass(slots=True)
class Resultado:
    camino: list[Accion]
    nodo_objetivo: Nodo | None
    iteraciones: int
    nodos_generados: int
    encontrado: bool = field(init=False)

    def __post_init__(self) -> None:
        self.encontrado = self.nodo_objetivo is not None


def a_estrella(
    estado_inicial: Estado,
    *,
    es_objetivo,  # callable[[Estado], bool]
    salida: TextIO | None = sys.stdout,
    max_iteraciones: int | None = None,
    iteraciones_detalladas: int | None = None,
) -> Resultado:
    """Ejecuta A* desde `estado_inicial`. Vuelca la traza a `salida` (o nada
    si `salida is None`).
    """
    nodo_inicial = Nodo(
        estado=estado_inicial,
        padre=None,
        accion=None,
        g=0,
        h=heuristica(estado_inicial),
    )

    abierta = Frontera()
    abierta.push(nodo_inicial)
    cerrada: dict[Estado, int] = {}

    iteracion = 0
    nodos_generados = 1

    while not abierta.vacia():
        if max_iteraciones is not None and iteracion >= max_iteraciones:
            break
        iteracion += 1
        actual = abierta.pop()

        # Si ya cerramos este estado con un g <= al actual, lo saltamos sin
        # contarlo como iteración real (volvemos a la cabeza del while).
        if actual.estado in cerrada and cerrada[actual.estado] <= actual.g:
            iteracion -= 1
            continue

        cerrada[actual.estado] = actual.g

        if salida is not None:
            if iteraciones_detalladas is None or iteracion <= iteraciones_detalladas:
                imprimir_iteracion(iteracion, actual, abierta, cerrada, salida)
            else:
                imprimir_iteracion_resumen(iteracion, actual, abierta, cerrada, salida)

        if es_objetivo(actual.estado):
            return Resultado(
                camino=reconstruir_camino(actual),
                nodo_objetivo=actual,
                iteraciones=iteracion,
                nodos_generados=nodos_generados,
            )

        for accion, estado_sucesor in sucesores(actual.estado):
            g2 = actual.g + 1
            if estado_sucesor in cerrada and cerrada[estado_sucesor] <= g2:
                continue
            h2 = heuristica(estado_sucesor)
            sucesor = Nodo(
                estado=estado_sucesor,
                padre=actual,
                accion=accion,
                g=g2,
                h=h2,
            )
            abierta.push(sucesor)
            nodos_generados += 1

    return Resultado(
        camino=[],
        nodo_objetivo=None,
        iteraciones=iteracion,
        nodos_generados=nodos_generados,
    )
