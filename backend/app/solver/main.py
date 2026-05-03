"""Punto de entrada del solver.

Ejecutar desde `astar_robot_amazon/`:

    python -m backend.app.solver.main                    # 10 iteraciones detalladas (default)
    python -m backend.app.solver.main --completa         # detalle de todas (archivo grande)
    python -m backend.app.solver.main --detalle 20       # detalle de las primeras 20
    python -m backend.app.solver.main > salidas/traza_corrida_final.txt
"""
from __future__ import annotations

import argparse
import sys

from .astar import a_estrella
from .estado import ESTADO_INICIAL, POS_OBJETIVO, es_objetivo
from .heuristica import heuristica
from .traza import render_tablero


def _imprimir_encabezado(salida) -> None:
    print("============================================================", file=salida)
    print("  A* - Robot Amazon (matriz 4x4, 3 inventarios)", file=salida)
    print("  Heuristica: Distancia de Manhattan", file=salida)
    print("  Coste por accion: g = 1", file=salida)
    print("============================================================", file=salida)
    print("", file=salida)
    print("Estado inicial:", file=salida)
    print(render_tablero(ESTADO_INICIAL), file=salida)
    print("", file=salida)
    print(
        f"  h(inicial) = {heuristica(ESTADO_INICIAL)}    "
        f"(g=0, f = g + h = {heuristica(ESTADO_INICIAL)})",
        file=salida,
    )
    print("", file=salida)
    print("Objetivos: M1 -> {} ; M2 -> {} ; M3 -> {}".format(*POS_OBJETIVO), file=salida)
    print("", file=salida)


def _imprimir_resultado(resultado, salida) -> None:
    print("", file=salida)
    print("============================================================", file=salida)
    print("  RESULTADO", file=salida)
    print("============================================================", file=salida)
    if not resultado.encontrado:
        print("  No se encontro solucion.", file=salida)
        return

    print(f"  Iteraciones (nodos expandidos): {resultado.iteraciones}", file=salida)
    print(f"  Nodos generados:                {resultado.nodos_generados}", file=salida)
    print(f"  Coste total (g del objetivo):   {resultado.nodo_objetivo.g}", file=salida)
    print(f"  Longitud de la secuencia:       {len(resultado.camino)}", file=salida)
    print("", file=salida)
    print("Secuencia de acciones (estado inicial -> objetivo):", file=salida)
    for i, accion in enumerate(resultado.camino, start=1):
        print(f"  {i:2d}. {accion}", file=salida)


def _parsear_args(argv: list[str] | None = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Solver A* - Robot Amazon")
    p.add_argument(
        "--detalle",
        type=int,
        default=10,
        help="Iteraciones impresas en detalle (resto se resume). Default: 10.",
    )
    p.add_argument(
        "--completa",
        action="store_true",
        help="Imprime todas las iteraciones en detalle (archivo grande).",
    )
    return p.parse_args(argv)


def main(argv: list[str] | None = None, salida=sys.stdout) -> int:
    args = _parsear_args(argv)
    detalle = None if args.completa else args.detalle

    _imprimir_encabezado(salida)
    resultado = a_estrella(
        ESTADO_INICIAL,
        es_objetivo=es_objetivo,
        salida=salida,
        iteraciones_detalladas=detalle,
    )
    _imprimir_resultado(resultado, salida)
    return 0 if resultado.encontrado else 1


if __name__ == "__main__":
    raise SystemExit(main())
