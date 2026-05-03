"""Formateo de la traza de A* (criterio 3 de la rúbrica).

La memoria exige mostrar, por iteración, el contenido de la lista abierta y
de la cerrada con `g`, `h`, `f` por nodo. Aquí se centraliza el formateo
para que la salida sea reproducible y se pueda anexar tal cual al documento.
"""
from __future__ import annotations

from typing import Iterable, TextIO

from .estado import COLUMNAS, Estado, FILAS, NOMBRES_INV, PAREDES
from .nodo import Nodo


def _resumen_estado(estado: Estado) -> str:
    """Línea compacta que identifica un estado: `R(f,c) [carga=Mi] M1(f,c) M2(f,c) M3(f,c)`."""
    f, c = estado.robot
    carga = NOMBRES_INV[estado.cargando] if estado.cargando is not None else "-"
    invs = " ".join(
        f"{NOMBRES_INV[i]}({estado.inventarios[i][0]},{estado.inventarios[i][1]})"
        for i in range(3)
    )
    return f"R({f},{c}) carga={carga} {invs}"


def render_tablero(estado: Estado) -> str:
    """Tablero 4x4 ASCII. Útil para mostrar el estado inicial / objetivo."""
    grid: list[list[str]] = [["  " for _ in range(COLUMNAS)] for _ in range(FILAS)]
    for f, c in PAREDES:
        grid[f][c] = "##"
    for i, (f, c) in enumerate(estado.inventarios):
        if i == estado.cargando:
            continue  # viaja con el robot
        grid[f][c] = NOMBRES_INV[i]
    rf, rc = estado.robot
    if estado.cargando is not None:
        grid[rf][rc] = f"R{NOMBRES_INV[estado.cargando][1]}"  # R1, R2, R3
    else:
        grid[rf][rc] = "R "

    bordes = "+" + "+".join(["----"] * COLUMNAS) + "+"
    filas = []
    for fila in grid:
        filas.append("| " + " | ".join(fila) + " |")
    cuerpo = []
    cuerpo.append(bordes)
    for f in filas:
        cuerpo.append(f)
        cuerpo.append(bordes)
    return "\n".join(cuerpo)


def linea_nodo(nodo: Nodo) -> str:
    return f"  [g={nodo.g} h={nodo.h} f={nodo.f}]  {_resumen_estado(nodo.estado)}"


def imprimir_iteracion_resumen(
    iteracion: int,
    expandido: Nodo,
    abierta: Iterable[Nodo],
    cerrada: dict[Estado, int],
    salida: TextIO,
) -> None:
    """Una línea por iteración: nodo expandido + tamaños de las listas.
    Pensado para iteraciones que ya no aportan didácticamente.
    """
    # Materializar para poder medir sin alterar el orden.
    abierta_lista = list(abierta)
    print(
        f"It {iteracion:3d} | expand {linea_nodo(expandido).strip()} "
        f"| |abierta|={len(abierta_lista):3d} |cerrada|={len(cerrada):3d}",
        file=salida,
    )


def imprimir_iteracion(
    iteracion: int,
    expandido: Nodo,
    abierta: Iterable[Nodo],
    cerrada: dict[Estado, int],
    salida: TextIO,
) -> None:
    """Vuelca el bloque de una iteración a `salida`."""
    print(f"=== Iteracion {iteracion} ===", file=salida)
    print("Nodo expandido:", file=salida)
    print(linea_nodo(expandido), file=salida)

    print("Lista ABIERTA (ordenada por f, luego h, luego FIFO):", file=salida)
    abierta_lista = list(abierta)
    if not abierta_lista:
        print("  (vacia)", file=salida)
    else:
        for n in abierta_lista:
            print(linea_nodo(n), file=salida)

    print("Lista CERRADA (estado -> mejor g):", file=salida)
    if not cerrada:
        print("  (vacia)", file=salida)
    else:
        # Orden estable: por g ascendente, luego por descripción del estado.
        items = sorted(cerrada.items(), key=lambda kv: (kv[1], _resumen_estado(kv[0])))
        for estado, g in items:
            print(f"  [g={g}]  {_resumen_estado(estado)}", file=salida)

    print("", file=salida)
